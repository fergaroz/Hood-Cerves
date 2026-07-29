import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcastPush } from "@/lib/push";

export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authHeader = req.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;

  const url = new URL(req.url);
  if (url.searchParams.get("secret") === secret) return true;

  return false;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 1);

  const drinks = await prisma.drink.findMany({
    where: { createdAt: { gte: start, lt: end } },
    include: { person: true },
  });

  if (drinks.length === 0) {
    return NextResponse.json({ ok: true, sent: false, reason: "Sin bebidas ese mes" });
  }

  const totalLiters = drinks.reduce((sum, d) => sum + d.liters, 0);

  const totalsByPerson = new Map<string, { name: string; liters: number }>();
  for (const d of drinks) {
    const entry = totalsByPerson.get(d.personId) ?? { name: d.person.name, liters: 0 };
    entry.liters += d.liters;
    totalsByPerson.set(d.personId, entry);
  }

  const ranking = Array.from(totalsByPerson.values()).sort(
    (a, b) => b.liters - a.liters
  );
  const topLiters = ranking[0]?.liters ?? 0;
  const winners = ranking.filter((r) => Math.abs(r.liters - topLiters) < 0.005);

  const monthName = start.toLocaleDateString("es-ES", { month: "long" });
  const formatLiters = (n: number) => n.toFixed(2).replace(".", ",");

  function joinNames(names: string[]): string {
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} y ${names[1]}`;
    return `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`;
  }

  let body = `En este último mes (${monthName}) nos hemos tomado ${formatLiters(
    totalLiters
  )} L de cerveza. ¡Seguid así chavales!`;

  const namesJoined = joinNames(winners.map((w) => w.name));
  const verb = winners.length > 1 ? "son" : "es";
  const noun = winners.length > 1 ? "los borrachos" : "el borracho";
  body += `\n${namesJoined} ${verb} ${noun} del mes con ${formatLiters(
    topLiters
  )} L de cerveza. 🍺👑`;

  await broadcastPush({ title: "Hood Cerves - Resumen mensual", body });

  return NextResponse.json({ ok: true, sent: true, totalLiters, winners });
}

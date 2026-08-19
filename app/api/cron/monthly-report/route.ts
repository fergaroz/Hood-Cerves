import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcastPush } from "@/lib/push";
import { getMadridDateParts } from "@/lib/madridTime";

export const dynamic = "force-dynamic";

const MONTH_NAMES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authHeader = req.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;

  const url = new URL(req.url);
  if (url.searchParams.get("secret") === secret) return true;

  return false;
}

function formatLiters(n: number): string {
  return n.toFixed(2).replace(".", ",");
}

function joinNames(names: string[]): string {
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} y ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`;
}

type Entry = { personId: string; person: { name: string }; liters: number; createdAt: Date };

async function sendSectionReport(
  entries: Entry[],
  sectionLabel: string,
  medalEmoji: string,
  monthName: string
) {
  if (entries.length === 0) return { sent: false };

  const totalLiters = entries.reduce((sum, e) => sum + e.liters, 0);

  const totalsByPerson = new Map<string, { name: string; liters: number }>();
  for (const e of entries) {
    const entry = totalsByPerson.get(e.personId) ?? { name: e.person.name, liters: 0 };
    entry.liters += e.liters;
    totalsByPerson.set(e.personId, entry);
  }

  const ranking = Array.from(totalsByPerson.values()).sort((a, b) => b.liters - a.liters);
  const topLiters = ranking[0]?.liters ?? 0;
  const winners = ranking.filter((r) => Math.abs(r.liters - topLiters) < 0.005);
  const bottomLiters = ranking[ranking.length - 1]?.liters ?? 0;
  const losers = ranking.filter((r) => Math.abs(r.liters - bottomLiters) < 0.005);
  const hasSpread = Math.abs(topLiters - bottomLiters) >= 0.005;

  let body = `En este último mes (${monthName}) nos hemos tomado ${formatLiters(
    totalLiters
  )} L de ${sectionLabel}. ¡Seguid así chavales!`;

  const namesJoined = joinNames(winners.map((w) => w.name));
  const verb = winners.length > 1 ? "son" : "es";
  const noun = winners.length > 1 ? "los borrachos" : "el borracho";
  body += `\n${namesJoined} ${verb} ${noun} del mes con ${formatLiters(
    topLiters
  )} L de ${sectionLabel}. ${medalEmoji}👑`;

  if (hasSpread) {
    const loserNamesJoined = joinNames(losers.map((l) => l.name));
    const loserVerb = losers.length > 1 ? "son" : "es";
    const loserNoun = losers.length > 1 ? "los pussys" : "el pussy";
    body += `\n${loserNamesJoined} ${loserVerb} ${loserNoun} del mes con ${formatLiters(
      bottomLiters
    )} L de ${sectionLabel}.`;
  }

  await broadcastPush({ title: "Hood Cerves - Resumen mensual", body });

  const dayMap = new Map<string, { day: number; month: number; liters: number }>();
  for (const e of entries) {
    const { month, day } = getMadridDateParts(new Date(e.createdAt));
    const key = `${month}-${day}`;
    const entry = dayMap.get(key) ?? { day, month, liters: 0 };
    entry.liters += e.liters;
    dayMap.set(key, entry);
  }

  let bestDay: { day: number; month: number; liters: number } | null = null;
  for (const v of dayMap.values()) {
    if (!bestDay || v.liters > bestDay.liters) bestDay = v;
  }

  if (bestDay) {
    const dayBody = `📅 El día que más se bebió ${sectionLabel} fue el ${
      bestDay.day
    } de ${MONTH_NAMES[bestDay.month]}, con ${formatLiters(bestDay.liters)} L en total.`;
    await broadcastPush({ title: "Hood Cerves - Resumen mensual", body: dayBody });
  }

  return { sent: true, totalLiters, winners: winners.map((w) => w.name) };
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthName = MONTH_NAMES[start.getMonth()];

  const [drinks, cubatas] = await Promise.all([
    prisma.drink.findMany({
      where: { createdAt: { gte: start, lt: end } },
      include: { person: true },
    }),
    prisma.cubata.findMany({
      where: { createdAt: { gte: start, lt: end } },
      include: { person: true },
    }),
  ]);

  const beerResult = await sendSectionReport(drinks, "cerveza", "🍺", monthName);
  const cubataResult = await sendSectionReport(cubatas, "cubatas", "🍹", monthName);

  if (!beerResult.sent && !cubataResult.sent) {
    return NextResponse.json({ ok: true, sent: false, reason: "Sin bebidas ese mes" });
  }

  return NextResponse.json({ ok: true, beer: beerResult, cubatas: cubataResult });
}

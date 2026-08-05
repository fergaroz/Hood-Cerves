import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const KEEP_DAYS = 30;

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authHeader = req.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;

  const url = new URL(req.url);
  return url.searchParams.get("secret") === secret;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const people = await prisma.person.findMany({
    include: {
      drinks: { orderBy: { createdAt: "asc" } },
      cubatas: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "asc" },
  });

  const snapshot = {
    takenAt: new Date().toISOString(),
    people: people.map((p) => ({
      name: p.name,
      createdAt: p.createdAt,
      drinks: p.drinks.map((d) => ({
        liters: d.liters,
        label: d.label,
        createdAt: d.createdAt,
      })),
      cubatas: p.cubatas.map((c) => ({
        liters: c.liters,
        label: c.label,
        createdAt: c.createdAt,
      })),
    })),
  };

  await prisma.backup.create({ data: { data: JSON.stringify(snapshot) } });

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - KEEP_DAYS);
  await prisma.backup.deleteMany({ where: { createdAt: { lt: cutoff } } });

  return NextResponse.json({ ok: true, peopleBackedUp: people.length });
}

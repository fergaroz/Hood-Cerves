import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { madridWallClockToUtc } from "@/lib/madridTime";

export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authHeader = req.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;

  const url = new URL(req.url);
  return url.searchParams.get("secret") === secret;
}

const DRINKS = [
  { label: "Copa Mayri", liters: 0.4, y: 2026, mo: 7, d: 30, h: 21, mi: 7, s: 6 },
  { label: "Tercio", liters: 0.33, y: 2026, mo: 7, d: 30, h: 21, mi: 28, s: 35 },
  { label: "Tercio", liters: 0.33, y: 2026, mo: 7, d: 31, h: 22, mi: 24, s: 49 },
  { label: "Tercio", liters: 0.33, y: 2026, mo: 7, d: 31, h: 22, mi: 56, s: 28 },
  { label: "Tercio", liters: 0.33, y: 2026, mo: 7, d: 31, h: 23, mi: 27, s: 26 },
  { label: "Tercio", liters: 0.33, y: 2026, mo: 8, d: 1, h: 0, mi: 20, s: 27 },
  { label: "Botellín", liters: 0.2, y: 2026, mo: 8, d: 1, h: 16, mi: 27, s: 34 },
  { label: "Copa Mayri", liters: 0.4, y: 2026, mo: 8, d: 2, h: 16, mi: 26, s: 37 },
  { label: "Tercio", liters: 0.33, y: 2026, mo: 8, d: 3, h: 21, mi: 42, s: 23 },
  { label: "Tercio", liters: 0.33, y: 2026, mo: 8, d: 4, h: 21, mi: 45, s: 58 },
];

const CUBATAS = [
  { label: "Cubata", liters: 0.5, y: 2026, mo: 8, d: 2, h: 0, mi: 42, s: 1 },
];

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let person = await prisma.person.findFirst({ where: { name: "Preci" } });
  if (!person) {
    person = await prisma.person.create({ data: { name: "Preci" } });
  }

  const createdDrinks = await Promise.all(
    DRINKS.map((d) =>
      prisma.drink.create({
        data: {
          personId: person!.id,
          liters: d.liters,
          label: d.label,
          createdAt: madridWallClockToUtc(d.y, d.mo, d.d, d.h, d.mi, d.s),
        },
      })
    )
  );

  const createdCubatas = await Promise.all(
    CUBATAS.map((c) =>
      prisma.cubata.create({
        data: {
          personId: person!.id,
          liters: c.liters,
          label: c.label,
          createdAt: madridWallClockToUtc(c.y, c.mo, c.d, c.h, c.mi, c.s),
        },
      })
    )
  );

  return NextResponse.json({
    ok: true,
    personId: person.id,
    drinksCreated: createdDrinks.length,
    cubatasCreated: createdCubatas.length,
  });
}

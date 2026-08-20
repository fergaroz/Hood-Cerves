import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMadridDateParts } from "@/lib/madridTime";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const type = new URL(req.url).searchParams.get("type") ?? "drink";
  const personId = params.id;

  let entries: { liters: number; createdAt: Date }[];
  if (type === "cubata") {
    entries = await prisma.cubata.findMany({
      where: { personId },
      select: { liters: true, createdAt: true },
    });
  } else if (type === "sidra") {
    entries = await prisma.sidra.findMany({
      where: { personId },
      select: { liters: true, createdAt: true },
    });
  } else {
    entries = await prisma.drink.findMany({
      where: { personId },
      select: { liters: true, createdAt: true },
    });
  }

  const now = getMadridDateParts(new Date());
  const perDay = new Array(now.day + 1).fill(0);

  for (const e of entries) {
    const p = getMadridDateParts(new Date(e.createdAt));
    if (p.year === now.year && p.month === now.month && p.day <= now.day) {
      perDay[p.day] += e.liters;
    }
  }

  let cumulative = 0;
  const data = [];
  for (let day = 1; day <= now.day; day++) {
    cumulative += perDay[day];
    data.push({ day, liters: Number(cumulative.toFixed(2)) });
  }

  return NextResponse.json({ data });
}

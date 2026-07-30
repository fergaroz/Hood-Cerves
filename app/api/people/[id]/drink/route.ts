import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcastPush } from "@/lib/push";
import { resolveLabel } from "@/lib/quickSizes";
import { badgeEmojiSuffix, getBadgesCrossed } from "@/lib/badges";
import { getDailyMilestonesCrossed } from "@/lib/dailyMilestones";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json().catch(() => null);
  const liters = Number(body?.liters);
  const rawLabel = typeof body?.label === "string" ? body.label.slice(0, 40) : null;

  if (!Number.isFinite(liters) || liters <= 0 || liters > 5) {
    return NextResponse.json(
      { error: "Cantidad de litros inválida" },
      { status: 400 }
    );
  }

  const label = resolveLabel(liters, rawLabel);
  const personId = params.id;

  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const [totalAgg, dayAgg, person] = await Promise.all([
    prisma.drink.aggregate({ where: { personId }, _sum: { liters: true } }),
    prisma.drink.aggregate({
      where: { personId, createdAt: { gte: dayStart, lt: dayEnd } },
      _sum: { liters: true },
    }),
    prisma.person.findUnique({ where: { id: personId } }),
  ]);

  const prevTotal = totalAgg._sum.liters ?? 0;
  const prevDayTotal = dayAgg._sum.liters ?? 0;

  const drink = await prisma.drink.create({
    data: { liters, label, personId },
  });

  const newTotal = prevTotal + liters;
  const newDayTotal = prevDayTotal + liters;

  if (person) {
    await broadcastPush({
      title: "Hood Cerves",
      body: `¡${person.name} se acaba de tomar: ${label}!`,
    }).catch(() => null);

    const crossedBadges = getBadgesCrossed(prevTotal, newTotal);
    for (const badge of crossedBadges) {
      await broadcastPush({
        title: "Hood Cerves",
        body: `¡${person.name} acaba de conseguir un ${badge.name.toUpperCase()}!${badgeEmojiSuffix(
          badge.name
        )}`,
      }).catch(() => null);
    }

    const crossedMilestones = getDailyMilestonesCrossed(prevDayTotal, newDayTotal);
    for (const milestone of crossedMilestones) {
      const unit = milestone.liters === 1 ? "litro" : "litros";
      await broadcastPush({
        title: "Hood Cerves",
        body: `${person.name} acaba de beberse ${milestone.liters} ${unit}, ${milestone.message}`,
      }).catch(() => null);
    }
  }

  return NextResponse.json(drink, { status: 201 });
}

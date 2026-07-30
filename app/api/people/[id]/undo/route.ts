import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcastPush } from "@/lib/push";
import { resolveLabel } from "@/lib/quickSizes";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const lastDrink = await prisma.drink.findFirst({
    where: { personId: params.id },
    orderBy: { createdAt: "desc" },
  });

  if (!lastDrink) {
    return NextResponse.json({ ok: true, undone: false });
  }

  const [, person] = await Promise.all([
    prisma.drink.delete({ where: { id: lastDrink.id } }),
    prisma.person.findUnique({ where: { id: params.id } }),
  ]);

  if (person) {
    const what = resolveLabel(lastDrink.liters, lastDrink.label);
    await broadcastPush({
      title: "Hood Cerves",
      body: `¡${person.name} ha borrado su última bebida 🏳️‍🌈(${what})!`,
    }).catch(() => null);
  }

  return NextResponse.json({ ok: true, undone: true });
}

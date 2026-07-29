import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

  await prisma.drink.delete({ where: { id: lastDrink.id } });

  return NextResponse.json({ ok: true, undone: true });
}

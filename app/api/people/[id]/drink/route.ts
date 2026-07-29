import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json().catch(() => null);
  const liters = Number(body?.liters);

  if (!Number.isFinite(liters) || liters <= 0 || liters > 5) {
    return NextResponse.json(
      { error: "Cantidad de litros inválida" },
      { status: 400 }
    );
  }

  const drink = await prisma.drink.create({
    data: { liters, personId: params.id },
  });

  return NextResponse.json(drink, { status: 201 });
}

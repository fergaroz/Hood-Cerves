import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcastPush } from "@/lib/push";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json().catch(() => null);
  const liters = Number(body?.liters);
  const label = typeof body?.label === "string" ? body.label.slice(0, 40) : null;

  if (!Number.isFinite(liters) || liters <= 0 || liters > 5) {
    return NextResponse.json(
      { error: "Cantidad de litros inválida" },
      { status: 400 }
    );
  }

  const [drink, person] = await Promise.all([
    prisma.drink.create({
      data: { liters, label, personId: params.id },
    }),
    prisma.person.findUnique({ where: { id: params.id } }),
  ]);

  if (person) {
    const what = label ? label : `${liters}L`;
    await broadcastPush({
      title: "Hood Cerves",
      body: `¡${person.name} se acaba de tomar: ${what}!`,
    }).catch(() => null);
  }

  return NextResponse.json(drink, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { PersonWithTotal } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const people = await prisma.person.findMany({
    include: {
      drinks: { orderBy: { createdAt: "desc" } },
      cubatas: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "asc" },
  });

  const result: PersonWithTotal[] = people.map((p) => ({
    id: p.id,
    name: p.name,
    totalLiters: p.drinks.reduce((sum, d) => sum + d.liters, 0),
    lastDrinkId: p.drinks[0]?.id ?? null,
    totalCubataLiters: p.cubatas.reduce((sum, c) => sum + c.liters, 0),
    lastCubataId: p.cubatas[0]?.id ?? null,
  }));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!name || name.length > 40) {
    return NextResponse.json(
      { error: "Nombre inválido" },
      { status: 400 }
    );
  }

  const person = await prisma.person.create({ data: { name } });

  return NextResponse.json(person, { status: 201 });
}

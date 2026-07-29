import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function csvEscape(value: string): string {
  if (/[";\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const drinks = await prisma.drink.findMany({
    include: { person: true },
    orderBy: { createdAt: "asc" },
  });

  const header = ["Nombre", "Tipo", "Litros", "Fecha", "Hora"];
  const rows = drinks.map((d) => {
    const date = new Date(d.createdAt);
    return [
      d.person.name,
      d.label ?? "",
      d.liters.toFixed(2).replace(".", ","),
      date.toLocaleDateString("es-ES"),
      date.toLocaleTimeString("es-ES"),
    ];
  });

  const csvLines = [header, ...rows].map((row) =>
    row.map((cell) => csvEscape(String(cell))).join(";")
  );

  const csv = "﻿" + csvLines.join("\r\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="hood-cerves-export.csv"`,
    },
  });
}

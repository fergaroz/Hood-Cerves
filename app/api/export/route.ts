import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export async function GET() {
  const drinks = await prisma.drink.findMany({
    include: { person: true },
    orderBy: { createdAt: "asc" },
  });

  const workbook = new ExcelJS.Workbook();

  const registro = workbook.addWorksheet("Registro");
  registro.columns = [
    { header: "Nombre", key: "nombre", width: 20 },
    { header: "Tipo", key: "tipo", width: 16 },
    { header: "Litros", key: "litros", width: 10 },
    { header: "Fecha", key: "fecha", width: 14 },
    { header: "Hora", key: "hora", width: 12 },
  ];
  registro.getRow(1).font = { bold: true };

  for (const d of drinks) {
    const date = new Date(d.createdAt);
    registro.addRow({
      nombre: d.person.name,
      tipo: d.label ?? "",
      litros: Number(d.liters.toFixed(2)),
      fecha: date.toLocaleDateString("es-ES"),
      hora: date.toLocaleTimeString("es-ES"),
    });
  }

  type MonthlyEntry = {
    year: number;
    month: number;
    name: string;
    liters: number;
  };

  const monthlyMap = new Map<string, MonthlyEntry>();
  for (const d of drinks) {
    const date = new Date(d.createdAt);
    const year = date.getFullYear();
    const month = date.getMonth();
    const key = `${year}-${month}-${d.personId}`;
    const entry = monthlyMap.get(key) ?? {
      year,
      month,
      name: d.person.name,
      liters: 0,
    };
    entry.liters += d.liters;
    monthlyMap.set(key, entry);
  }

  const monthlyRows = Array.from(monthlyMap.values()).sort((a, b) => {
    const orderA = a.year * 12 + a.month;
    const orderB = b.year * 12 + b.month;
    if (orderA !== orderB) return orderA - orderB;
    return b.liters - a.liters;
  });

  const resumen = workbook.addWorksheet("Resumen mensual");
  resumen.columns = [
    { header: "Mes", key: "mes", width: 18 },
    { header: "Nombre", key: "nombre", width: 20 },
    { header: "Litros totales", key: "litros", width: 16 },
  ];
  resumen.getRow(1).font = { bold: true };

  for (const entry of monthlyRows) {
    resumen.addRow({
      mes: `${MONTH_NAMES[entry.month]} ${entry.year}`,
      nombre: entry.name,
      litros: Number(entry.liters.toFixed(2)),
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="hood-cerves-export.xlsx"`,
    },
  });
}

import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { formatMadridDate, formatMadridTime, getMadridYearMonth } from "@/lib/madridTime";

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

function addRegistroSheet(
  workbook: ExcelJS.Workbook,
  name: string,
  entries: { person: { name: string }; label: string | null; liters: number; createdAt: Date }[]
) {
  const sheet = workbook.addWorksheet(name);
  sheet.columns = [
    { header: "Nombre", key: "nombre", width: 20 },
    { header: "Tipo", key: "tipo", width: 16 },
    { header: "Litros", key: "litros", width: 10 },
    { header: "Fecha", key: "fecha", width: 14 },
    { header: "Hora", key: "hora", width: 12 },
  ];
  sheet.getRow(1).font = { bold: true };

  for (const entry of entries) {
    const date = new Date(entry.createdAt);
    sheet.addRow({
      nombre: entry.person.name,
      tipo: entry.label ?? "",
      litros: Number(entry.liters.toFixed(2)),
      fecha: formatMadridDate(date),
      hora: formatMadridTime(date),
    });
  }
}

export async function GET() {
  const [drinks, cubatas] = await Promise.all([
    prisma.drink.findMany({
      include: { person: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.cubata.findMany({
      include: { person: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const workbook = new ExcelJS.Workbook();

  addRegistroSheet(workbook, "Registro cervezas", drinks);
  addRegistroSheet(workbook, "Registro cubatas", cubatas);

  type MonthlyEntry = {
    year: number;
    month: number;
    name: string;
    liters: number;
  };

  const monthlyMap = new Map<string, MonthlyEntry>();
  for (const d of drinks) {
    const { year, month } = getMadridYearMonth(new Date(d.createdAt));
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

  const resumen = workbook.addWorksheet("Resumen mensual cervezas");
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

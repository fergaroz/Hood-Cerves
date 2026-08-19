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

type RegistroEntry = {
  personId: string;
  person: { name: string };
  label: string | null;
  liters: number;
  createdAt: Date;
};

type MonthlyEntry = { year: number; month: number; name: string; liters: number };

function addTableSheet(
  workbook: ExcelJS.Workbook,
  name: string,
  columns: { name: string; width: number }[],
  rows: (string | number)[][]
) {
  const sheet = workbook.addWorksheet(name);

  sheet.addTable({
    name: name.replace(/[^a-zA-Z0-9]/g, "_"),
    ref: "A1",
    headerRow: true,
    style: {
      theme: "TableStyleMedium9",
      showRowStripes: true,
    },
    columns: columns.map((c) => ({ name: c.name, filterButton: true })),
    rows: rows.length > 0 ? rows : [columns.map(() => "")],
  });

  columns.forEach((c, i) => {
    sheet.getColumn(i + 1).width = c.width;
  });
}

function computeMonthlyRows(entries: RegistroEntry[]): MonthlyEntry[] {
  const map = new Map<string, MonthlyEntry>();
  for (const e of entries) {
    const { year, month } = getMadridYearMonth(new Date(e.createdAt));
    const key = `${year}-${month}-${e.personId}`;
    const entry = map.get(key) ?? { year, month, name: e.person.name, liters: 0 };
    entry.liters += e.liters;
    map.set(key, entry);
  }

  return Array.from(map.values()).sort((a, b) => {
    const orderA = a.year * 12 + a.month;
    const orderB = b.year * 12 + b.month;
    if (orderA !== orderB) return orderA - orderB;
    return b.liters - a.liters;
  });
}

function registroRows(entries: RegistroEntry[]): (string | number)[][] {
  return entries.map((e) => {
    const date = new Date(e.createdAt);
    return [
      e.person.name,
      e.label ?? "",
      Number(e.liters.toFixed(2)),
      formatMadridDate(date),
      formatMadridTime(date),
    ];
  });
}

function monthlyRows(entries: MonthlyEntry[]): (string | number)[][] {
  return entries.map((e) => [
    `${MONTH_NAMES[e.month]} ${e.year}`,
    e.name,
    Number(e.liters.toFixed(2)),
  ]);
}

export async function GET() {
  const [drinks, cubatas, sidras] = await Promise.all([
    prisma.drink.findMany({
      include: { person: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.cubata.findMany({
      include: { person: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.sidra.findMany({
      include: { person: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const workbook = new ExcelJS.Workbook();

  const registroColumns = [
    { name: "Nombre", width: 20 },
    { name: "Tipo", width: 16 },
    { name: "Litros", width: 10 },
    { name: "Fecha", width: 14 },
    { name: "Hora", width: 12 },
  ];
  addTableSheet(workbook, "Registro cervezas", registroColumns, registroRows(drinks));
  addTableSheet(workbook, "Registro cubatas", registroColumns, registroRows(cubatas));
  addTableSheet(workbook, "Registro sidras", registroColumns, registroRows(sidras));

  const resumenColumns = [
    { name: "Mes", width: 18 },
    { name: "Nombre", width: 20 },
    { name: "Litros totales", width: 16 },
  ];
  addTableSheet(
    workbook,
    "Resumen mensual cervezas",
    resumenColumns,
    monthlyRows(computeMonthlyRows(drinks))
  );
  addTableSheet(
    workbook,
    "Resumen mensual cubatas",
    resumenColumns,
    monthlyRows(computeMonthlyRows(cubatas))
  );
  addTableSheet(
    workbook,
    "Resumen mensual sidras",
    resumenColumns,
    monthlyRows(computeMonthlyRows(sidras))
  );

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

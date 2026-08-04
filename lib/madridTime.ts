const MADRID_TZ = "Europe/Madrid";

export function formatMadridDate(date: Date): string {
  return date.toLocaleDateString("es-ES", { timeZone: MADRID_TZ });
}

export function formatMadridTime(date: Date): string {
  return date.toLocaleTimeString("es-ES", { timeZone: MADRID_TZ });
}

export function getMadridDateParts(date: Date): {
  year: number;
  month: number;
  day: number;
} {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: MADRID_TZ,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);

  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value) - 1;
  const day = Number(parts.find((p) => p.type === "day")?.value);

  return { year, month, day };
}

export function getMadridYearMonth(date: Date): { year: number; month: number } {
  const { year, month } = getMadridDateParts(date);
  return { year, month };
}

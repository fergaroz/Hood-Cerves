const MADRID_TZ = "Europe/Madrid";

export function formatMadridDate(date: Date): string {
  return date.toLocaleDateString("es-ES", { timeZone: MADRID_TZ });
}

export function formatMadridTime(date: Date): string {
  return date.toLocaleTimeString("es-ES", { timeZone: MADRID_TZ });
}

export function getMadridYearMonth(date: Date): { year: number; month: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: MADRID_TZ,
    year: "numeric",
    month: "numeric",
  }).formatToParts(date);

  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value) - 1;

  return { year, month };
}

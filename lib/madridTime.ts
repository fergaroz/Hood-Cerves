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

export function madridWallClockToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number
): Date {
  const guess = new Date(Date.UTC(year, month - 1, day, hour, minute, second));

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: MADRID_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(guess);

  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const renderedMillis = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second")
  );
  const targetMillis = Date.UTC(year, month - 1, day, hour, minute, second);

  return new Date(guess.getTime() + (targetMillis - renderedMillis));
}

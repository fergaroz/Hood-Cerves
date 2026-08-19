export const BADGES = [
  { name: "Sanguinario", threshold: 5 },
  { name: "Despiadado", threshold: 10 },
  { name: "Inexorable", threshold: 15 },
  { name: "Implacable", threshold: 20 },
  { name: "Brutal", threshold: 25 },
  { name: "Nuclear", threshold: 30 },
] as const;

export type Badge = (typeof BADGES)[number];

export function getCurrentBadge(totalLiters: number): Badge | null {
  let current: Badge | null = null;
  for (const badge of BADGES) {
    if (totalLiters >= badge.threshold) current = badge;
  }
  return current;
}

export function getBadgesCrossed(prevTotal: number, newTotal: number): Badge[] {
  return BADGES.filter((b) => prevTotal < b.threshold && newTotal >= b.threshold);
}

export function badgeEmojiSuffix(name: string): string {
  if (name === "Nuclear") return " ☢️";
  if (name === "Brutal") return " 💀";
  return "";
}

const NUCLEAR_THRESHOLD = BADGES.find((b) => b.name === "Nuclear")!.threshold;

export function getImparableLevel(totalLiters: number): number {
  if (totalLiters <= NUCLEAR_THRESHOLD) return 0;
  return Math.floor(totalLiters - NUCLEAR_THRESHOLD);
}

export function toRomanNumeral(num: number): string {
  if (num <= 0) return "";

  const values: [number, string][] = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];

  let n = num;
  let result = "";
  for (const [value, symbol] of values) {
    while (n >= value) {
      result += symbol;
      n -= value;
    }
  }
  return result;
}

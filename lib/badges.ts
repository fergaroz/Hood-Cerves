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

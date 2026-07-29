export const QUICK_SIZES = [
  { label: "Botellín", liters: 0.2 },
  { label: "Tercio", liters: 0.33 },
  { label: "Pinta", liters: 0.5 },
  { label: "Copa Mayri", liters: 0.4 },
  { label: "Litrona", liters: 1 },
];

export function resolveLabel(liters: number, providedLabel?: string | null): string {
  if (providedLabel) return providedLabel;
  const match = QUICK_SIZES.find((size) => Math.abs(size.liters - liters) < 0.005);
  return match ? match.label : `${liters}L`;
}

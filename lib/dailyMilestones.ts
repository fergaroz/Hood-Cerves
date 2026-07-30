export const DAILY_MILESTONES = [
  { liters: 1, message: "¡la que se está dando!" },
  { liters: 3, message: "¡no puede parar de beber!" },
] as const;

export function getDailyMilestonesCrossed(prevDayTotal: number, newDayTotal: number) {
  return DAILY_MILESTONES.filter(
    (m) => prevDayTotal < m.liters && newDayTotal >= m.liters
  );
}

export type PodiumEntry = { rank: 1 | 2 | 3; names: string[]; liters: number };

function Slot({ entry, medal }: { entry?: PodiumEntry; medal: string }) {
  if (!entry) return null;
  return (
    <div className={`podium-slot podium-${entry.rank}`}>
      <span className="podium-medal">{medal}</span>
      <span className="podium-names">{entry.names.join(", ")}</span>
      <span className="podium-liters">{entry.liters.toFixed(2)}L</span>
    </div>
  );
}

export function Podium({ entries }: { entries: PodiumEntry[] }) {
  const first = entries.find((e) => e.rank === 1);
  const second = entries.find((e) => e.rank === 2);
  const third = entries.find((e) => e.rank === 3);

  if (!first && !second && !third) return null;

  return (
    <div className="podium">
      <Slot entry={second} medal="🥈" />
      <Slot entry={first} medal="🥇" />
      <Slot entry={third} medal="🥉" />
    </div>
  );
}

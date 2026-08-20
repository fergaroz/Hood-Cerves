"use client";

export type HistoryPoint = { day: number; liters: number };

export function HistoryChart({ data }: { data: HistoryPoint[] | null }) {
  if (data === null) {
    return <p className="chart-empty">Cargando…</p>;
  }

  const totalThisMonth = data.length > 0 ? data[data.length - 1].liters : 0;

  if (data.length === 0 || totalThisMonth === 0) {
    return <p className="chart-empty">Sin datos este mes todavía</p>;
  }

  const width = 260;
  const height = 110;
  const maxLiters = Math.max(...data.map((d) => d.liters), 0.01);
  const maxDay = data[data.length - 1].day;

  const points = data
    .map((d) => {
      const x = maxDay > 1 ? (d.day - 1) * (width / (maxDay - 1)) : width / 2;
      const y = height - (d.liters / maxLiters) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height="100%"
      preserveAspectRatio="none"
    >
      <line
        x1="0"
        y1={height - 1}
        x2={width}
        y2={height - 1}
        stroke="#2a2c2e"
        strokeWidth="1"
      />
      <polyline
        points={points}
        fill="none"
        stroke="#f2b705"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

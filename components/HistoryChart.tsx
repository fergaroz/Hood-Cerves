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

  const width = 280;
  const height = 130;
  const marginLeft = 30;
  const marginRight = 8;
  const marginTop = 14;
  const marginBottom = 18;
  const plotWidth = width - marginLeft - marginRight;
  const plotHeight = height - marginTop - marginBottom;

  const maxLiters = Math.max(...data.map((d) => d.liters), 0.01);
  const midLiters = maxLiters / 2;
  const minDay = data[0].day;
  const maxDay = data[data.length - 1].day;

  const xFor = (day: number) =>
    marginLeft +
    (maxDay > minDay ? ((day - minDay) / (maxDay - minDay)) * plotWidth : plotWidth / 2);
  const yFor = (liters: number) =>
    marginTop + plotHeight - (liters / maxLiters) * plotHeight;

  const points = data
    .map((d) => `${xFor(d.day).toFixed(1)},${yFor(d.liters).toFixed(1)}`)
    .join(" ");

  const last = data[data.length - 1];
  const first = data[0];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
      {[0, midLiters, maxLiters].map((v, i) => (
        <g key={i}>
          <line
            x1={marginLeft}
            y1={yFor(v)}
            x2={width - marginRight}
            y2={yFor(v)}
            stroke="#2a2c2e"
            strokeWidth="1"
          />
          <text x={marginLeft - 5} y={yFor(v) + 3} fontSize="8" fill="#888" textAnchor="end">
            {v.toFixed(1)}
          </text>
        </g>
      ))}

      <text x={xFor(first.day)} y={height - 3} fontSize="8" fill="#888" textAnchor="start">
        día {first.day}
      </text>
      <text
        x={xFor(last.day)}
        y={height - 3}
        fontSize="8"
        fill="#888"
        textAnchor="end"
      >
        día {last.day}
      </text>

      <polyline
        points={points}
        fill="none"
        stroke="#f2b705"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx={xFor(last.day)} cy={yFor(last.liters)} r="3.5" fill="#f2b705" />
      <text
        x={Math.min(xFor(last.day), width - marginRight - 4)}
        y={Math.max(yFor(last.liters) - 8, marginTop + 8)}
        fontSize="11"
        fontWeight="700"
        fill="#f2b705"
        textAnchor="end"
      >
        {last.liters.toFixed(2)}L
      </text>
    </svg>
  );
}

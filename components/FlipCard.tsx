"use client";

import { useState } from "react";

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <rect x="3" y="14" width="4" height="7" rx="1" fill="#f2b705" />
      <rect x="9" y="10" width="4" height="11" rx="1" fill="#ef5b25" />
      <rect x="15" y="6" width="4" height="15" rx="1" fill="#ff3d7f" />
      <path
        d="M2 12 L9 6 L14 9 L21 3"
        stroke="#4ade80"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 3 L21 3 L21 8"
        stroke="#4ade80"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FlipCard({
  front,
  back,
  onShowBack,
}: {
  front: React.ReactNode;
  back: React.ReactNode;
  onShowBack?: () => void;
}) {
  const [flipped, setFlipped] = useState(false);

  function showBack() {
    onShowBack?.();
    setFlipped(true);
  }

  return (
    <div className="flip-card">
      <div className={`flip-card-inner ${flipped ? "flipped" : ""}`}>
        <div className="flip-card-face flip-card-front person-card">
          {front}
          <button
            className="chart-toggle"
            onClick={showBack}
            aria-label="Ver evolución"
          >
            <ChartIcon />
          </button>
        </div>
        <div className="flip-card-face flip-card-back person-card">
          {back}
          <button
            className="chart-toggle"
            onClick={() => setFlipped(false)}
            aria-label="Volver"
          >
            ↩
          </button>
        </div>
      </div>
    </div>
  );
}

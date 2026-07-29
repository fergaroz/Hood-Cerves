"use client";

export function BeerJar({ ratio }: { ratio: number }) {
  const clamped = Math.max(0, Math.min(1, ratio));
  const fillHeight = 78 * clamped;
  const fillY = 96 - fillHeight;

  return (
    <svg viewBox="0 0 60 100" width="100%" height="100%" aria-hidden="true">
      <defs>
        <clipPath id={`jar-clip`}>
          <path d="M8 14 H44 V18 H48 A6 6 0 0 1 54 24 V50 A6 6 0 0 1 48 56 H44 V92 A4 4 0 0 1 40 96 H12 A4 4 0 0 1 8 92 Z" />
        </clipPath>
      </defs>

      <path
        d="M8 14 H44 V18 H48 A6 6 0 0 1 54 24 V50 A6 6 0 0 1 48 56 H44 V92 A4 4 0 0 1 40 96 H12 A4 4 0 0 1 8 92 Z"
        fill="#0f1011"
        stroke="#3a3c3e"
        strokeWidth="2"
      />

      <g clipPath="url(#jar-clip)">
        <rect
          x="4"
          y={fillY}
          width="52"
          height={fillHeight}
          fill="#f2b705"
        />
        {clamped > 0 && (
          <rect x="4" y={fillY} width="52" height="3" fill="#fff3c4" opacity="0.8" />
        )}
      </g>

      <path
        d="M8 14 H44 V18 H48 A6 6 0 0 1 54 24 V50 A6 6 0 0 1 48 56 H44 V92 A4 4 0 0 1 40 96 H12 A4 4 0 0 1 8 92 Z"
        fill="none"
        stroke="#3a3c3e"
        strokeWidth="2"
      />
      <rect x="8" y="8" width="36" height="8" rx="2" fill="#3a3c3e" />
    </svg>
  );
}

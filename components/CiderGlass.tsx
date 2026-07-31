"use client";

export function CiderGlass({ ratio }: { ratio: number }) {
  const clamped = Math.max(0, Math.min(1, ratio));
  const fillHeight = 82 * clamped;
  const fillY = 96 - fillHeight;

  const glassPath = "M14 6 H46 L40 96 H20 Z";

  return (
    <svg viewBox="0 0 60 100" width="100%" height="100%" aria-hidden="true">
      <defs>
        <clipPath id="cider-clip">
          <path d={glassPath} />
        </clipPath>
      </defs>

      <path d={glassPath} fill="#0f1011" stroke="#3a3c3e" strokeWidth="2" />

      <g clipPath="url(#cider-clip)">
        <rect x="12" y={fillY} width="36" height={fillHeight} fill="#f2b705" />
        {clamped > 0 && (
          <rect x="12" y={fillY} width="36" height={3} fill="#fff3c4" opacity="0.8" />
        )}
      </g>

      <path d={glassPath} fill="none" stroke="#3a3c3e" strokeWidth="2" />
    </svg>
  );
}

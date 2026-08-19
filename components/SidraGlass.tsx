"use client";

export function SidraGlass({ ratio }: { ratio: number }) {
  const clamped = Math.max(0, Math.min(1, ratio));
  const fillHeight = 60 * clamped;
  const fillY = 96 - fillHeight;

  const glassPath = "M10 34 H50 L44 96 H16 Z";

  const crossD =
    "M30 42 V78 M22 52 H38" +
    " M30 42 L27 39 M30 42 L33 39" +
    " M30 78 L27 81 M30 78 L33 81" +
    " M22 52 L19 49 M22 52 L19 55" +
    " M38 52 L41 49 M38 52 L41 55";

  return (
    <svg viewBox="0 0 60 100" width="100%" height="100%" aria-hidden="true">
      <defs>
        <clipPath id="sidra-clip">
          <path d={glassPath} />
        </clipPath>
      </defs>

      <path d={glassPath} fill="#0f1011" stroke="#3a3c3e" strokeWidth="2" />

      <g clipPath="url(#sidra-clip)">
        <rect x="10" y={fillY} width="40" height={fillHeight} fill="#f2b705" />
        {clamped > 0 && (
          <rect x="10" y={fillY} width="40" height={3} fill="#fff3c4" opacity="0.8" />
        )}
      </g>

      <path d={glassPath} fill="none" stroke="#3a3c3e" strokeWidth="2" />

      <g clipPath="url(#sidra-clip)">
        <path
          d={crossD}
          fill="none"
          stroke="#000"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d={crossD}
          fill="none"
          stroke="#fff"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <text x="17" y="55" fontSize="6" fill="#fff" stroke="#000" strokeWidth="0.5">
          α
        </text>
        <text x="36" y="55" fontSize="6" fill="#fff" stroke="#000" strokeWidth="0.5">
          Ω
        </text>
      </g>
    </svg>
  );
}

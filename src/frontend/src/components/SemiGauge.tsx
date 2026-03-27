interface SemiGaugeProps {
  value: number;
  color: string;
  size?: number;
  showValue?: boolean;
}

export function SemiGauge({
  value,
  color,
  size = 90,
  showValue = true,
}: SemiGaugeProps) {
  const r = 36;
  const cx = 50;
  const cy = 46;
  const strokeW = 7;

  const clamped = Math.max(0.5, Math.min(99.5, value));
  const angleRad = Math.PI - (clamped / 100) * Math.PI;

  const ex = cx + r * Math.cos(angleRad);
  const ey = cy - r * Math.sin(angleRad);

  const x1 = cx - r;
  const y1 = cy;
  const x2 = cx + r;

  const largeArc = clamped > 50 ? 1 : 0;

  return (
    <svg
      viewBox="0 0 100 54"
      style={{ width: size, height: size * 0.6 }}
      aria-hidden="true"
    >
      <title>Signal strength gauge</title>
      <path
        d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y1}`}
        fill="none"
        stroke="#242C36"
        strokeWidth={strokeW}
        strokeLinecap="round"
      />
      <path
        d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`}
        fill="none"
        stroke={color}
        strokeWidth={strokeW}
        strokeLinecap="round"
      />
      <circle cx={ex.toFixed(2)} cy={ey.toFixed(2)} r="4" fill={color} />
      {showValue && (
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fill="#F2F5F9"
          fontSize="13"
          fontWeight="700"
          fontFamily="GeneralSans, system-ui"
        >
          {Math.round(value)}%
        </text>
      )}
    </svg>
  );
}

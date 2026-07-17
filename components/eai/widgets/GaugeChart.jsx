'use client';

// Semi-circle SVG gauge — no recharts dependency.
// score: 0-100. Colors: green <40, amber 40-69, red >=70.
export default function GaugeChart({ score = 68, height = 110 }) {
  const R   = 72;
  const cx  = 100;
  const cy  = 96;
  // Arc from left (9-o'clock) counterclockwise through top to right (3-o'clock)
  // In SVG (y-down) this sweep goes UPWARD through the top → correct gauge shape.
  const d   = `M ${cx - R} ${cy} A ${R} ${R} 0 0 0 ${cx + R} ${cy}`;
  const len = Math.PI * R;
  const fill = (score / 100) * len;

  const color     = score >= 70 ? '#EF4444' : score >= 40 ? '#F59E0B' : '#00A36C';
  const riskLabel = score >= 70 ? 'High Risk' : score >= 40 ? 'Medium Risk' : 'Low Risk';

  return (
    <svg
      viewBox="0 0 200 112"
      style={{ width: '100%', height, display: 'block' }}
      aria-label={`Risk gauge: ${score}/100 — ${riskLabel}`}
    >
      {/* Track */}
      <path d={d} fill="none" stroke="#E2E8F0" strokeWidth={15} strokeLinecap="round" />
      {/* Score arc */}
      {score > 0 && (
        <path d={d} fill="none" stroke={color} strokeWidth={15} strokeLinecap="round"
          strokeDasharray={`${fill} ${len * 2}`} />
      )}
      {/* Score value */}
      <text x={cx} y={cy - 14} textAnchor="middle" fontSize={30} fontWeight={700}
        fill="#1A1F36" fontFamily="ui-monospace,monospace">{score}</text>
      <text x={cx + 24} y={cy - 18} textAnchor="start" fontSize={11}
        fill="#6B7280">/100</text>
      {/* Risk label */}
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize={11} fontWeight={700}
        fill={color}>{riskLabel}</text>
    </svg>
  );
}

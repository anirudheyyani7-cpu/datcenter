'use client';
// CampusSitePlan – 2D top-down building footprints on a campus lot.
// Props: { buildings: Node[], selectedId, onSelect }

const STATUS_FILL = {
  operational: { fill: 'rgba(34,197,94,0.20)',  stroke: '#22c55e' },
  maintenance:  { fill: 'rgba(249,115,22,0.20)', stroke: '#f97316' },
  critical:     { fill: 'rgba(239,68,68,0.20)',  stroke: '#ef4444' },
};
const DEFAULT_FILL = STATUS_FILL.operational;

export default function CampusSitePlan({ buildings = [], selectedId, onSelect, onDoubleSelect, dimIds }) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      {/* Ground / lot background */}
      <rect x="0" y="0" width="100" height="100" fill="#F8FAFC" rx="0" />
      {/* Parking / roads (decorative) */}
      <rect x="0"  y="93" width="100" height="7"  fill="#E2E8F0" />
      <rect x="48" y="0"  width="4"   height="100" fill="#E2E8F0" />
      {/* road center lines */}
      {[10,20,30,40,60,70,80,90].map(x => (
        <line key={x} x1={x} y1="93" x2={x} y2="100" stroke="#9CA3AF" strokeWidth="0.3" strokeDasharray="1.2 1" />
      ))}

      {/* Building footprints */}
      {buildings.map(bld => {
        const g    = bld.geo || { x: 20, y: 30, w: 30, h: 25 };
        const sel  = bld.id === selectedId;
        const dimmed = dimIds?.has(bld.id) ?? false;
        const theme = STATUS_FILL[bld.status] || DEFAULT_FILL;
        return (
          <g
            key={bld.id}
            style={{ cursor: 'pointer', opacity: dimmed ? 0.3 : 1, transition: 'opacity 0.15s' }}
            onClick={() => onSelect(bld.id)}
            onDoubleClick={() => onDoubleSelect?.(bld.id)}
          >
            {/* Shadow */}
            <rect
              x={g.x + 0.8} y={g.y + 0.8}
              width={g.w} height={g.h}
              fill="rgba(16,24,40,0.15)" rx="1"
            />
            {/* Main footprint */}
            <rect
              x={g.x} y={g.y}
              width={g.w} height={g.h}
              fill={theme.fill}
              stroke={sel ? '#1A1F36' : theme.stroke}
              strokeWidth={sel ? 0.6 : 0.3}
              rx="1"
            />
            {/* Roof hatching (decorative) */}
            <rect
              x={g.x + g.w * 0.1} y={g.y + g.h * 0.1}
              width={g.w * 0.8}   height={g.h * 0.8}
              fill="none"
              stroke={theme.stroke}
              strokeWidth="0.15"
              strokeDasharray="1 1"
              rx="0.5"
            />
            {/* Label */}
            <text
              x={g.x + g.w / 2} y={g.y + g.h / 2 - 1}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={Math.min(g.w, g.h) * 0.22}
              fontWeight="700"
              fill="#1A1F36"
              fontFamily="monospace"
            >
              {bld.name}
            </text>
            {/* Status dot */}
            <circle
              cx={g.x + g.w - 2} cy={g.y + 2}
              r="1.2"
              fill={theme.stroke}
            />
            {/* Floor count */}
            <text
              x={g.x + g.w / 2} y={g.y + g.h / 2 + 3}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={Math.min(g.w, g.h) * 0.14}
              fill="#6B7280"
              fontFamily="sans-serif"
            >
              {bld.children?.length ?? 0}F
            </text>
          </g>
        );
      })}

      {/* Compass */}
      <g transform="translate(94,6)">
        <circle cx="0" cy="0" r="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.3" />
        <text x="0" y="-1" textAnchor="middle" dominantBaseline="middle" fontSize="2.5" fill="#6B7280" fontWeight="700">N</text>
        <line x1="0" y1="-3.2" x2="0" y2="-1.5" stroke="#6B7280" strokeWidth="0.4" />
      </g>
    </svg>
  );
}

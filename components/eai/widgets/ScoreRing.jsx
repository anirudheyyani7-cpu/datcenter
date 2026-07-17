'use client';

// Full-circle ring gauge. score: 0–100, unit: '/100' | '%'.
// items (optional) rendered below ring: score-list or legend style.
export default function ScoreRing({
  score     = 0,
  unit      = '/100',
  color     = '#10B981',
  sublabel  = '',
  size      = 130,
  items     = [],
  legendStyle = false,
}) {
  const SW   = 14;
  const cx   = size / 2;
  const cy   = size / 2;
  const R    = cx - SW / 2 - 2;
  const C    = 2 * Math.PI * R;
  const fill = (Math.min(score, 100) / 100) * C;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      {/* Ring */}
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Track */}
          <circle
            cx={cx} cy={cy} r={R}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={SW}
          />
          {/* Arc */}
          <circle
            cx={cx} cy={cy} r={R}
            fill="none"
            stroke={color}
            strokeWidth={SW}
            strokeLinecap="round"
            strokeDasharray={`${fill} ${C}`}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        </svg>

        {/* Center text */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <span style={{ fontSize: size < 120 ? 24 : 28, fontWeight: 800, color: '#1A1F36', lineHeight: 1, fontFamily: 'ui-monospace,monospace' }}>
            {unit === '%' ? `${score}%` : score}
          </span>
          {unit !== '%' && (
            <span style={{ fontSize: 10, color: '#6B7280', marginTop: 1 }}>{unit}</span>
          )}
        </div>
      </div>

      {/* Sub-label (e.g. "+6 pts vs Apr '25") */}
      {sublabel && (
        <span style={{ fontSize: 9, color: color, fontWeight: 600 }}>{sublabel}</span>
      )}

      {/* Items below ring */}
      {items.length > 0 && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: legendStyle ? 5 : 7 }}>
          {legendStyle
            ? items.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0, display: 'inline-block' }} />
                  <span style={{ color: '#6B7280', flex: 1 }}>{item.label}</span>
                  <span style={{ color: '#1A1F36', fontWeight: 700 }}>{item.value}</span>
                </div>
              ))
            : items.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {item.Icon && <item.Icon size={11} style={{ color: item.color ?? '#6B7280', flexShrink: 0 }} />}
                  <span style={{ fontSize: 10, color: '#6B7280', flex: 1 }}>{item.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 40, height: 3, borderRadius: 2, background: '#E2E8F0', overflow: 'hidden' }}>
                      <div style={{ width: `${item.score ?? 0}%`, height: '100%', borderRadius: 2, background: item.color ?? '#0077C8' }} />
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#1A1F36', fontFamily: 'ui-monospace,monospace', width: 32, textAlign: 'right' }}>
                      {item.score}{unit}
                    </span>
                  </div>
                </div>
              ))
          }
        </div>
      )}
    </div>
  );
}

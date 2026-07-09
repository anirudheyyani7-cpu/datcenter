'use client';

// Ranked list of label + proportional bar + value.
// items: [{ label, value, color? }]
// maxValue: denominator for bar width (defaults to items[0].value)
export default function HorizontalBarList({ items = [], maxValue, unit = '', prefix = '', labelWidth = 64 }) {
  const max = maxValue ?? items[0]?.value ?? 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {items.map((item, i) => {
        const pct = Math.min(100, (item.value / max) * 100);
        const color = item.color ?? '#0077C8';
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            {/* Label */}
            <span style={{
              fontSize: 10, color: '#6B7280',
              width: labelWidth, flexShrink: 0,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {item.label}
            </span>
            {/* Bar track */}
            <div style={{ flex: 1, height: 5, borderRadius: 3, background: '#E2E8F0', overflow: 'hidden', minWidth: 0 }}>
              <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: color, transition: 'width 0.4s ease' }} />
            </div>
            {/* Value */}
            <span style={{ fontSize: 10, fontWeight: 700, color: '#1A1F36', width: 42, textAlign: 'right', flexShrink: 0, fontFamily: 'ui-monospace,monospace' }}>
              {prefix}{item.value.toLocaleString()}{unit}
            </span>
          </div>
        );
      })}
    </div>
  );
}

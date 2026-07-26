'use client';

// Ranked list of label + proportional bar + value.
// items: [{ label, value, color? }]
// maxValue: denominator for bar width (defaults to items[0].value)
// onItemClick(item) — optional; when set, rows become clickable/hoverable
// activeLabel — optional; highlights the row whose label matches, dims the rest
export default function HorizontalBarList({ items = [], maxValue, unit = '', prefix = '', labelWidth = 64, onItemClick, activeLabel }) {
  const max = maxValue ?? items[0]?.value ?? 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {items.map((item, i) => {
        const pct = Math.min(100, (item.value / max) * 100);
        const isActive = activeLabel === item.label;
        const isDimmed = activeLabel && !isActive;
        const color = isDimmed ? '#CBD5E1' : (item.color ?? '#0077C8');
        const Tag = onItemClick ? 'button' : 'div';
        return (
          <Tag
            key={i}
            type={onItemClick ? 'button' : undefined}
            onClick={onItemClick ? () => onItemClick(item) : undefined}
            className={onItemClick ? 'eai-focusable' : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, minWidth: 0,
              cursor: onItemClick ? 'pointer' : 'default',
              padding: '2px 4px', margin: '-2px -4px', borderRadius: 6,
              background: isActive ? '#F4F6F9' : 'transparent',
              opacity: isDimmed ? 0.55 : 1,
              transition: 'background 0.12s, opacity 0.12s',
              border: 'none', font: 'inherit', textAlign: 'left', width: 'calc(100% + 8px)',
            }}
            onMouseEnter={e => { if (onItemClick && !isActive) e.currentTarget.style.background = '#F8FAFC'; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
          >
            {/* Label */}
            <span style={{
              fontSize: 10, color: isActive ? '#1A1F36' : '#6B7280', fontWeight: isActive ? 700 : 400,
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
          </Tag>
        );
      })}
    </div>
  );
}

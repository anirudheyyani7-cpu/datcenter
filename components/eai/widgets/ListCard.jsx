'use client';

// Generic list card for alerts, news, maintenance
// variant: 'alerts' | 'news' | 'maintenance'
// onItemClick(item, index) — makes each row clickable (e.g. to open a DetailDrawer)
// onViewAll — when provided, "View All" becomes a same-page button instead of a link
export default function ListCard({ title, count, viewAllHref, items = [], variant = 'alerts', footer, onItemClick, onViewAll }) {
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)',
      borderRadius: 16,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', borderBottom: '1px solid #E2E8F0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#1A1F36' }}>{title}</span>
          {count !== undefined && (
            <span style={{
              fontSize: 9, fontWeight: 700, color: '#DC2626',
              background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.25)',
              borderRadius: 6, padding: '1px 5px',
            }}>{count}</span>
          )}
        </div>
        {onViewAll ? (
          <button onClick={onViewAll} style={{ fontSize: 9, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            onMouseEnter={e => (e.currentTarget.style.color = '#1A1F36')}
            onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}>
            View All
          </button>
        ) : viewAllHref && (
          <a href={viewAllHref} style={{ fontSize: 9, color: '#6B7280', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#1A1F36')}
            onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}>
            View All
          </a>
        )}
      </div>

      {/* Items */}
      <div style={{ flex: 1, padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {variant === 'alerts' && items.map((item, i) => (
          <div key={i}
            onClick={onItemClick ? () => onItemClick(item, i) : undefined}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              background: '#F8FAFC', border: '1px solid #E2E8F0',
              borderRadius: 10, padding: '6px 8px',
              cursor: onItemClick ? 'pointer' : 'default',
              transition: 'background 0.12s',
            }}
            onMouseEnter={e => { if (onItemClick) e.currentTarget.style.background = '#F4F6F9'; }}
            onMouseLeave={e => (e.currentTarget.style.background = '#F8FAFC')}
          >
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: item.color + '22', border: `1px solid ${item.color}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: item.color, display: 'inline-block' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#1A1F36', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</p>
              <p style={{ fontSize: 9, color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.sub}</p>
            </div>
            <span style={{ fontSize: 9, color: '#9CA3AF', flexShrink: 0, whiteSpace: 'nowrap' }}>{item.ago}</span>
          </div>
        ))}

        {variant === 'news' && items.map((item, i) => (
          <div key={i} onClick={onItemClick ? () => onItemClick(item, i) : undefined} style={{ cursor: onItemClick ? 'pointer' : 'default' }}>
            <p style={{ fontSize: 10, color: '#1A1F36', lineHeight: 1.45, cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#0077C8')}
              onMouseLeave={e => (e.currentTarget.style.color = '#1A1F36')}>
              {item.title}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
              <span style={{ fontSize: 8, color: '#9CA3AF' }}>{item.ago}</span>
              <span style={{ width: 2, height: 2, borderRadius: '50%', background: '#E2E8F0', display: 'inline-block' }} />
              <span style={{ fontSize: 8, fontWeight: 600, color: '#0077C8' }}>{item.cat}</span>
            </div>
            {i < items.length - 1 && <div style={{ borderTop: '1px solid #E2E8F0', marginTop: 8 }} />}
          </div>
        ))}

        {variant === 'maintenance' && items.map((item, i) => (
          <div key={i}
            onClick={onItemClick ? () => onItemClick(item, i) : undefined}
            style={{
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8,
              paddingBottom: i < items.length - 1 ? 8 : 0,
              borderBottom: i < items.length - 1 ? '1px solid #E2E8F0' : 'none',
              cursor: onItemClick ? 'pointer' : 'default',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#1A1F36', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.asset}</p>
              <p style={{ fontSize: 9, color: '#6B7280' }}>{item.facility}</p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontSize: 9, color: '#6B7280' }}>{item.type}</p>
              <p style={{ fontSize: 9, color: '#9CA3AF' }}>{item.date}</p>
              <span style={{
                display: 'inline-block', marginTop: 2,
                background: item.pc + '22', color: item.pc,
                fontSize: 8, fontWeight: 700, padding: '1px 6px', borderRadius: 4,
              }}>{item.priority}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer link */}
      {footer && (
        <div style={{ padding: '8px 14px', borderTop: '1px solid #E2E8F0' }}>
          <a href={footer.href} style={{ fontSize: 10, color: '#0077C8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            {footer.label} →
          </a>
        </div>
      )}
    </div>
  );
}

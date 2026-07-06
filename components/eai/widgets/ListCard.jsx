'use client';

// Generic list card for alerts, news, maintenance
// variant: 'alerts' | 'news' | 'maintenance'
export default function ListCard({ title, count, viewAllHref, items = [], variant = 'alerts', footer }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 16,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{title}</span>
          {count !== undefined && (
            <span style={{
              fontSize: 9, fontWeight: 700, color: '#DC2626',
              background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.25)',
              borderRadius: 6, padding: '1px 5px',
            }}>{count}</span>
          )}
        </div>
        {viewAllHref && (
          <a href={viewAllHref} style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}>
            View All
          </a>
        )}
      </div>

      {/* Items */}
      <div style={{ flex: 1, padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {variant === 'alerts' && items.map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10, padding: '6px 8px',
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: item.color + '22', border: `1px solid ${item.color}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: item.color, display: 'inline-block' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.80)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</p>
              <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.sub}</p>
            </div>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', flexShrink: 0, whiteSpace: 'nowrap' }}>{item.ago}</span>
          </div>
        ))}

        {variant === 'news' && items.map((item, i) => (
          <div key={i}>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', lineHeight: 1.45, cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.90)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}>
              {item.title}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
              <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)' }}>{item.ago}</span>
              <span style={{ width: 2, height: 2, borderRadius: '50%', background: 'rgba(255,255,255,0.20)', display: 'inline-block' }} />
              <span style={{ fontSize: 8, fontWeight: 600, color: '#0077C8' }}>{item.cat}</span>
            </div>
            {i < items.length - 1 && <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 8 }} />}
          </div>
        ))}

        {variant === 'maintenance' && items.map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8,
            paddingBottom: i < items.length - 1 ? 8 : 0,
            borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.80)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.asset}</p>
              <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>{item.facility}</p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.40)' }}>{item.type}</p>
              <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.30)' }}>{item.date}</p>
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
        <div style={{ padding: '8px 14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <a href={footer.href} style={{ fontSize: 10, color: '#0077C8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            {footer.label} →
          </a>
        </div>
      )}
    </div>
  );
}

'use client';

const TAG_CONFIG = {
  PM:       { color: '#7C3AED', bg: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.30)' },
  Standard: { color: '#10B981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.30)' },
};

const CARD = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 12,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};
const HDR = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '10px 14px 0',
};
const TITLE_STYLE = {
  fontSize: 11, fontWeight: 700, color: '#fff',
  letterSpacing: '-0.01em',
};
const VIEW_LINK = {
  fontSize: 9, color: '#0077C8', textDecoration: 'none', fontWeight: 600,
};

export default function CalendarListCard({ title = 'Maintenance Calendar', items = [], viewAllHref, viewFullHref }) {
  return (
    <div style={CARD}>
      <div style={HDR}>
        <span style={TITLE_STYLE}>{title}</span>
        {viewAllHref && <a href={viewAllHref} style={VIEW_LINK}>View Calendar</a>}
      </div>

      <div style={{ padding: '8px 14px', display: 'flex', flexDirection: 'column' }}>
        {items.map((item, i) => {
          const tag = TAG_CONFIG[item.tag] ?? TAG_CONFIG.Standard;
          return (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 0',
                borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}
            >
              {/* Date */}
              <span style={{
                fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.50)',
                width: 42, flexShrink: 0, lineHeight: 1.3,
              }}>
                {item.date}
              </span>

              {/* Title + location */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: 10, fontWeight: 600, color: '#fff',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  lineHeight: 1.3,
                }}>
                  {item.title}
                </p>
                <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.30)', marginTop: 1 }}>
                  {item.location}
                </p>
              </div>

              {/* Tag pill */}
              <span style={{
                flexShrink: 0,
                fontSize: 7, fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 4,
                color: tag.color,
                background: tag.bg,
                border: `1px solid ${tag.border}`,
                letterSpacing: '0.04em',
              }}>
                {item.tag}
              </span>
            </div>
          );
        })}
      </div>

      {viewFullHref && (
        <div style={{ padding: '7px 14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <a href={viewFullHref} style={VIEW_LINK}>View Full Calendar →</a>
        </div>
      )}
    </div>
  );
}

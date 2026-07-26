'use client';

const TAG_CONFIG = {
  PM:       { color: '#7C3AED', bg: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.30)' },
  Standard: { color: '#10B981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.30)' },
};

const CARD = {
  background: '#FFFFFF',
  border: '1px solid #E2E8F0',
  boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)',
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
  fontSize: 11, fontWeight: 700, color: '#1A1F36',
  letterSpacing: '-0.01em',
};
const VIEW_LINK = {
  fontSize: 9, color: '#0077C8', textDecoration: 'none', fontWeight: 600,
};

export default function CalendarListCard({ title = 'Maintenance Calendar', items = [], viewAllHref, viewFullHref, onViewAll, onViewFull, onItemClick }) {
  return (
    <div style={CARD}>
      <div style={HDR}>
        <span style={TITLE_STYLE}>{title}</span>
        {onViewAll ? (
          <button onClick={onViewAll} className="eai-focusable" style={{ ...VIEW_LINK, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>View Calendar</button>
        ) : viewAllHref && <a href={viewAllHref} style={VIEW_LINK}>View Calendar</a>}
      </div>

      <div style={{ padding: '8px 14px', display: 'flex', flexDirection: 'column' }}>
        {items.map((item, i) => {
          const tag = TAG_CONFIG[item.tag] ?? TAG_CONFIG.Standard;
          const Tag = onItemClick ? 'button' : 'div';
          return (
            <Tag
              key={i}
              type={onItemClick ? 'button' : undefined}
              onClick={onItemClick ? () => onItemClick(item, i) : undefined}
              className={onItemClick ? 'eai-focusable' : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 0',
                border: 'none',
                borderBottomWidth: i < items.length - 1 ? 1 : 0, borderBottomStyle: 'solid', borderBottomColor: '#E2E8F0',
                background: 'transparent', width: '100%', textAlign: 'left', font: 'inherit',
                cursor: onItemClick ? 'pointer' : 'default',
              }}
            >
              {/* Date */}
              <span style={{
                fontSize: 8, fontWeight: 700, color: '#6B7280',
                width: 42, flexShrink: 0, lineHeight: 1.3,
              }}>
                {item.date}
              </span>

              {/* Title + location */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: 10, fontWeight: 600, color: '#1A1F36',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  lineHeight: 1.3,
                }}>
                  {item.title}
                </p>
                <p style={{ fontSize: 8, color: '#9CA3AF', marginTop: 1 }}>
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
            </Tag>
          );
        })}
      </div>

      {(onViewFull || viewFullHref) && (
        <div style={{ padding: '7px 14px', borderTop: '1px solid #E2E8F0' }}>
          {onViewFull ? (
            <button onClick={onViewFull} className="eai-focusable" style={{ ...VIEW_LINK, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>View Full Calendar →</button>
          ) : (
            <a href={viewFullHref} style={VIEW_LINK}>View Full Calendar →</a>
          )}
        </div>
      )}
    </div>
  );
}

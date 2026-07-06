'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const BORD = 'rgba(255,255,255,0.07)';
const DIM  = 'rgba(255,255,255,0.40)';
const DIMMER = 'rgba(255,255,255,0.25)';

// Generic table shell.
// columns: [{ key, label, width?, align?, render?(value, row) → ReactNode }]
// tabs: [{ key, label, count? }] — rendered above the table header
// pagination: { page, perPage, total, onChange(newPage) }
// selectedKey: the row whose `keyField` value matches is highlighted
export default function DataTable({
  title, viewAllHref, viewAllLabel = 'View All',
  tabs, activeTab, onTabChange,
  columns = [],
  data = [],
  keyField = 'id',
  selectedKey,
  onRowClick,
  pagination,
  emptyMessage = 'No data.',
  style,
  compact = false,
}) {
  const TH = {
    fontSize: 9, fontWeight: 700, color: DIMMER, textTransform: 'uppercase',
    letterSpacing: '0.07em', padding: compact ? '6px 8px' : '8px 10px',
    whiteSpace: 'nowrap', textAlign: 'left',
  };
  const TD = {
    fontSize: 10, color: 'rgba(255,255,255,0.70)',
    padding: compact ? '7px 8px' : '9px 10px',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  };

  const {
    page = 1, perPage = 10, total, onChange: onPageChange,
  } = pagination ?? {};
  const totalPages = total ? Math.max(1, Math.ceil(total / perPage)) : 1;

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORD}`, borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column', ...style }}>

      {/* Card header */}
      {(title || viewAllHref) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: `1px solid ${BORD}`, flexShrink: 0 }}>
          {title && <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{title}</span>}
          {viewAllHref && (
            <a href={viewAllHref} style={{ fontSize: 9, color: DIM, textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = DIM}>{viewAllLabel}</a>
          )}
        </div>
      )}

      {/* Tabs */}
      {tabs && (
        <div style={{ display: 'flex', gap: 2, padding: '0 12px', borderBottom: `1px solid ${BORD}`, flexShrink: 0, overflowX: 'auto' }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => onTabChange?.(tab.key)}
                style={{
                  padding: '8px 10px', border: 'none', borderRadius: 0,
                  background: 'transparent', cursor: 'pointer', fontSize: 10, fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#0077C8' : DIM, borderBottom: isActive ? '2px solid #0077C8' : '2px solid transparent',
                  whiteSpace: 'nowrap', transition: 'all 0.12s',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = DIM; }}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span style={{ fontSize: 8, background: isActive ? 'rgba(0,119,200,0.20)' : 'rgba(255,255,255,0.08)', color: isActive ? '#0077C8' : DIMMER, padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: 'auto', flex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          {columns.some(c => c.width) && (
            <colgroup>
              {columns.map((c, i) => <col key={i} style={{ width: c.width ?? 'auto' }} />)}
            </colgroup>
          )}
          <thead>
            <tr style={{ borderBottom: `1px solid ${BORD}` }}>
              {columns.map((c, i) => (
                <th key={i} style={{ ...TH, textAlign: c.align ?? 'left' }}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: 20, color: DIMMER, fontSize: 11 }}>{emptyMessage}</td></tr>
            )}
            {data.map((row, ri) => {
              const rowKey = row[keyField] ?? ri;
              const isSel = selectedKey !== undefined && rowKey === selectedKey;
              return (
                <tr key={rowKey}
                  onClick={() => onRowClick?.(row)}
                  style={{
                    borderBottom: `1px solid ${BORD}`,
                    background: isSel ? 'rgba(0,119,200,0.10)' : 'transparent',
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => { if (!isSel && onRowClick) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = isSel ? 'rgba(0,119,200,0.10)' : 'transparent'; }}
                >
                  {columns.map((c, ci) => (
                    <td key={ci} style={{ ...TD, textAlign: c.align ?? 'left', maxWidth: c.width ?? 'auto' }}>
                      {c.render ? c.render(row[c.key], row) : (row[c.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderTop: `1px solid ${BORD}`, flexShrink: 0 }}>
          <span style={{ fontSize: 9, color: DIMMER }}>
            {total
              ? `Showing ${Math.min((page-1)*perPage+1, total)}–${Math.min(page*perPage, total)} of ${total}`
              : `${data.length} rows`}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button onClick={() => onPageChange?.(page - 1)} disabled={page <= 1}
              style={{ width: 24, height: 24, borderRadius: 5, border: `1px solid ${BORD}`, background: 'transparent', cursor: page <= 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: page <= 1 ? DIMMER : '#fff', opacity: page <= 1 ? 0.4 : 1 }}>
              <ChevronLeft size={11} />
            </button>
            {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map(pg => (
              <button key={pg} onClick={() => onPageChange?.(pg)}
                style={{ width: 24, height: 24, borderRadius: 5, fontSize: 10, fontWeight: page === pg ? 700 : 400, border: page === pg ? '1px solid #0077C8' : `1px solid ${BORD}`, background: page === pg ? 'rgba(0,119,200,0.20)' : 'transparent', color: page === pg ? '#0077C8' : DIM, cursor: 'pointer' }}>
                {pg}
              </button>
            ))}
            {totalPages > 3 && <span style={{ color: DIMMER, fontSize: 10 }}>…{totalPages}</span>}
            <button onClick={() => onPageChange?.(page + 1)} disabled={page >= totalPages}
              style={{ width: 24, height: 24, borderRadius: 5, border: `1px solid ${BORD}`, background: 'transparent', cursor: page >= totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: page >= totalPages ? DIMMER : '#fff', opacity: page >= totalPages ? 0.4 : 1 }}>
              <ChevronRight size={11} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

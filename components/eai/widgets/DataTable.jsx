'use client';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

const BORD = '#E2E8F0';
const DIM  = '#6B7280';
const DIMMER = '#9CA3AF';

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
  onRowDoubleClick,
  sortState,
  onSort,
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
    fontSize: 10, color: '#1A1F36',
    padding: compact ? '7px 8px' : '9px 10px',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  };

  const {
    page = 1, perPage = 10, total, onChange: onPageChange,
  } = pagination ?? {};
  const totalPages = total ? Math.max(1, Math.ceil(total / perPage)) : 1;

  return (
    <div style={{ background: '#FFFFFF', border: `1px solid ${BORD}`, boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)', borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column', ...style }}>

      {/* Card header */}
      {(title || viewAllHref) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: `1px solid ${BORD}`, flexShrink: 0 }}>
          {title && <span style={{ fontSize: 11, fontWeight: 700, color: '#1A1F36' }}>{title}</span>}
          {viewAllHref && (
            <a href={viewAllHref} style={{ fontSize: 9, color: DIM, textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#1A1F36'}
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
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#1A1F36'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = DIM; }}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span style={{ fontSize: 8, background: isActive ? 'rgba(0,119,200,0.20)' : '#F4F6F9', color: isActive ? '#0077C8' : DIMMER, padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>
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
              {columns.map((c, i) => {
                const sortKey = c.sortKey ?? (c.sortable ? c.key : null);
                const active = sortKey && sortState?.key === sortKey;
                return (
                  <th key={i} style={{ ...TH, textAlign: c.align ?? 'left' }}>
                    {sortKey && onSort ? (
                      <button
                        type="button" onClick={() => onSort(sortKey)} aria-label={`Sort by ${c.label}`}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 2, border: 'none', background: 'transparent',
                          cursor: 'pointer', padding: 0, font: 'inherit', fontWeight: 700,
                          color: active ? '#0077C8' : DIMMER, textTransform: 'uppercase', letterSpacing: '0.07em', fontSize: 9,
                        }}
                      >
                        {c.label}
                        {active ? (sortState.dir === 'asc' ? <ChevronUp size={9} /> : <ChevronDown size={9} />) : null}
                      </button>
                    ) : c.label}
                  </th>
                );
              })}
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
                  onDoubleClick={() => onRowDoubleClick?.(row)}
                  style={{
                    borderBottom: `1px solid ${BORD}`,
                    background: isSel ? 'rgba(0,119,200,0.10)' : 'transparent',
                    cursor: (onRowClick || onRowDoubleClick) ? 'pointer' : 'default',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => { if (!isSel && (onRowClick || onRowDoubleClick)) e.currentTarget.style.background = '#F4F6F9'; }}
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
              style={{ width: 24, height: 24, borderRadius: 5, border: `1px solid ${BORD}`, background: 'transparent', cursor: page <= 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: page <= 1 ? DIMMER : '#1A1F36', opacity: page <= 1 ? 0.4 : 1 }}>
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
              style={{ width: 24, height: 24, borderRadius: 5, border: `1px solid ${BORD}`, background: 'transparent', cursor: page >= totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: page >= totalPages ? DIMMER : '#1A1F36', opacity: page >= totalPages ? 0.4 : 1 }}>
              <ChevronRight size={11} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

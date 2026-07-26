'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FILTER_OPTIONS = ['By Category', 'By Location', 'By Vendor'];

export default function BudgetVsActualTable({ title = 'Budget vs Actual', items = [], onRowClick }) {
  const [filter, setFilter] = useState('By Category');
  const [open, setOpen] = useState(false);
  const maxBudget = Math.max(...items.map(r => r.budgetM), 1);

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)', borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #E2E8F0', flexShrink: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#1A1F36' }}>{title}</span>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setOpen(o => !o)} style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px',
            background: '#F8FAFC', border: '1px solid #E2E8F0',
            borderRadius: 6, cursor: 'pointer', color: '#6B7280', fontSize: 9,
          }}>
            {filter} <ChevronDown size={9} />
          </button>
          {open && (
            <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, boxShadow: '0 4px 16px rgba(16,24,40,0.10)', zIndex: 20, minWidth: 120, overflow: 'hidden' }}>
              {FILTER_OPTIONS.map(opt => (
                <button key={opt} onClick={() => { setFilter(opt); setOpen(false); }} style={{
                  display: 'block', width: '100%', padding: '6px 12px', fontSize: 10,
                  background: opt === filter ? 'rgba(124,58,237,0.15)' : 'transparent',
                  border: 'none', cursor: 'pointer', color: opt === filter ? '#7C3AED' : '#6B7280',
                  textAlign: 'left',
                }}>
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Column headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 52px', gap: 0, padding: '5px 14px 3px', borderBottom: '1px solid #E2E8F0' }}>
        {['Category', 'Budget', 'Actual', 'Variance'].map(h => (
          <span key={h} style={{ fontSize: 8, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</span>
        ))}
      </div>

      {/* Rows */}
      <div style={{ padding: '4px 14px 12px', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {items.map((row, i) => {
          const budgetBar = (row.budgetM / maxBudget) * 100;
          const actualBar = (row.actualM / maxBudget) * 100;
          const isUnder   = row.variancePct <= 0;
          const Tag = onRowClick ? 'button' : 'div';
          return (
            <Tag
              key={i}
              type={onRowClick ? 'button' : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={onRowClick ? 'eai-focusable' : undefined}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 52px', gap: 0, padding: '5px 6px',
                margin: '0 -6px', borderBottom: i < items.length - 1 ? '1px solid #E2E8F0' : 'none',
                alignItems: 'center', cursor: onRowClick ? 'pointer' : 'default',
                borderRadius: 6, transition: 'background 0.12s',
                borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                background: 'transparent', font: 'inherit', textAlign: 'left', width: 'calc(100% + 12px)',
              }}
              onMouseEnter={e => { if (onRowClick) e.currentTarget.style.background = '#F8FAFC'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              {/* Category */}
              <span style={{ fontSize: 10, color: '#1A1F36', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 6 }}>
                {row.category}
              </span>

              {/* Budget */}
              <div style={{ paddingRight: 6 }}>
                <div style={{ height: 3, borderRadius: 2, background: '#E2E8F0', overflow: 'hidden', marginBottom: 3 }}>
                  <div style={{ width: `${budgetBar}%`, height: '100%', borderRadius: 2, background: '#94A3B8' }} />
                </div>
                <span style={{ fontSize: 9, color: '#6B7280', fontFamily: 'ui-monospace,monospace' }}>${row.budgetM.toFixed(2)}M</span>
              </div>

              {/* Actual */}
              <div style={{ paddingRight: 6 }}>
                <div style={{ height: 3, borderRadius: 2, background: '#E2E8F0', overflow: 'hidden', marginBottom: 3 }}>
                  <div style={{ width: `${actualBar}%`, height: '100%', borderRadius: 2, background: isUnder ? '#10B981' : '#EF4444' }} />
                </div>
                <span style={{ fontSize: 9, color: '#1A1F36', fontFamily: 'ui-monospace,monospace' }}>${row.actualM.toFixed(2)}M</span>
              </div>

              {/* Variance */}
              <span style={{ fontSize: 10, fontWeight: 700, color: isUnder ? '#10B981' : '#EF4444', fontFamily: 'ui-monospace,monospace', textAlign: 'right' }}>
                {row.variancePct > 0 ? '+' : ''}{row.variancePct.toFixed(1)}%
              </span>
            </Tag>
          );
        })}
      </div>
    </div>
  );
}

'use client';
import { useEffect, useRef } from 'react';
import { Check } from 'lucide-react';

// Generic multiselect filter popover, anchored under its trigger button
// (wrap trigger + this in a `position:relative` container).
// groups: [{ key, label, options: string[], single?: boolean }] — `single` renders
// a radio-style indicator instead of a checkbox (purely visual; the caller's
// onToggle still decides whether picking a new option replaces the old one).
// selected: { [groupKey]: string[] }
export default function FilterPopover({
  open, onClose, groups = [], selected = {}, onToggle, onClear, align = 'right', extra, width = 260,
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) onClose?.(); }
    function onKey(e) { if (e.key === 'Escape') onClose?.(); }
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const totalSelected = groups.reduce((n, g) => n + (selected[g.key]?.length ?? 0), 0);

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute', top: 'calc(100% + 6px)', [align]: 0, zIndex: 400,
        width, background: '#FFFFFF', border: '1px solid #E2E8F0',
        borderRadius: 12, boxShadow: '0 8px 24px rgba(16,24,40,0.12)',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderBottom: '1px solid #E2E8F0' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#1A1F36' }}>Filters</span>
        <button
          onClick={onClear}
          disabled={totalSelected === 0}
          className="eai-focusable"
          style={{
            border: 'none', background: 'transparent', cursor: totalSelected ? 'pointer' : 'default',
            color: totalSelected ? '#0077C8' : '#9CA3AF', fontSize: 9, fontWeight: 600, padding: 0,
          }}
        >
          Clear all
        </button>
      </div>

      <div style={{ maxHeight: 320, overflowY: 'auto', padding: '6px 4px' }}>
        {groups.map(group => (
          <div key={group.key} style={{ padding: '6px 8px' }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
              {group.label}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {group.options.map(opt => {
                const isChecked = (selected[group.key] ?? []).includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => onToggle?.(group.key, opt)}
                    className="eai-focusable"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      width: '100%', textAlign: 'left', padding: '5px 6px',
                      border: 'none', background: isChecked ? 'rgba(0,119,200,0.08)' : 'transparent',
                      borderRadius: 6, cursor: 'pointer', transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => { if (!isChecked) e.currentTarget.style.background = '#F8FAFC'; }}
                    onMouseLeave={e => { if (!isChecked) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{
                      width: 14, height: 14, borderRadius: group.single ? '50%' : 4, flexShrink: 0,
                      border: `1.5px solid ${isChecked ? '#0077C8' : '#CBD5E1'}`,
                      background: isChecked ? '#0077C8' : '#FFFFFF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isChecked && (group.single
                        ? <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />
                        : <Check size={10} color="#fff" strokeWidth={3} />)}
                    </span>
                    <span style={{ fontSize: 10.5, color: '#1A1F36' }}>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {extra && <div style={{ borderTop: '1px solid #E2E8F0', marginTop: 4 }}>{extra}</div>}
      </div>

      <div style={{ padding: '8px 12px', borderTop: '1px solid #E2E8F0' }}>
        <button
          onClick={onClose}
          className="eai-focusable"
          style={{
            width: '100%', padding: '7px 0', borderRadius: 8, border: 'none',
            background: '#0077C8', color: '#fff', fontSize: 10.5, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Apply {totalSelected > 0 ? `(${totalSelected})` : ''}
        </button>
      </div>
    </div>
  );
}

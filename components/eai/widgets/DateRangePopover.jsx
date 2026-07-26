'use client';
import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';

// Generic date-range dropdown: fixed presets + a "Custom" two-input option.
// presets: [{ key, label }]
// value: { presetKey, from, to } — from/to are 'YYYY-MM-DD' strings, only used when presetKey === 'custom'
export default function DateRangePopover({
  open, onClose, presets = [], value, onSelectPreset, onCustomChange, align = 'left',
}) {
  const ref = useRef(null);
  const [customFrom, setCustomFrom] = useState(value?.from ?? '');
  const [customTo, setCustomTo] = useState(value?.to ?? '');

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

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute', top: 'calc(100% + 6px)', [align]: 0, zIndex: 400,
        width: 220, background: '#FFFFFF', border: '1px solid #E2E8F0',
        borderRadius: 12, boxShadow: '0 8px 24px rgba(16,24,40,0.12)',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{ padding: '6px 4px' }}>
        {presets.map(p => {
          const isActive = value?.presetKey === p.key;
          return (
            <button
              key={p.key}
              onClick={() => { onSelectPreset?.(p.key); if (p.key !== 'custom') onClose?.(); }}
              className="eai-focusable"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', textAlign: 'left', padding: '7px 10px',
                border: 'none', borderRadius: 7, cursor: 'pointer',
                background: isActive ? 'rgba(0,119,200,0.10)' : 'transparent',
                color: isActive ? '#0077C8' : '#1A1F36', fontSize: 11, fontWeight: isActive ? 700 : 500,
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F8FAFC'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              {p.label}
              {isActive && <Check size={12} />}
            </button>
          );
        })}
      </div>

      {value?.presetKey === 'custom' && (
        <div style={{ padding: '10px 12px', borderTop: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>From</span>
            <input
              type="date" value={customFrom}
              onChange={e => setCustomFrom(e.target.value)}
              style={{ fontSize: 11, padding: '5px 8px', border: '1px solid #E2E8F0', borderRadius: 6, color: '#1A1F36' }}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>To</span>
            <input
              type="date" value={customTo}
              onChange={e => setCustomTo(e.target.value)}
              style={{ fontSize: 11, padding: '5px 8px', border: '1px solid #E2E8F0', borderRadius: 6, color: '#1A1F36' }}
            />
          </label>
          <button
            onClick={() => { onCustomChange?.(customFrom, customTo); onClose?.(); }}
            disabled={!customFrom || !customTo}
            className="eai-focusable"
            style={{
              marginTop: 2, padding: '7px 0', borderRadius: 8, border: 'none',
              background: customFrom && customTo ? '#0077C8' : '#E2E8F0',
              color: customFrom && customTo ? '#fff' : '#9CA3AF',
              fontSize: 10.5, fontWeight: 600, cursor: customFrom && customTo ? 'pointer' : 'default',
            }}
          >
            Apply Range
          </button>
        </div>
      )}
    </div>
  );
}

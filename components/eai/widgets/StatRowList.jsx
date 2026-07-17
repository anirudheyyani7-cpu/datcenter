'use client';
import { useState } from 'react';
import {
  ShieldAlert, Users, Activity, Lock, AlertTriangle,
  AlertCircle, Info, CheckCircle,
} from 'lucide-react';

const ICON_MAP = { ShieldAlert, Users, Activity, Lock, AlertTriangle, AlertCircle, Info, CheckCircle };

const STATUS_PILL = {
  Healthy:  { color: '#00A36C', bg: 'rgba(0,163,108,0.15)',   border: 'rgba(0,163,108,0.30)'   },
  Warning:  { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.30)'  },
  Critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.30)'   },
};

/*
  items: [{
    iconKey?:      string            — leading lucide icon key
    iconColor?:    string
    label:         string
    value?:        string|number     — right-aligned main value
    statusPill?:   'Healthy'|'Warning'|'Critical'  — replaces value with a pill
    delta?:        string            — small secondary text after value
    deltaUp?:      bool|null         — true=green, false=red, null=gray
    toggle?:       bool              — show a toggle switch at the far right
    toggleInitial?: bool             — starting state of the toggle
    valueColor?:   string            — override value text color
  }]
*/
export default function StatRowList({ items = [] }) {
  const [toggleStates, setToggleStates] = useState(
    () => Object.fromEntries(items.map((item, i) => [i, item.toggleInitial ?? false]))
  );

  const flipToggle = (idx) =>
    setToggleStates(prev => ({ ...prev, [idx]: !prev[idx] }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {items.map((item, i) => {
        const Icon  = item.iconKey ? (ICON_MAP[item.iconKey] ?? AlertCircle) : null;
        const pill  = item.statusPill ? (STATUS_PILL[item.statusPill] ?? STATUS_PILL.Healthy) : null;
        const on    = toggleStates[i];
        const isLast = i === items.length - 1;

        return (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 14px',
              borderBottom: isLast ? 'none' : '1px solid #E2E8F0',
            }}
          >
            {/* Optional leading icon circle */}
            {Icon && (
              <div style={{
                width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                background: (item.iconColor ?? '#0077C8') + '20',
                border: `1px solid ${item.iconColor ?? '#0077C8'}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={11} style={{ color: item.iconColor ?? '#0077C8' }} />
              </div>
            )}

            {/* Label */}
            <span style={{
              flex: 1, fontSize: 10, color: '#6B7280',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {item.label}
            </span>

            {/* Right side: status pill OR value+delta OR toggle */}
            {item.toggle ? (
              <button
                onClick={() => flipToggle(i)}
                aria-label={on ? 'Disable' : 'Enable'}
                style={{
                  width: 32, height: 17, borderRadius: 9, border: 'none',
                  cursor: 'pointer', flexShrink: 0, position: 'relative',
                  background: on ? '#0077C8' : '#E2E8F0',
                  transition: 'background 0.15s', padding: 0,
                }}
              >
                <span style={{
                  position: 'absolute', top: 2,
                  left: on ? 16 : 2,
                  width: 13, height: 13, borderRadius: '50%',
                  background: '#fff', transition: 'left 0.15s', display: 'block',
                }} />
              </button>
            ) : pill ? (
              <span style={{
                fontSize: 8, fontWeight: 700, padding: '2px 8px',
                borderRadius: 5, whiteSpace: 'nowrap', flexShrink: 0,
                color: pill.color, background: pill.bg, border: `1px solid ${pill.border}`,
              }}>
                {item.statusPill}
              </span>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                {item.value !== undefined && (
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: item.valueColor ?? '#1A1F36',
                    fontFamily: 'ui-monospace,monospace',
                  }}>
                    {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                  </span>
                )}
                {item.delta !== undefined && (
                  <span style={{
                    fontSize: 9, fontWeight: 600, whiteSpace: 'nowrap',
                    color: item.deltaUp === null
                      ? '#9CA3AF'
                      : item.deltaUp ? '#00A36C' : '#DC2626',
                  }}>
                    {item.delta}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

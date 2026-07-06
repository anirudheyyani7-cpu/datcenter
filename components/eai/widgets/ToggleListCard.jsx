'use client';
import { useState } from 'react';
import {
  BarChart2, Activity, Leaf, Server, DollarSign,
  FileText, Clock, Database, Settings,
} from 'lucide-react';

const ICON_MAP = { BarChart2, Activity, Leaf, Server, DollarSign, FileText, Clock, Database, Settings };

export default function ToggleListCard({ title, items = [], viewAllHref }) {
  const [enabled, setEnabled] = useState(() => items.map(i => i.enabled ?? false));

  const toggle = (idx) => setEnabled(prev => prev.map((v, j) => j === idx ? !v : v));

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 12, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{title}</span>
        {viewAllHref && (
          <a
            href={viewAllHref}
            style={{ fontSize: 9, color: '#0077C8', textDecoration: 'none', fontWeight: 600 }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#0077C8')}
          >
            View all →
          </a>
        )}
      </div>

      {/* Rows */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((item, i) => {
          const Icon = ICON_MAP[item.iconKey] ?? FileText;
          const on   = enabled[i];
          return (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '7px 14px',
                borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}
            >
              {/* Icon box */}
              <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={12} style={{ color: 'rgba(255,255,255,0.55)' }} />
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.name}
                </p>
                <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.scheduleText}
                </p>
              </div>

              {/* Toggle switch */}
              <button
                onClick={() => toggle(i)}
                aria-label={on ? 'Disable' : 'Enable'}
                style={{
                  width: 32, height: 17, borderRadius: 9, border: 'none',
                  cursor: 'pointer', flexShrink: 0, position: 'relative',
                  background: on ? '#0077C8' : 'rgba(255,255,255,0.14)',
                  transition: 'background 0.15s',
                  padding: 0,
                }}
              >
                <span style={{
                  position: 'absolute', top: 2,
                  left: on ? 16 : 2,
                  width: 13, height: 13, borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.15s',
                  display: 'block',
                }} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

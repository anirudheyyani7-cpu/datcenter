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
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)',
      borderRadius: 12, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', borderBottom: '1px solid #E2E8F0',
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#1A1F36' }}>{title}</span>
        {viewAllHref && (
          <a
            href={viewAllHref}
            style={{ fontSize: 9, color: '#0077C8', textDecoration: 'none', fontWeight: 600 }}
            onMouseEnter={e => (e.currentTarget.style.color = '#00338D')}
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
                borderBottom: i < items.length - 1 ? '1px solid #E2E8F0' : 'none',
              }}
            >
              {/* Icon box */}
              <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={12} style={{ color: '#6B7280' }} />
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#1A1F36', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.name}
                </p>
                <p style={{ fontSize: 8, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                  background: on ? '#0077C8' : '#E2E8F0',
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

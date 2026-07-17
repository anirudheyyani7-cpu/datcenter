'use client';
import { Leaf, Droplets, Recycle } from 'lucide-react';

const ICONS = { leaf: Leaf, droplets: Droplets, recycle: Recycle };

export default function StatTile({ label, value, unit, delta, up, iconKey, color, progress = null, onClick }) {
  const Icon = ICONS[iconKey] ?? Leaf;
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }) : undefined}
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)',
        borderRadius: 14,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background 0.12s',
      }}
      onMouseEnter={onClick ? (e => (e.currentTarget.style.background = '#F8FAFC')) : undefined}
      onMouseLeave={onClick ? (e => (e.currentTarget.style.background = '#FFFFFF')) : undefined}
    >
      {/* Label row */}
      <p style={{ fontSize: 8, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</p>

      {/* Value */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <p style={{ fontSize: 22, fontWeight: 700, color: '#1A1F36', fontFamily: 'monospace', lineHeight: 1 }}>{value}</p>
        {unit && <span style={{ fontSize: 9, color: '#6B7280' }}>{unit}</span>}
      </div>

      {/* Progress bar (for budget utilization) */}
      {progress !== null && (
        <div style={{ height: 4, background: '#E2E8F0', borderRadius: 2, overflow: 'hidden', marginTop: 2 }}>
          <div style={{ height: '100%', width: `${progress}%`, background: '#0077C8', borderRadius: 2 }} />
        </div>
      )}

      {/* Delta */}
      <p style={{ fontSize: 9, fontWeight: 600, color: up ? '#00A36C' : '#DC2626', marginTop: 2 }}>{delta}</p>
    </div>
  );
}

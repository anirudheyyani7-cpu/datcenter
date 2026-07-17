'use client';
import {
  Building2, Layers, Zap, Timer, Activity, Droplets, Leaf, ShieldAlert,
} from 'lucide-react';

const ICONS = { building: Building2, layers: Layers, zap: Zap, timer: Timer, activity: Activity, droplets: Droplets, leaf: Leaf, shieldAlert: ShieldAlert };

// Seeded PRNG for deterministic sparklines
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Sparkline({ seed, up }) {
  const rng  = mulberry32(seed ?? 42);
  // 8 points across 52px (step 7px), y in 0-10 range
  const pts  = Array.from({ length: 8 }, (_, i) => ({ x: i * 7, y: 10 - rng() * 8 }));
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y.toFixed(1)}`).join(' ');
  return (
    <svg width="52" height="16" viewBox="0 0 52 16" style={{ opacity: 0.75, flexShrink: 0 }}>
      <path d={path} fill="none" stroke={up ? '#00A36C' : '#DC2626'}
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function KpiCard({ label, value, unit, sublabel, delta, up, iconKey, color, bg, seed, onClick }) {
  const Icon = ICONS[iconKey] ?? Building2;
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
        borderRadius: 12,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'background 0.15s',
        minWidth: 0,       // allow shrinking in grid
        overflow: 'hidden',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#F4F6F9')}
      onMouseLeave={e => (e.currentTarget.style.background = '#FFFFFF')}
    >
      {/* Icon + label row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, gap: 4 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={13} style={{ color }} />
        </div>
        <p style={{ fontSize: 8, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: 'right', lineHeight: 1.3, marginLeft: 4, overflow: 'hidden' }}>{label}</p>
      </div>

      {/* Value */}
      <p style={{ fontSize: 20, fontWeight: 700, color: '#1A1F36', fontFamily: 'monospace', lineHeight: 1, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {value}{unit && <span style={{ fontSize: 11, fontWeight: 500, color: '#6B7280', marginLeft: 2 }}>{unit}</span>}
      </p>

      {/* Sublabel */}
      {sublabel && <p style={{ fontSize: 8, color: '#9CA3AF', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sublabel}</p>}

      {/* Sparkline + delta */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <Sparkline seed={seed} up={up} />
        <p style={{ fontSize: 8, fontWeight: 600, color: up ? '#00A36C' : '#DC2626', flexShrink: 0, marginLeft: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{delta}</p>
      </div>
    </div>
  );
}

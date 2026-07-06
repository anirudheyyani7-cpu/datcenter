'use client';
import { Leaf, Droplets, Recycle } from 'lucide-react';

const ICONS = { leaf: Leaf, droplets: Droplets, recycle: Recycle };

export default function StatTile({ label, value, unit, delta, up, iconKey, color, progress = null }) {
  const Icon = ICONS[iconKey] ?? Leaf;
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 14,
      padding: 12,
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    }}>
      {/* Label row */}
      <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.30)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</p>

      {/* Value */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <p style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: 'monospace', lineHeight: 1 }}>{value}</p>
        {unit && <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>{unit}</span>}
      </div>

      {/* Progress bar (for budget utilization) */}
      {progress !== null && (
        <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden', marginTop: 2 }}>
          <div style={{ height: '100%', width: `${progress}%`, background: '#0077C8', borderRadius: 2 }} />
        </div>
      )}

      {/* Delta */}
      <p style={{ fontSize: 9, fontWeight: 600, color: up ? '#00A36C' : '#DC2626', marginTop: 2 }}>{delta}</p>
    </div>
  );
}

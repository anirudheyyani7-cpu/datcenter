'use client';
import { Flame, Thermometer, Wifi, Settings } from 'lucide-react';

const ICON_MAP = {
  flame:       Flame,
  thermometer: Thermometer,
  wifi:        Wifi,
  settings:    Settings,
};

export default function AnomalyStatCard({ category, count, delta, up, color, iconKey }) {
  const Icon = ICON_MAP[iconKey] ?? Flame;
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)',
      borderRadius: 12, padding: '12px 14px',
      display: 'flex', flexDirection: 'column', gap: 8, flex: 1,
    }}>
      {/* Icon */}
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: color + '20',
        border: `2px solid ${color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={16} style={{ color }} />
      </div>

      {/* Category */}
      <p style={{ fontSize: 9, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', lineHeight: 1.3 }}>
        {category}
      </p>

      {/* Count */}
      <p style={{ fontSize: 28, fontWeight: 800, color: '#1A1F36', fontFamily: 'ui-monospace,monospace', lineHeight: 1 }}>
        {count}
      </p>

      {/* Delta */}
      <p style={{ fontSize: 9, fontWeight: 600, color: up ? '#EF4444' : '#00A36C' }}>
        {up ? '↑' : '↓'}{delta} vs last 7 days
      </p>
    </div>
  );
}

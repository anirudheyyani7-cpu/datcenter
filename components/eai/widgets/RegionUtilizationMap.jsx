'use client';
import dynamic from 'next/dynamic';
import { ChevronDown } from 'lucide-react';

const RegionUtilizationMapLeaflet = dynamic(
  () => import('./RegionUtilizationMapLeaflet'),
  {
    ssr: false,
    loading: () => (
      <div style={{ height: '100%', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'rgba(255,255,255,0.20)', fontSize: 12 }}>Loading map…</span>
      </div>
    ),
  }
);

const GRADIENT_STOPS = [
  { pct: '100%', color: '#00A36C' },
  { pct:  '75%', color: '#0077C8' },
  { pct:  '50%', color: '#F59E0B' },
  { pct:  '25%', color: '#EF4444' },
  { pct:   '0%', color: '#7F1D1D' },
];

export default function RegionUtilizationMap({ regions = [], height = 240, filterLabel = 'Utilization Rate' }) {
  return (
    <div style={{ position: 'relative', height, width: '100%', overflow: 'hidden', borderRadius: 4 }}>
      <RegionUtilizationMapLeaflet regions={regions} />

      {/* Filter dropdown overlay (top-right) */}
      <button style={{
        position: 'absolute', top: 8, right: 46, zIndex: 500,
        display: 'flex', alignItems: 'center', gap: 3,
        background: 'rgba(10,15,30,0.80)', border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 6, padding: '3px 8px', cursor: 'pointer',
        color: 'rgba(255,255,255,0.60)', fontSize: 9, fontFamily: 'system-ui,sans-serif',
        backdropFilter: 'blur(8px)',
      }}>
        {filterLabel} <ChevronDown size={9} />
      </button>

      {/* Vertical gradient legend (right edge) */}
      <div style={{
        position: 'absolute', top: 12, right: 10, bottom: 12, zIndex: 500,
        display: 'flex', alignItems: 'stretch', gap: 3,
      }}>
        {/* Labels */}
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          fontSize: 7, color: 'rgba(255,255,255,0.45)', textAlign: 'right',
          fontFamily: 'ui-monospace,monospace',
        }}>
          {GRADIENT_STOPS.map(s => <span key={s.pct}>{s.pct}</span>)}
        </div>
        {/* Bar */}
        <div style={{
          width: 6, borderRadius: 3, flexShrink: 0,
          background: 'linear-gradient(to bottom, #00A36C 0%, #0077C8 35%, #F59E0B 65%, #EF4444 85%, #7F1D1D 100%)',
        }} />
      </div>
    </div>
  );
}

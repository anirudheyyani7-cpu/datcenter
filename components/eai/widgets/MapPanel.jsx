'use client';
import dynamic from 'next/dynamic';
import { MAP_LEGEND } from '@/data/eaiMockData';
import { Layers } from 'lucide-react';

const EAIMapLeaflet = dynamic(
  () => import('./EAIMapLeaflet'),
  {
    ssr: false,
    loading: () => (
      <div style={{ height: '100%', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'rgba(255,255,255,0.20)', fontSize: 12 }}>Loading map…</span>
      </div>
    ),
  }
);

export default function MapPanel({ clusters = [], height = 360, onViewFull }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 16,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Card header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Global Infrastructure Map</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 8, padding: '4px 10px', cursor: 'pointer',
            color: 'rgba(255,255,255,0.45)', fontSize: 9,
          }}>
            All Facilities ▾
          </button>
        </div>
      </div>

      {/* Map — flexShrink:0 prevents a flex parent squashing the explicit height */}
      <div style={{ position: 'relative', height, width: '100%', overflow: 'hidden', flexShrink: 0 }}>
        <EAIMapLeaflet clusters={clusters} />

        {/* Layer icon overlay */}
        <div style={{
          position: 'absolute', top: 80, left: 10, zIndex: 500,
          background: 'rgba(10,15,30,0.80)', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 6, width: 30, height: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)', cursor: 'pointer',
        }}>
          <Layers size={13} color="rgba(255,255,255,0.70)" />
        </div>

        {/* View Full Map button */}
        {onViewFull && (
          <button
            onClick={onViewFull}
            style={{
              position: 'absolute', bottom: 10, right: 10, zIndex: 500,
              background: 'rgba(10,15,30,0.82)', border: '1px solid rgba(255,255,255,0.20)',
              borderRadius: 8, padding: '5px 10px',
              color: '#fff', fontSize: 10, fontWeight: 600, cursor: 'pointer',
              backdropFilter: 'blur(10px)',
            }}
          >
            ⛶ View Full Map
          </button>
        )}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px 14px',
        padding: '8px 14px', borderTop: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
      }}>
        {MAP_LEGEND.map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: 'rgba(255,255,255,0.40)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, display: 'inline-block', flexShrink: 0 }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}

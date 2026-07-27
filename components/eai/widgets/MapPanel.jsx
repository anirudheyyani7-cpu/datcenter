'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { MAP_LEGEND } from '@/data/eaiMockData';
import { Layers, Maximize2 } from 'lucide-react';

const EAIMapLeaflet = dynamic(
  () => import('./EAIMapLeaflet'),
  {
    ssr: false,
    loading: () => (
      <div style={{ height: '100%', background: '#F4F6F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#9CA3AF', fontSize: 12 }}>Loading map…</span>
      </div>
    ),
  }
);

export default function MapPanel({ clusters = [], height = 360, fillHeight = false, onViewFull, onMarkerClick, selectedClusterIds }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)',
        borderRadius: 16,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        // flex:1 (not a fixed height) lets this grow into whatever space its sibling
        // (the Capacity by Region card, below it) doesn't need — a fixed height:'100%'
        // would instead force both to shrink to fit, clipping the sibling's content.
        ...(fillHeight ? { flex: '1 1 0%', minHeight: 0 } : {}),
      }}>
      {/* Card header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', borderBottom: '1px solid #E2E8F0',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#1A1F36' }}>Global Infrastructure Map</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: '#F8FAFC', border: '1px solid #E2E8F0',
            borderRadius: 8, padding: '4px 10px', cursor: 'pointer',
            color: '#6B7280', fontSize: 9,
          }}>
            All Facilities ▾
          </button>
        </div>
      </div>

      {/* Map — flexShrink:0 prevents a flex parent squashing the explicit height;
          fillHeight instead grows the canvas to fill whatever space is left in a stretched parent */}
      <div style={fillHeight
        ? { position: 'relative', flex: 1, minHeight: 280, width: '100%', overflow: 'hidden' }
        : { position: 'relative', height, width: '100%', overflow: 'hidden', flexShrink: 0 }
      }>
        <EAIMapLeaflet clusters={clusters} onMarkerClick={onMarkerClick} selectedIds={selectedClusterIds} />

        {/* Layer icon overlay */}
        <div style={{
          position: 'absolute', top: 80, left: 10, zIndex: 500,
          background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(226,232,240,0.9)',
          borderRadius: 6, width: 30, height: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)', cursor: 'pointer',
        }}>
          <Layers size={13} color="#1A1F36" />
        </div>

        {/* Expand to 3D globe — hover-revealed */}
        {onViewFull && (
          <button
            onClick={onViewFull}
            title="Expand to 3D globe view"
            style={{
              position: 'absolute', top: 10, right: 10, zIndex: 500,
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(226,232,240,0.9)',
              borderRadius: 8, padding: '6px 10px',
              color: '#1A1F36', fontSize: 10, fontWeight: 600, cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              opacity: hovered ? 1 : 0,
              pointerEvents: hovered ? 'auto' : 'none',
              transition: 'opacity 0.15s',
            }}
          >
            <Maximize2 size={12} /> Expand
          </button>
        )}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px 14px',
        padding: '8px 14px', borderTop: '1px solid #E2E8F0',
        flexShrink: 0,
      }}>
        {MAP_LEGEND.map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: '#6B7280' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, display: 'inline-block', flexShrink: 0 }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}

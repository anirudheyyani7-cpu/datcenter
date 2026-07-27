'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import DeliveriesMapModal from './DeliveriesMapModal';

const RouteMapLeaflet = dynamic(() => import('./RouteMapLeaflet'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '100%', background: '#F4F6F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#9CA3AF', fontSize: 12 }}>Loading map…</span>
    </div>
  ),
});

const LEGEND = [
  { label: 'Origin',     color: '#F59E0B' },
  { label: 'In Transit', color: '#0077C8' },
  { label: 'Delivered',  color: '#00A36C' },
];

export default function RouteMap({ shipments = [], height = 300, title = 'Deliveries Map' }) {
  const [mapModalOpen, setMapModalOpen] = useState(false);

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)',
      borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      {/* Card header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #E2E8F0', flexShrink: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#1A1F36' }}>{title}</span>
        <button onClick={() => setMapModalOpen(true)}
          style={{ fontSize: 9, color: '#6B7280', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.color = '#1A1F36'}
          onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}
        >View All</button>
      </div>

      {/* Map */}
      <div style={{ position: 'relative', height, width: '100%', overflow: 'hidden', flexShrink: 0 }}>
        <RouteMapLeaflet shipments={shipments} />
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 14px', borderTop: '1px solid #E2E8F0', flexShrink: 0 }}>
        {LEGEND.map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: '#6B7280' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, display: 'inline-block', flexShrink: 0 }} />
            {l.label}
          </div>
        ))}
      </div>

      <DeliveriesMapModal open={mapModalOpen} onClose={() => setMapModalOpen(false)} shipments={shipments} />
    </div>
  );
}

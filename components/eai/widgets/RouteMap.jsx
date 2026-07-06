'use client';
import dynamic from 'next/dynamic';

const RouteMapLeaflet = dynamic(() => import('./RouteMapLeaflet'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '100%', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'rgba(255,255,255,0.20)', fontSize: 12 }}>Loading map…</span>
    </div>
  ),
});

const LEGEND = [
  { label: 'Origin',     color: '#F59E0B' },
  { label: 'In Transit', color: '#0077C8' },
  { label: 'Delivered',  color: '#00A36C' },
];

export default function RouteMap({ shipments = [], height = 300, title = 'Deliveries Map', viewAllHref }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      {/* Card header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{title}</span>
        {viewAllHref && (
          <a href={viewAllHref} style={{ fontSize: 9, color: 'rgba(255,255,255,0.40)', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.40)'}
          >View All</a>
        )}
      </div>

      {/* Map */}
      <div style={{ position: 'relative', height, width: '100%', overflow: 'hidden', flexShrink: 0 }}>
        <RouteMapLeaflet shipments={shipments} />
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 14px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        {LEGEND.map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: 'rgba(255,255,255,0.40)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, display: 'inline-block', flexShrink: 0 }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}

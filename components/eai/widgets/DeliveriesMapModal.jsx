'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { X, Truck } from 'lucide-react';

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

// Full-screen "View All" target for the Deliveries Map card — a centered,
// backdrop-blurred modal with a live/animated version of the route map.
export default function DeliveriesMapModal({ open, onClose, shipments = [] }) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!open) { setEntered(false); return; }
    const id = requestAnimationFrame(() => setEntered(true));
    function onKey(e) { if (e.key === 'Escape') onClose?.(); }
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 1998,
          background: 'rgba(16,24,40,0.55)',
          backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
          opacity: entered ? 1 : 0,
          transition: 'opacity 0.2s ease-out',
        }}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Deliveries Map — Live Monitoring"
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: entered ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.97)',
          opacity: entered ? 1 : 0,
          transition: 'opacity 0.18s ease-out, transform 0.18s ease-out',
          zIndex: 1999, width: '90vw', maxWidth: 1200, height: '84vh',
          background: '#FFFFFF', borderRadius: 16, overflow: 'hidden',
          border: '1px solid #E2E8F0', boxShadow: '0 24px 64px rgba(16,24,40,0.35)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', borderBottom: '1px solid #E2E8F0', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Truck size={16} color="#0077C8" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1F36' }}>Deliveries Map — Live Monitoring</span>
            <span style={{ fontSize: 10, color: '#9CA3AF' }}>{shipments.length} shipments</span>
          </div>
          {/* Close — returns to the Supply Chain dashboard beneath the modal */}
          <button
            onClick={onClose}
            aria-label="Close and return to Supply Chain dashboard"
            style={{
              width: 28, height: 28, borderRadius: 7, border: '1px solid #E2E8F0', background: '#F8FAFC',
              color: '#6B7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F4F6F9'; e.currentTarget.style.color = '#1A1F36'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#6B7280'; }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Map */}
        <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
          <RouteMapLeaflet shipments={shipments} animated interactive showTooltips />
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
          padding: '10px 18px', borderTop: '1px solid #E2E8F0', flexShrink: 0,
        }}>
          {LEGEND.map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: '#6B7280' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, display: 'inline-block', flexShrink: 0 }} />
              {l.label}
            </div>
          ))}
          <span style={{ fontSize: 9, color: '#9CA3AF', marginLeft: 'auto' }}>Hover a route for carrier, distance and progress</span>
        </div>
      </div>
    </>
  );
}

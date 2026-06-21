'use client';
import { Network } from 'lucide-react';
import Card, { ACCENTS } from './Card';

export default function ConnectivityCard({ data, reason, onClick }) {
  if (!data) return null;
  return (
    <Card accent={ACCENTS.accent} onClick={onClick}>
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-3">
          <Network size={13} style={{ color: ACCENTS.accent }} />
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Connectivity</p>
        </div>
        <div className="flex items-end gap-1 mb-2">
          <span className="text-2xl font-extrabold text-text-primary">{data.fiber_routes}</span>
          <span className="text-[10px] text-text-muted mb-1">fiber routes</span>
        </div>
        <div className="grid grid-cols-2 gap-2 flex-1">
          <div>
            <p className="text-[9px] text-text-muted">Latency to hub</p>
            <p className="text-xs font-bold text-text-primary">{data.latency_ms_to_hub} ms</p>
          </div>
          <div>
            <p className="text-[9px] text-text-muted">Carrier density</p>
            <p className="text-xs font-bold text-text-primary">{data.carrier_density}</p>
          </div>
        </div>
        {reason && <p className="text-[9.5px] text-text-muted mt-2 leading-snug">{reason}</p>}
      </div>
    </Card>
  );
}

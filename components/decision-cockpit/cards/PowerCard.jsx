'use client';
import { Zap } from 'lucide-react';
import Card, { ACCENTS } from './Card';

export default function PowerCard({ data, reason, onClick }) {
  if (!data) return null;
  return (
    <Card accent={ACCENTS.amber} onClick={onClick}>
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={13} style={{ color: ACCENTS.amber }} />
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Power</p>
        </div>
        <div className="flex items-end gap-1 mb-2">
          <span className="text-2xl font-extrabold text-text-primary">{data.grid_capacity_mw}</span>
          <span className="text-[10px] text-text-muted mb-1">MW grid capacity</span>
        </div>
        <div className="grid grid-cols-2 gap-2 flex-1">
          <div>
            <p className="text-[9px] text-text-muted">Substation distance</p>
            <p className="text-xs font-bold text-text-primary">{data.substation_distance_km} km</p>
          </div>
          <div>
            <p className="text-[9px] text-text-muted">Renewable mix</p>
            <p className="text-xs font-bold text-text-primary">{data.renewable_mix_pct}%</p>
          </div>
        </div>
        <p className="text-[10px] font-semibold mt-2" style={{ color: ACCENTS.amber }}>{data.verdict}</p>
        {reason && <p className="text-[9.5px] text-text-muted mt-1 leading-snug">{reason}</p>}
      </div>
    </Card>
  );
}

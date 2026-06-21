'use client';
import { ShieldAlert } from 'lucide-react';
import Card, { ACCENTS } from './Card';

export default function RiskCard({ data, reason, onClick }) {
  if (!data) return null;
  return (
    <Card accent={ACCENTS.danger} onClick={onClick}>
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert size={13} style={{ color: ACCENTS.danger }} />
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Risk</p>
        </div>
        <div className="flex items-end gap-1 mb-2">
          <span className="text-2xl font-extrabold text-text-primary">{data.score}</span>
          <span className="text-[10px] text-text-muted mb-1">/100 risk-adjusted score</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {data.coastal && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: ACCENTS.danger + '15', color: ACCENTS.danger }}>
              Coastal
            </span>
          )}
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-grey-bg text-text-secondary">
            Flood: {data.flood_zone}
          </span>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-grey-bg text-text-secondary">
            Regulatory: {data.regulatory_risk}
          </span>
        </div>
        <div className="flex-1 space-y-1">
          {(data.flags || []).slice(0, 2).map(f => (
            <p key={f} className="text-[9.5px] text-text-secondary leading-snug">• {f}</p>
          ))}
        </div>
        {reason && <p className="text-[9.5px] text-text-muted mt-1 leading-snug">{reason}</p>}
      </div>
    </Card>
  );
}

'use client';
import { DollarSign } from 'lucide-react';
import Card, { ACCENTS } from './Card';

export default function CostCard({ data, reason, onClick }) {
  if (!data) return null;
  return (
    <Card accent={ACCENTS.success} onClick={onClick}>
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign size={13} style={{ color: ACCENTS.success }} />
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Cost</p>
        </div>
        <div className="flex items-end gap-1 mb-2">
          <span className="text-2xl font-extrabold text-text-primary">${data.capex_usd_m}M</span>
          <span className="text-[10px] text-text-muted mb-1">CapEx</span>
        </div>
        <div className="grid grid-cols-2 gap-2 flex-1">
          <div>
            <p className="text-[9px] text-text-muted">OpEx / year</p>
            <p className="text-xs font-bold text-text-primary">${data.opex_usd_m_per_year}M</p>
          </div>
          <div>
            <p className="text-[9px] text-text-muted">Payback</p>
            <p className="text-xs font-bold text-text-primary">{data.payback_years} yrs</p>
          </div>
        </div>
        {reason && <p className="text-[9.5px] text-text-muted mt-2 leading-snug">{reason}</p>}
      </div>
    </Card>
  );
}

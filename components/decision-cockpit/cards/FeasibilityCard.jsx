'use client';
import { ClipboardCheck } from 'lucide-react';
import Card, { ACCENTS } from './Card';

export default function FeasibilityCard({ data, reason, onClick }) {
  if (!data) return null;
  return (
    <Card accent={ACCENTS.navy} onClick={onClick}>
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-3">
          <ClipboardCheck size={13} style={{ color: ACCENTS.navy }} />
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Feasibility</p>
        </div>
        <div className="flex items-end gap-1 mb-2">
          <span className="text-2xl font-extrabold text-text-primary">{data.score}</span>
          <span className="text-[10px] text-text-muted mb-1">/100 — {data.verdict}</span>
        </div>
        <div className="space-y-1.5 flex-1">
          {(data.factors || []).map(f => (
            <div key={f.label} className="flex items-center gap-2">
              <span className="text-[10px] text-text-secondary flex-1 truncate">{f.label}</span>
              <div className="w-16 h-1.5 rounded-full bg-grey-bg overflow-hidden flex-shrink-0">
                <div className="h-full rounded-full" style={{ width: `${f.score}%`, background: ACCENTS.navy }} />
              </div>
            </div>
          ))}
        </div>
        {reason && <p className="text-[9.5px] text-text-muted mt-2 leading-snug">{reason}</p>}
      </div>
    </Card>
  );
}

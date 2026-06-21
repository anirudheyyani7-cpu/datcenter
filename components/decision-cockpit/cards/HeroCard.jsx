'use client';
import { CheckCircle2, AlertTriangle, PauseCircle } from 'lucide-react';
import Card, { ACCENTS } from './Card';

function verdictMeta(verdict = '') {
  if (verdict === 'Proceed') return { Icon: CheckCircle2, color: ACCENTS.success };
  if (verdict.startsWith('Hold')) return { Icon: PauseCircle, color: ACCENTS.danger };
  return { Icon: AlertTriangle, color: ACCENTS.amber };
}

export default function HeroCard({ data, reason, onClick }) {
  if (!data) return null;
  const { Icon, color } = verdictMeta(data.verdict);

  return (
    <Card accent={color} onClick={onClick} className="md:col-span-4">
      <div className="p-5 flex items-center gap-5 flex-wrap">
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: color + '15' }}>
            <Icon size={24} style={{ color }} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Final Recommendation</p>
            <p className="text-lg font-extrabold text-text-primary leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {data.headline}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          {(data.summary_metrics || []).map(m => (
            <div key={m.label} className="px-3 py-1.5 bg-grey-bg rounded-lg border border-grey-border">
              <p className="text-[8px] text-text-muted uppercase tracking-wide">{m.label}</p>
              <p className="text-xs font-bold text-text-primary">{m.value}</p>
            </div>
          ))}
          <div className="px-3 py-1.5 rounded-lg" style={{ background: color + '12' }}>
            <p className="text-[8px] uppercase tracking-wide" style={{ color }}>Score</p>
            <p className="text-xs font-bold" style={{ color }}>{data.score}/100</p>
          </div>
        </div>
      </div>
      {reason && <p className="px-5 pb-3 -mt-1 text-[10.5px] text-text-secondary">{reason}</p>}
    </Card>
  );
}

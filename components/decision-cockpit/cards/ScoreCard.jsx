'use client';
import { Target, AlertTriangle, ChevronRight } from 'lucide-react';
import Card, { ACCENTS } from './Card';
import GaugeMeter from './GaugeMeter';

export default function ScoreCard({ title, shaped, reason, accent = 'navy', onDoubleClick }) {
  if (!shaped || typeof shaped.score !== 'number') return null;
  const color = ACCENTS[accent] || ACCENTS.navy;
  const hasFactors = (shaped.factors || []).length > 0;
  const hasFlags = (shaped.flags || []).length > 0;

  return (
    <Card accent={color} onDoubleClick={onDoubleClick}>
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-1">
          <Target size={13} style={{ color }} />
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{title}</p>
        </div>

        <div className="flex items-center gap-2 -mt-1">
          <GaugeMeter score={shaped.score} size={92} />
          <div className="flex-1 min-w-0">
            <p className="text-xl font-extrabold text-text-primary leading-none">{shaped.score}<span className="text-[10px] text-text-muted font-normal">/100</span></p>
            {shaped.verdict && <p className="text-[10px] font-semibold mt-0.5" style={{ color }}>{shaped.verdict}</p>}
          </div>
        </div>

        {hasFactors && (
          <div className="space-y-1.5 mt-1 flex-1">
            {shaped.factors.map(f => (
              <div key={f.label} className="flex items-center gap-2">
                <span className="text-[10px] text-text-secondary flex-1 truncate">{f.label}</span>
                <div className="w-16 h-1.5 rounded-full bg-grey-bg overflow-hidden flex-shrink-0">
                  <div className="h-full rounded-full" style={{ width: `${f.score}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!hasFactors && hasFlags && (
          <div className="flex-1 space-y-1 mt-1">
            {shaped.flags.slice(0, 2).map(f => (
              <p key={f} className="text-[9.5px] text-text-secondary leading-snug">• {f}</p>
            ))}
          </div>
        )}

        {reason && (
          <div className="flex items-start gap-1.5 mt-2 px-2 py-1.5 rounded-lg" style={{ background: color + '0d' }}>
            <AlertTriangle size={11} style={{ color }} className="flex-shrink-0 mt-0.5" />
            <p className="text-[9.5px] text-text-secondary leading-snug flex-1">{reason}</p>
            <ChevronRight size={11} className="text-text-muted flex-shrink-0 mt-0.5" />
          </div>
        )}
      </div>
    </Card>
  );
}

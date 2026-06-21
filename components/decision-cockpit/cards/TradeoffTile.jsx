'use client';
import { CheckCircle2, AlertTriangle, Scale } from 'lucide-react';
import { ACCENTS } from './Card';

const TONE = {
  strength: { Icon: CheckCircle2, color: ACCENTS.success },
  caution: { Icon: AlertTriangle, color: ACCENTS.amber },
  balanced: { Icon: Scale, color: ACCENTS.navy },
};

export default function TradeoffTile({ tone = 'balanced', title, body }) {
  const { Icon, color } = TONE[tone] || TONE.balanced;
  return (
    <div className="rounded-xl border border-grey-border p-3 flex flex-col gap-1.5 h-full" style={{ background: color + '06' }}>
      <div className="flex items-center gap-1.5">
        <Icon size={13} style={{ color }} />
        <p className="text-[11px] font-bold" style={{ color }}>{title}</p>
      </div>
      {body && <p className="text-[10px] text-text-secondary leading-snug">{body}</p>}
    </div>
  );
}

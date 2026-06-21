'use client';
import { Lightbulb } from 'lucide-react';
import Card, { ACCENTS } from './Card';

// For modules whose data is qualitative rather than ranked/numeric/scored —
// completes the 4-type card system even though no current module needs it.
export default function InsightCard({ title, shaped, reason, accent = 'amber', onDoubleClick }) {
  if (!shaped) return null;
  const color = ACCENTS[accent] || ACCENTS.amber;

  return (
    <Card accent={color} onDoubleClick={onDoubleClick}>
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={13} style={{ color }} />
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{title}</p>
        </div>
        <p className="text-[11.5px] text-text-primary font-medium leading-snug flex-1">{shaped.summary}</p>
        {reason && <p className="text-[9.5px] text-text-muted mt-2 leading-snug">{reason}</p>}
      </div>
    </Card>
  );
}

'use client';
import { MapPin } from 'lucide-react';
import Card, { ACCENTS } from './Card';

export default function TopLocationsCard({ data, reason, onClick }) {
  if (!data?.ranked) return null;
  return (
    <Card accent={ACCENTS.navy} onClick={onClick}>
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={13} style={{ color: ACCENTS.navy }} />
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Top Locations</p>
        </div>
        <div className="space-y-2 flex-1">
          {data.ranked.slice(0, 3).map((loc, i) => (
            <div key={loc.name} className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-grey-bg flex items-center justify-center text-[9px] font-bold text-text-secondary flex-shrink-0">
                {i + 1}
              </span>
              <span className="text-[11px] text-text-primary font-medium leading-tight truncate flex-1">{loc.name}</span>
              <span className="text-[10px] font-bold flex-shrink-0" style={{ color: ACCENTS.navy }}>{loc.score}</span>
            </div>
          ))}
        </div>
        {reason && <p className="text-[9.5px] text-text-muted mt-2 leading-snug">{reason}</p>}
      </div>
    </Card>
  );
}

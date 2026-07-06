'use client';

// Horizontal lifecycle timeline.
// stages: [{ label, date, sub, status: 'past' | 'next' | 'current' | 'future' }]

const STATUS_COLOR = {
  past:    '#10B981',
  next:    '#0077C8',
  current: '#F59E0B',
  future:  'rgba(255,255,255,0.20)',
};
const STATUS_TEXT = {
  past:    '#10B981',
  next:    '#fff',
  current: '#F59E0B',
  future:  'rgba(255,255,255,0.25)',
};

export default function Stepper({ stages = [] }) {
  if (!stages.length) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, overflowX: 'auto', paddingBottom: 4 }}>
      {stages.map((stage, i) => {
        const color  = STATUS_COLOR[stage.status] ?? STATUS_COLOR.future;
        const tColor = STATUS_TEXT[stage.status]  ?? STATUS_TEXT.future;
        const isLast = i === stages.length - 1;

        return (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', flex: isLast ? '0 0 auto' : 1, minWidth: 80 }}>
            {/* Stage column */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flexShrink: 0 }}>
              {/* Circle node */}
              <div style={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${color}`,
                background: stage.status === 'next' ? '#0077C8' : stage.status === 'current' ? 'rgba(245,158,11,0.18)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: stage.status === 'next' ? '0 0 12px rgba(0,119,200,0.45)' : 'none',
              }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: stage.status === 'future' ? 'rgba(255,255,255,0.15)' : color,
                }} />
              </div>
              {/* Label */}
              <div style={{ textAlign: 'center', maxWidth: 80 }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: tColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {stage.label}
                </p>
                <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', marginTop: 2, whiteSpace: 'nowrap' }}>
                  {stage.date}
                </p>
                {stage.sub && (
                  <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', marginTop: 1, whiteSpace: 'nowrap' }}>
                    {stage.sub}
                  </p>
                )}
              </div>
            </div>
            {/* Connector line (not shown after last stage) */}
            {!isLast && (
              <div style={{
                flex: 1,
                height: 2,
                marginTop: 16,
                background: stage.status === 'future' || stages[i + 1]?.status === 'future'
                  ? 'rgba(255,255,255,0.10)'
                  : `linear-gradient(90deg, ${color}, ${STATUS_COLOR[stages[i + 1]?.status] ?? color})`,
                borderStyle: stage.status === 'next' || stages[i + 1]?.status === 'future' ? 'dashed' : 'solid',
                borderWidth: stage.status === 'next' || stages[i + 1]?.status === 'future' ? '0 0 2px 0' : 'none',
                borderColor: 'rgba(255,255,255,0.15)',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

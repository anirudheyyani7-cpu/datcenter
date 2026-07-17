'use client';
// BuildingFloorStack – 2D horizontal floor bars stacked like a building cross-section.
// Props: { floors: Node[], selectedId, onSelect }

const STATUS = {
  operational: { fill: 'rgba(34,197,94,0.18)',   stroke: '#22c55e', label: 'Operational' },
  maintenance:  { fill: 'rgba(249,115,22,0.18)',  stroke: '#f97316', label: 'Maintenance' },
  critical:     { fill: 'rgba(239,68,68,0.18)',   stroke: '#ef4444', label: 'Critical'    },
};

export default function BuildingFloorStack({ floors = [], selectedId, onSelect }) {
  const total  = floors.length;
  if (total === 0) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9CA3AF', fontSize: 12 }}>
      No floors defined
    </div>
  );

  // Render bottom-up (highest index = ground floor visually at bottom)
  const reversed = [...floors].reverse();
  const barH = Math.min(72, Math.floor(380 / total));
  const gap   = 8;

  return (
    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', padding: '20px 32px' }}>
      {/* Building silhouette wrapper */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 520 }}>
        {/* Left edge label "↑ Floor levels" */}
        <div style={{
          position: 'absolute', left: -32, top: '50%', transform: 'rotate(-90deg) translateX(50%)',
          fontSize: 9, color: '#9CA3AF', whiteSpace: 'nowrap', letterSpacing: '0.08em',
        }}>↑ FLOOR LEVELS</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: gap }}>
          {reversed.map((floor, idx) => {
            const isSelected = floor.id === selectedId;
            const theme = STATUS[floor.status] || STATUS.operational;
            const isRoof = floor.name.toLowerCase().includes('roof');
            return (
              <div
                key={floor.id}
                onClick={() => !isRoof && onSelect(floor.id)}
                style={{
                  height:       barH,
                  borderRadius: idx === 0 ? '10px 10px 0 0' : idx === reversed.length - 1 ? '0 0 6px 6px' : 4,
                  background:   isSelected ? theme.fill.replace('0.18', '0.35') : theme.fill,
                  border:       `1px solid ${isSelected ? '#1A1F36' : theme.stroke}`,
                  boxShadow:    isSelected ? `0 0 0 2px ${theme.stroke}66` : 'none',
                  cursor:       isRoof ? 'default' : 'pointer',
                  display:      'flex',
                  alignItems:   'center',
                  padding:      '0 16px',
                  gap:          12,
                  transition:   'all 0.15s',
                  position:     'relative',
                  overflow:     'hidden',
                }}
              >
                {/* Floor number indicator */}
                <div style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  background: isSelected ? theme.stroke + '33' : '#F8FAFC',
                  border: `1px solid ${isSelected ? theme.stroke : '#E2E8F0'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: isSelected ? theme.stroke : '#6B7280',
                }}>
                  {isRoof ? '≡' : reversed.length - idx}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#1A1F36' }}>
                    {floor.name}
                  </div>
                  <div style={{ fontSize: 9, color: '#6B7280', marginTop: 2 }}>
                    {floor.children?.length ?? 0} rooms
                    {floor.rackCount ? ` · ${floor.rackCount} racks` : ''}
                  </div>
                </div>

                {/* Status dot + label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: theme.stroke }} />
                  <span style={{ fontSize: 9, color: theme.stroke, fontWeight: 700 }}>{theme.label}</span>
                </div>

                {/* Rack count badge */}
                {!isRoof && (
                  <div style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 9, color: '#9CA3AF',
                  }}>
                    {isSelected ? '▶' : ''}
                  </div>
                )}

                {/* Window decoration (cosmetic) */}
                {!isRoof && (
                  <div style={{ position: 'absolute', right: 28, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 4 }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width: 8, height: barH * 0.45, background: '#F8FAFC', borderRadius: 1, border: '1px solid #E2E8F0' }} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

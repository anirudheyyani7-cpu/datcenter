'use client';

const ROW_LABELS = ['Very High', 'High', 'Medium', 'Low', 'Very Low'];
const COL_LABELS = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];

// Risk level 1-25 based on (5-rowIdx) × (colIdx+1)
function riskBg(rowIdx, colIdx) {
  const level = (5 - rowIdx) * (colIdx + 1);
  if (level >= 16) return '#EF4444';
  if (level >= 10) return '#F59E0B';
  if (level >= 5)  return 'rgba(251,191,36,0.85)'; // yellow
  return '#22C55E';
}
function riskText(rowIdx, colIdx) {
  return (5 - rowIdx) * (colIdx + 1) >= 5 ? '#fff' : '#1a1a1a';
}

export default function RiskHeatmapGrid({ rows = [], viewAllHref }) {
  const heatRows = rows.length > 0 ? rows : ROW_LABELS.map(() => ({ cells: [0, 0, 0, 0, 0] }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Grid area with axis labels */}
      <div style={{ display: 'flex', gap: 4 }}>
        {/* Y-axis label + row labels */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: 4, alignItems: 'center' }}>
          {/* Vertical "Likelihood" label */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 14 }}>
            <span style={{ fontSize: 7, fontWeight: 700, color: 'rgba(255,255,255,0.30)', textTransform: 'uppercase', letterSpacing: '0.06em', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              Likelihood
            </span>
          </div>
          {/* Row labels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {(rows.length > 0 ? rows.map(r => r.label) : ROW_LABELS).map(l => (
              <div key={l} style={{ height: 28, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.40)', whiteSpace: 'nowrap', textAlign: 'right', minWidth: 44 }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* The 5×5 grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
          {heatRows.map((row, ri) => (
            <div key={ri} style={{ display: 'flex', gap: 3 }}>
              {row.cells.map((val, ci) => (
                <div key={ci} style={{
                  flex: 1, height: 28, borderRadius: 4,
                  background: riskBg(ri, ci),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: riskText(ri, ci),
                  fontFamily: 'ui-monospace,monospace',
                }}>
                  {val}
                </div>
              ))}
            </div>
          ))}

          {/* Column labels */}
          <div style={{ display: 'flex', gap: 3, marginTop: 2 }}>
            {COL_LABELS.map(l => (
              <div key={l} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.40)', textAlign: 'center' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Impact axis label */}
      <div style={{ display: 'flex', justifyContent: 'center', marginLeft: 62 }}>
        <span style={{ fontSize: 7, fontWeight: 700, color: 'rgba(255,255,255,0.30)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Impact
        </span>
      </div>

      {/* View All link */}
      {viewAllHref && (
        <a href={viewAllHref} style={{ fontSize: 9, color: '#0077C8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
          View Risk Dashboard →
        </a>
      )}
    </div>
  );
}

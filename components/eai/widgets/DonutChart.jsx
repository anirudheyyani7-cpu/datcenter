'use client';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function DonutChart({
  data = [],          // [{ name, value, color }]
  centerLabel,        // e.g. '2,134'
  centerUnit,         // e.g. 'MW'
  centerSublabel,     // e.g. 'Total Capacity'
  height = 160,
  innerRadius = 52,
  outerRadius = 76,
  showLegend = true,
}) {
  return (
    <div>
      {/* Chart with center label — explicit width prevents ResponsiveContainer measuring 0 */}
      <div style={{ position: 'relative', height, width: '100%', overflow: 'hidden' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              dataKey="value"
              strokeWidth={0}
              startAngle={90}
              endAngle={-270}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        {centerLabel && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: 'monospace', lineHeight: 1 }}>
                {centerLabel}
                {centerUnit && <span style={{ fontSize: 12, marginLeft: 2, color: 'rgba(255,255,255,0.45)' }}>{centerUnit}</span>}
              </p>
              {centerSublabel && (
                <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>{centerSublabel}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
          {data.map(item => (
            <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0, display: 'inline-block' }} />
                <span style={{ color: 'rgba(255,255,255,0.50)' }}>{item.name}</span>
              </div>
              <div style={{ flexShrink: 0, marginLeft: 8 }}>
                {item.mw !== undefined && (
                  <span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.70)' }}>
                    {item.mw.toLocaleString()} MW
                  </span>
                )}
                {item.value !== undefined && item.mw === undefined && (
                  <span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.70)' }}>
                    {item.value.toLocaleString()}
                  </span>
                )}
                {item.pct !== undefined && (
                  <span style={{ color: 'rgba(255,255,255,0.25)', marginLeft: 4, fontSize: 9 }}>({item.pct}%)</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

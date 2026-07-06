'use client';
import {
  ComposedChart, Line, ReferenceLine, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const LEGEND_ITEMS = [
  { label: 'Actual',          color: '#0077C8', dashed: false },
  { label: 'Forecast',        color: '#0077C8', dashed: true  },
  { label: 'Capacity Limit',  color: '#EF4444', dashed: true  },
];

export default function ForecastChart({
  data = [],
  capacityLimitMW = 175,
  projectedExceedDate = '',
  height = 220,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Manual legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {LEGEND_ITEMS.map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: 'rgba(255,255,255,0.55)' }}>
            <svg width="18" height="8" viewBox="0 0 18 8">
              {l.dashed
                ? <line x1="0" y1="4" x2="18" y2="4" stroke={l.color} strokeWidth="2" strokeDasharray="4 3" />
                : <line x1="0" y1="4" x2="18" y2="4" stroke={l.color} strokeWidth="2" />
              }
            </svg>
            {l.label}
          </div>
        ))}
      </div>

      {/* Chart + annotation */}
      <div style={{ position: 'relative', width: '100%', height }}>
        <div style={{ width: '100%', height, overflow: 'hidden' }}>
          <ResponsiveContainer width="100%" height={height}>
            <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.35)' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.35)' }}
                axisLine={false} tickLine={false}
                width={30}
                domain={[0, 220]}
                tickCount={5}
              />
              <Tooltip
                contentStyle={{ background: '#1C2340', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, fontSize: 10, color: '#fff' }}
                formatter={(v, n) => v != null ? [`${v} MW`, n] : [null]}
                labelStyle={{ color: 'rgba(255,255,255,0.55)' }}
              />

              {/* Capacity limit reference line */}
              <ReferenceLine
                y={capacityLimitMW}
                stroke="#EF4444"
                strokeDasharray="4 3"
                strokeWidth={1.5}
              />

              {/* Actual line */}
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual"
                stroke="#0077C8"
                strokeWidth={2}
                dot={{ r: 4, fill: '#0077C8', strokeWidth: 0 }}
                activeDot={{ r: 5 }}
                connectNulls={false}
              />

              {/* Forecast dashed line */}
              <Line
                type="monotone"
                dataKey="forecast"
                name="Forecast"
                stroke="#0077C8"
                strokeWidth={2}
                strokeDasharray="5 3"
                dot={false}
                activeDot={{ r: 5 }}
                connectNulls={true}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Projected exceed annotation */}
        {projectedExceedDate && (
          <div style={{
            position: 'absolute', right: 8, bottom: 56,
            fontSize: 8, color: '#EF4444', textAlign: 'right',
            maxWidth: 130, lineHeight: 1.5, pointerEvents: 'none',
          }}>
            Projected to exceed capacity on<br /><strong>{projectedExceedDate}</strong>
          </div>
        )}
      </div>
    </div>
  );
}

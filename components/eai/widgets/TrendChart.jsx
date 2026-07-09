'use client';
import {
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis, ResponsiveContainer, Tooltip,
} from 'recharts';

function DarkTip({ active, payload, label, unit = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#FFFFFF', border: '1px solid #E2E8F0',
      boxShadow: '0 2px 8px rgba(16,24,40,0.08)',
      borderRadius: 8, padding: '6px 10px', fontSize: 11, color: '#1A1F36',
    }}>
      {label && <p style={{ color: '#6B7280', marginBottom: 2, fontSize: 9 }}>{label}</p>}
      <p style={{ fontWeight: 700, color: '#0077C8' }}>{payload[0].value}{unit}</p>
    </div>
  );
}

export default function TrendChart({
  type = 'line',   // 'line' | 'bar'
  data = [],       // [{ name/week, value }]
  color = '#0077C8',
  unit = '',
  height = 130,
  dataKey = 'value',
  xKey = 'week',
  domain,
}) {
  const axis = {
    xAxis: <XAxis dataKey={xKey} tick={{ fontSize: 7, fill: '#6B7280' }} axisLine={false} tickLine={false} />,
    yAxis: <YAxis domain={domain} tick={{ fontSize: 7, fill: '#6B7280' }} axisLine={false} tickLine={false} />,
    tooltip: <Tooltip content={<DarkTip unit={unit} />} />,
  };

  return (
    // Width:100% + overflow:hidden on the wrapper ensures ResponsiveContainer always
    // gets a defined measurement context even inside zero-width flex parents.
    <div style={{ width: '100%', overflow: 'hidden' }}>
    <ResponsiveContainer width="100%" height={height}>
      {type === 'bar' ? (
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
          {axis.xAxis}
          {axis.yAxis}
          <Bar dataKey={dataKey} fill={color} radius={[3, 3, 0, 0]} maxBarSize={20} />
          {axis.tooltip}
        </BarChart>
      ) : (
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
          {axis.xAxis}
          {axis.yAxis}
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={{ r: 2.5, fill: color, strokeWidth: 0 }}
          />
          {axis.tooltip}
        </LineChart>
      )}
    </ResponsiveContainer>
    </div>
  );
}

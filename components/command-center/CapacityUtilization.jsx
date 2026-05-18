'use client';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, ReferenceLine, ResponsiveContainer, Tooltip, BarChart, Bar } from 'recharts';
import { mockCapacityData } from '@/data/command-center-mock';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#1A1F36] border border-white/10 rounded-lg px-3 py-2 text-xs text-white shadow-xl">
        {payload[0].name}: <span className="font-bold">{payload[0].value}%</span>
      </div>
    );
  }
  return null;
};

export default function CapacityUtilization() {
  const { rackUtilization, powerMW, coolingLoad, whiteSpace, forecastGrowth } = mockCapacityData;

  const powerDonut = [
    { name: 'Consumed', value: powerMW.consumed, color: '#00338D' },
    { name: 'Available', value: powerMW.available, color: '#E2E8F0' },
  ];

  const coolingColor = coolingLoad >= 90 ? '#DC2626' : coolingLoad >= 80 ? '#D4A017' : '#00A36C';

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-[#1A1F36] text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Capacity & Utilization</h2>
        <span className="text-[10px] text-[#9CA3AF] font-semibold uppercase tracking-wider">Live</span>
      </div>

      <div className="space-y-5">
        {/* Rack Utilization */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-semibold text-[#6B7280]">Rack Utilization</p>
            <span className="text-xs text-[#9CA3AF]">{rackUtilization.total.toLocaleString()} total racks</span>
          </div>
          <div className="h-4 rounded-full overflow-hidden flex bg-[#E2E8F0]">
            <div className="h-full bg-[#00338D] transition-all" style={{ width: `${rackUtilization.used}%` }} title={`Used ${rackUtilization.used}%`} />
            <div className="h-full bg-[#0077C8]/40 transition-all" style={{ width: `${rackUtilization.reserved}%` }} title={`Reserved ${rackUtilization.reserved}%`} />
          </div>
          <div className="flex gap-3 mt-1.5 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00338D]" />Used {rackUtilization.used}%</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#0077C8]/40" />Reserved {rackUtilization.reserved}%</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#E2E8F0]" />Available {rackUtilization.available}%</span>
          </div>
        </div>

        {/* Power + Cooling row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Power donut */}
          <div className="flex flex-col items-center">
            <p className="text-xs font-semibold text-[#6B7280] mb-2">Power Consumption</p>
            <div className="relative">
              <PieChart width={100} height={100}>
                <Pie data={powerDonut} innerRadius={30} outerRadius={45} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                  {powerDonut.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-[#1A1F36]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{powerMW.consumed}</span>
                <span className="text-[9px] text-[#9CA3AF]">MW</span>
              </div>
            </div>
            <p className="text-[10px] text-[#9CA3AF] text-center">{powerMW.available} MW available</p>
          </div>

          {/* Cooling headroom */}
          <div className="flex flex-col">
            <p className="text-xs font-semibold text-[#6B7280] mb-2">Cooling Headroom</p>
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-[#9CA3AF]">Thermal Load</span>
                <span className="text-xs font-bold" style={{ color: coolingColor, fontFamily: "'JetBrains Mono', monospace" }}>{coolingLoad}%</span>
              </div>
              <div className="h-3 bg-[#E2E8F0] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${coolingLoad}%`, backgroundColor: coolingColor }} />
              </div>
              <p className="text-[10px] mt-1" style={{ color: coolingColor }}>
                {coolingLoad >= 80 ? '⚠ Above 80% threshold' : 'Within safe range'}
              </p>
            </div>
          </div>
        </div>

        {/* White Space */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-[#6B7280]">White Space Available</p>
            <span className="text-xs font-bold text-[#1A1F36]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{whiteSpace.totalSqm.toLocaleString()} sqm</span>
          </div>
          <ResponsiveContainer width="100%" height={45}>
            <BarChart data={whiteSpace.breakdown} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Bar dataKey="sqm" fill="#0077C8" radius={[3, 3, 0, 0]} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Forecast growth */}
        <div>
          <p className="text-xs font-semibold text-[#6B7280] mb-2">6-Month Utilization Forecast</p>
          <ResponsiveContainer width="100%" height={70}>
            <LineChart data={forecastGrowth} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis domain={[70, 90]} tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <ReferenceLine y={85} stroke="#DC2626" strokeDasharray="4 2" strokeWidth={1} />
              <Line type="monotone" dataKey="utilization" stroke="#0077C8" strokeWidth={2} dot={{ r: 2, fill: '#0077C8' }} isAnimationActive={false} />
              <Tooltip content={<CustomTooltip />} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-[10px] text-[#9CA3AF] text-right">— 85% critical threshold</p>
        </div>
      </div>
    </div>
  );
}

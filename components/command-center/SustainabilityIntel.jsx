'use client';
import { LineChart, Line, XAxis, YAxis, ReferenceLine, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { TrendingDown, Droplets } from 'lucide-react';
import { mockSustainabilityData } from '@/data/command-center-mock';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#1A1F36] border border-white/10 rounded-lg px-3 py-2 text-xs text-white shadow-xl">
        <p className="text-white/50 mb-0.5">{label}</p>
        <p className="font-bold text-[#0077C8]">PUE: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

function CircularProgress({ value, max = 100, grade, size = 72 }) {
  const pct = value / max;
  const r = (size - 8) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - pct * circumference;
  const color = pct >= 0.8 ? '#00A36C' : pct >= 0.6 ? '#D4A017' : '#DC2626';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={6} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-sm font-bold text-[#1A1F36]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
        <div className="text-[9px] font-bold" style={{ color }}>{grade}</div>
      </div>
    </div>
  );
}

export default function SustainabilityIntel() {
  const { pueTrend, industryAvgPUE, carbonIntensity, renewableMix, wue, esgScore, esgGrade } = mockSustainabilityData;

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-[#1A1F36] text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Sustainability Intelligence</h2>
        <span className="text-[10px] text-[#00A36C] font-bold bg-[#00A36C]/10 px-2 py-0.5 rounded-full">ESG Tracking</span>
      </div>

      <div className="space-y-4">
        {/* PUE Trend */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-semibold text-[#6B7280]">PUE 12-Month Trend</p>
            <div className="flex items-center gap-1.5 text-[10px] text-[#9CA3AF]">
              <span className="w-6 border-t border-dashed border-[#DC2626]/50" />Industry avg: {industryAvgPUE}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={pueTrend} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <XAxis dataKey="month" tick={{ fontSize: 8, fill: '#9CA3AF' }} axisLine={false} tickLine={false} interval={2} />
              <YAxis domain={[1.3, 1.65]} tick={{ fontSize: 8, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <ReferenceLine y={industryAvgPUE} stroke="#DC2626" strokeDasharray="4 2" strokeWidth={1} />
              <Line type="monotone" dataKey="pue" stroke="#0077C8" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Tooltip content={<CustomTooltip />} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {/* Carbon intensity */}
          <div className="bg-[#F4F6F9] rounded-xl p-3">
            <p className="text-[10px] text-[#9CA3AF] mb-1">Carbon Intensity</p>
            <p className="text-sm font-bold text-[#1A1F36]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{carbonIntensity.value}</p>
            <p className="text-[9px] text-[#9CA3AF]">tCO₂/MWh</p>
            <div className="flex items-center gap-0.5 mt-1">
              <TrendingDown size={10} className="text-[#00A36C]" />
              <span className="text-[10px] text-[#00A36C] font-semibold">{Math.abs(carbonIntensity.yoyChange)}% YoY</span>
            </div>
          </div>

          {/* WUE */}
          <div className="bg-[#F4F6F9] rounded-xl p-3">
            <p className="text-[10px] text-[#9CA3AF] mb-1">WUE</p>
            <p className="text-sm font-bold text-[#1A1F36]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{wue}</p>
            <p className="text-[9px] text-[#9CA3AF]">L/kWh</p>
            <div className="flex items-center gap-0.5 mt-1">
              <Droplets size={10} className="text-[#0077C8]" />
              <span className="text-[10px] text-[#0077C8] font-semibold">On target</span>
            </div>
          </div>

          {/* ESG */}
          <div className="bg-[#F4F6F9] rounded-xl p-3 flex flex-col items-center justify-center">
            <p className="text-[10px] text-[#9CA3AF] mb-1.5">ESG Score</p>
            <CircularProgress value={esgScore} grade={esgGrade} size={56} />
          </div>
        </div>

        {/* Renewable energy mix */}
        <div>
          <p className="text-xs font-semibold text-[#6B7280] mb-2">Renewable Energy Mix</p>
          <div className="flex items-center gap-4">
            <PieChart width={80} height={80}>
              <Pie data={renewableMix} innerRadius={22} outerRadius={38} dataKey="value" strokeWidth={0}>
                {renewableMix.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
            </PieChart>
            <div className="flex flex-col gap-1.5">
              {renewableMix.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] text-[#6B7280]">{item.name}</span>
                  <span className="text-[10px] font-bold text-[#1A1F36]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

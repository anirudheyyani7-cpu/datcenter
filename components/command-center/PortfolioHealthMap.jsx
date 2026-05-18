'use client';
import { useState } from 'react';
import { mockDatacenters } from '@/data/command-center-mock';

const REGION_ORDER = ['APAC', 'EMEA', 'Americas'];
const STATUS_DOT = {
  healthy:  { bg: 'bg-[#00A36C]', ring: 'ring-[#00A36C]/30' },
  degraded: { bg: 'bg-[#D4A017]', ring: 'ring-[#D4A017]/30' },
  critical: { bg: 'bg-[#DC2626]', ring: 'ring-[#DC2626]/30' },
};

function DCMarker({ dc }) {
  const [hovered, setHovered] = useState(false);
  const { bg, ring } = STATUS_DOT[dc.status] ?? STATUS_DOT.healthy;

  return (
    <div className="relative flex flex-col items-center" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className={`w-3 h-3 rounded-full ${bg} ring-4 ${ring} cursor-pointer transition-transform ${hovered ? 'scale-150' : 'scale-100'}`} />
      {hovered && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-20 w-52 bg-[#1A1F36] border border-white/10 rounded-xl p-3 shadow-2xl pointer-events-none">
          <p className="text-white font-bold text-xs mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{dc.name}</p>
          <p className="text-white/50 text-[10px] mb-2">{dc.city}, {dc.country}</p>
          <div className="grid grid-cols-2 gap-1 text-[10px]">
            <div><span className="text-white/40">Health</span><br /><span className="text-white font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{dc.healthScore}/100</span></div>
            <div><span className="text-white/40">Utilization</span><br /><span className="text-white font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{dc.utilizationPercent}%</span></div>
            <div><span className="text-white/40">Capacity</span><br /><span className="text-white font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{dc.totalCapacityMW} MW</span></div>
            <div><span className="text-white/40">Incidents</span><br /><span className={`font-semibold ${dc.activeIncidents > 0 ? 'text-[#D4A017]' : 'text-[#00A36C]'}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{dc.activeIncidents}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}

function RegionPanel({ region, dcs }) {
  const healthy = dcs.filter(d => d.status === 'healthy').length;
  const degraded = dcs.filter(d => d.status === 'degraded').length;
  const critical = dcs.filter(d => d.status === 'critical').length;
  const avgHealth = Math.round(dcs.reduce((s, d) => s + d.healthScore, 0) / dcs.length);

  return (
    <div className="flex-1 bg-[#F4F6F9] rounded-xl border border-[#E2E8F0] p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-[#1A1F36] text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{region}</h3>
        <div className="flex items-center gap-2 text-[10px] text-[#9CA3AF]">
          <span className="font-semibold text-[#1A1F36]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{avgHealth}</span>
          <span>avg health</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-3 items-center">
        {dcs.map(dc => <DCMarker key={dc.id} dc={dc} />)}
      </div>

      <div className="flex gap-3 text-[10px]">
        {healthy > 0 && <span className="flex items-center gap-1 text-[#00A36C]"><span className="w-1.5 h-1.5 rounded-full bg-[#00A36C]" />{healthy} Healthy</span>}
        {degraded > 0 && <span className="flex items-center gap-1 text-[#D4A017]"><span className="w-1.5 h-1.5 rounded-full bg-[#D4A017]" />{degraded} Degraded</span>}
        {critical > 0 && <span className="flex items-center gap-1 text-[#DC2626]"><span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />{critical} Critical</span>}
      </div>

      <div className="mt-3 space-y-1">
        {dcs.map(dc => (
          <div key={dc.id} className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[dc.status]?.bg ?? 'bg-[#00A36C]'}`} />
            <span className="text-[10px] text-[#6B7280] truncate flex-1">{dc.name}</span>
            <span className="text-[10px] font-semibold text-[#1A1F36]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{dc.healthScore}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PortfolioHealthMap() {
  const byRegion = REGION_ORDER.map(region => ({
    region,
    dcs: mockDatacenters.filter(d => d.region === region),
  }));

  const totalHealthy = mockDatacenters.filter(d => d.status === 'healthy').length;
  const totalDegraded = mockDatacenters.filter(d => d.status === 'degraded').length;
  const totalIncidents = mockDatacenters.reduce((s, d) => s + d.activeIncidents, 0);

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold text-[#1A1F36] text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Portfolio Health Map</h2>
          <p className="text-[#9CA3AF] text-xs mt-0.5">{mockDatacenters.length} facilities across 3 regions</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-[#00A36C] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#00A36C]" />{totalHealthy} Healthy
          </span>
          <span className="flex items-center gap-1.5 text-[#D4A017] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#D4A017]" />{totalDegraded} Degraded
          </span>
          <span className="flex items-center gap-1.5 text-[#DC2626] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#DC2626]" />{totalIncidents} Active Incidents
          </span>
        </div>
      </div>

      <div className="flex gap-4">
        {byRegion.map(({ region, dcs }) => (
          <RegionPanel key={region} region={region} dcs={dcs} />
        ))}
      </div>
    </div>
  );
}

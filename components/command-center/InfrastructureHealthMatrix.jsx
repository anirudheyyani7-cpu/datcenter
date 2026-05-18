'use client';
import { Zap, Thermometer, Network, Shield, Flame, Droplets } from 'lucide-react';
import { mockInfraHealth } from '@/data/command-center-mock';
import StatusBadge from './StatusBadge';

const ICON_MAP = { Zap, Thermometer, Network, Shield, Flame, Droplets };

const RISK_STATUS = { None: 'healthy', Low: 'healthy', Medium: 'warning', High: 'critical' };

function HealthBar({ pct }) {
  const color = pct >= 98 ? '#00A36C' : pct >= 90 ? '#D4A017' : '#DC2626';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-semibold text-[#1A1F36] w-10 text-right" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{pct}%</span>
    </div>
  );
}

export default function InfrastructureHealthMatrix() {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-[#1A1F36] text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Infrastructure Health Matrix</h2>
        <span className="text-[10px] text-[#9CA3AF] font-semibold uppercase tracking-wider">Global Portfolio</span>
      </div>

      <div className="space-y-4">
        {mockInfraHealth.map(row => {
          const Icon = ICON_MAP[row.icon] ?? Zap;
          return (
            <div key={row.system} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#00338D]/8 flex items-center justify-center">
                    <Icon size={14} className="text-[#00338D]" />
                  </div>
                  <span className="text-xs font-semibold text-[#1A1F36]">{row.system}</span>
                </div>
                <StatusBadge status={RISK_STATUS[row.failureRisk] ?? 'healthy'} label={`${row.failureRisk} Risk`} size="xs" />
              </div>

              <HealthBar pct={row.healthPct} />

              <div className="flex items-center justify-between text-[10px] pl-9">
                <span className="text-[#9CA3AF]">
                  Degraded:{' '}
                  <span className={row.degraded > 0 ? 'text-[#D4A017] font-bold' : 'text-[#00A36C] font-bold'}>
                    {row.degraded}
                  </span>
                  <span className="text-[#9CA3AF]">/{row.total.toLocaleString()}</span>
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#F4F6F9] text-[#6B7280] font-medium">{row.redundancy}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

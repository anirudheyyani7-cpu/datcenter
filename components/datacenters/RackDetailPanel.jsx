'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Server, Weight, Network, Thermometer, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react';
import { mockRacks } from '@/data/mock/racks';
import { useRouter } from 'next/navigation';

function ProgressBar({ value, max, color }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const barColor = pct > 90 ? '#DC2626' : pct > 75 ? '#D4A017' : color || '#0077C8';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-[#E2E8F0] overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: barColor }} />
      </div>
      <span className="text-[10px] font-mono w-8 text-right" style={{ color: barColor }}>{pct}%</span>
    </div>
  );
}

function MetricRow({ icon: Icon, label, used, max, unit, color }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon size={11} className="text-[#9CA3AF]" />
          <span className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wide">{label}</span>
        </div>
        <span className="text-[10px] font-mono text-[#1A1F36]">
          {typeof used === 'number' && Number.isInteger(used) ? used : used} / {max} {unit}
        </span>
      </div>
      <ProgressBar value={used} max={max} color={color} />
    </div>
  );
}

const STATUS_STYLES = {
  operational: { color: '#00A36C', bg: '#F0FDF4', label: 'Operational' },
  warning:     { color: '#D4A017', bg: '#FFFBEB', label: 'Warning' },
  critical:    { color: '#DC2626', bg: '#FEF2F2', label: 'Critical' },
};

export default function RackDetailPanel({ rackId, dcId, onClose }) {
  const router = useRouter();
  const dcRacks = mockRacks[dcId] || [];
  const rack = dcRacks.find(r => r.id === rackId);

  if (!rack) return null;

  const s = STATUS_STYLES[rack.status] || STATUS_STYLES.operational;
  const tempColor = rack.inletTempC > 35 ? '#DC2626' : rack.inletTempC > 28 ? '#D4A017' : '#00A36C';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="absolute right-0 top-0 bottom-0 w-72 z-30 flex flex-col shadow-2xl"
        style={{ background: 'white', borderLeft: '1px solid #E2E8F0' }}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0]">
          <div>
            <div className="text-[10px] text-[#9CA3AF] font-mono uppercase tracking-widest">Rack Asset Twin</div>
            <div className="text-sm font-bold text-[#1A1F36]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Rack {rack.label}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F4F6F9] text-[#9CA3AF] hover:text-[#1A1F36] transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Status badge + tenant */}
        <div className="flex-shrink-0 px-4 py-2 border-b border-[#F4F6F9] flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: s.bg, color: s.color }}>
            {s.label}
          </span>
          {rack.tenant ? (
            <span className="text-[10px] text-[#6B7280]">Tenant: <strong className="text-[#1A1F36]">{rack.tenant}</strong></span>
          ) : (
            <span className="text-[10px] text-[#9CA3AF] italic">Unallocated</span>
          )}
        </div>

        {/* Metrics */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {/* Capacity metrics */}
          <div className="space-y-3">
            <MetricRow icon={Zap}       label="Power"   used={rack.powerKw}    max={rack.maxPowerKw}    unit="kW"  color="#0077C8" />
            <MetricRow icon={Server}    label="Space"   used={rack.spaceUsedU}  max={rack.spaceTotalU}   unit="U"   color="#8b5cf6" />
            <MetricRow icon={Weight}    label="Weight"  used={rack.weightKg}    max={rack.maxWeightKg}   unit="kg"  color="#f59e0b" />
            <MetricRow icon={Network}   label="Ports"   used={rack.portsUsed}   max={rack.totalPorts}    unit="ports" color="#10b981" />
          </div>

          {/* Temperature */}
          <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Thermometer size={12} style={{ color: tempColor }} />
                <span className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wide">Inlet Temperature</span>
              </div>
              <span className="text-lg font-bold font-mono" style={{ color: tempColor }}>{rack.inletTempC}°C</span>
            </div>
            <div className="mt-1.5 text-[10px]" style={{ color: tempColor }}>
              {rack.inletTempC > 35 ? 'Critical — thermal runaway risk' : rack.inletTempC > 28 ? 'Elevated — monitor closely' : 'Normal operating temperature'}
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="rounded-xl p-3 border" style={{
            backgroundColor: rack.status === 'critical' ? '#FEF2F2' : rack.status === 'warning' ? '#FFFBEB' : '#F0FDF4',
            borderColor: rack.status === 'critical' ? '#DC262630' : rack.status === 'warning' ? '#D4A01730' : '#00A36C30',
          }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              {rack.status === 'operational'
                ? <CheckCircle size={11} style={{ color: '#00A36C' }} />
                : <AlertTriangle size={11} style={{ color: s.color }} />}
              <span className="text-[10px] font-bold" style={{ color: s.color }}>AI Recommendation</span>
            </div>
            <p className="text-[10px] text-[#374151] leading-relaxed">{rack.aiRecommendation}</p>
          </div>

          {/* Utilization summary */}
          <div className="rounded-xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-3 py-2 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <p className="text-[10px] font-bold text-[#1A1F36] uppercase tracking-wide">Capacity Summary</p>
            </div>
            <div className="divide-y divide-[#F4F6F9]">
              {[
                { label: 'Power headroom', value: `${(rack.maxPowerKw - rack.powerKw).toFixed(1)} kW free` },
                { label: 'Space headroom', value: `${rack.spaceTotalU - rack.spaceUsedU}U free` },
                { label: 'Weight headroom', value: `${rack.maxWeightKg - rack.weightKg} kg free` },
                { label: 'Port headroom', value: `${rack.totalPorts - rack.portsUsed} ports free` },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center px-3 py-2">
                  <span className="text-[10px] text-[#9CA3AF]">{item.label}</span>
                  <span className="text-[10px] font-mono font-bold text-[#1A1F36]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex-shrink-0 px-4 py-3 border-t border-[#E2E8F0] space-y-2">
          <button
            onClick={() => router.push('/deployments')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-white transition-colors"
            style={{ backgroundColor: '#0077C8' }}
          >
            <ChevronRight size={12} />
            Flag for Deployment
          </button>
          <button
            onClick={() => router.push('/scenarios')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border border-[#E2E8F0] text-[#6B7280] hover:bg-[#F8FAFC] transition-colors"
          >
            Run Failure Simulation
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

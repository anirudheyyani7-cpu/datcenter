'use client';
import { AlertCircle, ArrowUpRight, Calendar, AlertTriangle, Cloud, Brain } from 'lucide-react';
import { mockAlerts, mockEscalations, mockMaintenanceSchedule, mockSLARisks, mockWeatherRisks } from '@/data/command-center-mock';

const ALERT_DOT = {
  critical: 'bg-[#DC2626]',
  warning:  'bg-[#D4A017]',
  info:     'bg-[#0077C8]',
  healthy:  'bg-[#00A36C]',
};

function Section({ title, icon: Icon, children }) {
  return (
    <div className="border-b border-[#E2E8F0] pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <div className="flex items-center gap-1.5 mb-2.5">
        <Icon size={12} className="text-[#9CA3AF]" />
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function ContextPanel() {
  return (
    <div className="w-80 flex-shrink-0 bg-white border-l border-[#E2E8F0] h-full overflow-y-auto p-4">
      {/* Active Alerts */}
      <Section title="Active Alerts" icon={AlertCircle}>
        <div className="space-y-2">
          {mockAlerts.map(alert => (
            <div key={alert.id} className="flex items-start gap-2">
              <span className={`w-2 h-2 rounded-full ${ALERT_DOT[alert.severity] ?? 'bg-[#9CA3AF]'} flex-shrink-0 mt-1.5`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#1A1F36] leading-snug">{alert.label}</p>
                <p className="text-[10px] text-[#9CA3AF]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{alert.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Escalations */}
      <Section title="Escalations" icon={ArrowUpRight}>
        <div className="space-y-2">
          {mockEscalations.map(esc => (
            <div key={esc.id} className="bg-[#DC2626]/5 border border-[#DC2626]/10 rounded-lg px-3 py-2">
              <p className="text-xs text-[#1A1F36] leading-snug">{esc.label}</p>
              <p className="text-[10px] text-[#9CA3AF] mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{esc.time}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Upcoming Maintenance */}
      <Section title="Upcoming Maintenance" icon={Calendar}>
        <div className="space-y-2">
          {mockMaintenanceSchedule.map(m => (
            <div key={m.id} className="border border-[#E2E8F0] rounded-lg px-3 py-2">
              <p className="text-[10px] font-bold text-[#00338D]">{m.site}</p>
              <p className="text-xs text-[#1A1F36]">{m.task}</p>
              <p className="text-[10px] text-[#9CA3AF] mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{m.start}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* SLA Breach Risks */}
      <Section title="SLA Breach Risks" icon={AlertTriangle}>
        <div className="space-y-2">
          {mockSLARisks.map(sla => (
            <div key={sla.id} className="bg-[#D4A017]/5 border border-[#D4A017]/20 rounded-lg px-3 py-2">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-bold text-[#1A1F36]">{sla.site}</p>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#D4A017]/20 text-[#D4A017]">AT RISK</span>
              </div>
              <p className="text-[10px] text-[#6B7280]">{sla.metric}</p>
              <div className="flex gap-2 text-[10px] mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <span className="text-[#9CA3AF]">Target: {sla.target}</span>
                <span className="text-[#DC2626]">Current: {sla.current}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Weather Risks */}
      <Section title="Weather Risks" icon={Cloud}>
        <div className="space-y-2">
          {mockWeatherRisks.map(w => (
            <div key={w.id} className={`rounded-lg px-3 py-2 border ${
              w.severity === 'critical' ? 'bg-[#DC2626]/5 border-[#DC2626]/20' : 'bg-[#D4A017]/5 border-[#D4A017]/20'
            }`}>
              <p className="text-[10px] font-bold" style={{ color: w.severity === 'critical' ? '#DC2626' : '#D4A017' }}>
                {w.type}
              </p>
              <p className="text-xs text-[#1A1F36] leading-snug mt-0.5">{w.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* AI Summary */}
      <div className="bg-[#00338D]/5 border border-[#00338D]/15 rounded-xl p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Brain size={12} className="text-[#00338D]" />
          <span className="text-[10px] font-bold text-[#00338D] uppercase tracking-wider">AI Portfolio Summary</span>
        </div>
        <p className="text-xs text-[#6B7280] leading-relaxed italic">
          "Portfolio health stable at 94.2. Two facilities require attention: Mumbai DC-2 has concurrent power and cooling incidents affecting redundancy posture. Dubai Edge Node fuel reserves need urgent replenishment ahead of forecasted grid maintenance. All other facilities operating within normal parameters."
        </p>
      </div>
    </div>
  );
}

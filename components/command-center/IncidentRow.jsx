'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Brain, Users, AlertCircle } from 'lucide-react';

const SEV_CONFIG = {
  critical: { bg: 'bg-[#DC2626]', text: 'text-white', label: 'CRITICAL', rowBg: 'hover:bg-[#DC2626]/5', leftBorder: 'border-l-[#DC2626]' },
  high:     { bg: 'bg-orange-500', text: 'text-white', label: 'HIGH',     rowBg: 'hover:bg-orange-500/5', leftBorder: 'border-l-orange-500' },
  medium:   { bg: 'bg-[#D4A017]',  text: 'text-white', label: 'MEDIUM',   rowBg: 'hover:bg-[#D4A017]/5', leftBorder: 'border-l-[#D4A017]' },
  low:      { bg: 'bg-[#0077C8]',  text: 'text-white', label: 'LOW',      rowBg: 'hover:bg-[#0077C8]/5', leftBorder: 'border-l-[#0077C8]' },
};

const STATUS_CONFIG = {
  investigating: { label: 'Investigating', color: 'text-[#DC2626] bg-[#DC2626]/10' },
  identified:    { label: 'Identified',    color: 'text-orange-500 bg-orange-500/10' },
  monitoring:    { label: 'Monitoring',    color: 'text-[#0077C8] bg-[#0077C8]/10' },
  resolved:      { label: 'Resolved',      color: 'text-[#00A36C] bg-[#00A36C]/10' },
};

function OwnerAvatar({ name }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
  return (
    <div className="w-7 h-7 rounded-full bg-[#00338D]/20 border border-[#00338D]/30 flex items-center justify-center flex-shrink-0">
      <span className="text-[#0077C8] text-[10px] font-bold">{initials}</span>
    </div>
  );
}

export default function IncidentRow({ incident }) {
  const [expanded, setExpanded] = useState(false);
  const sev = SEV_CONFIG[incident.severity] ?? SEV_CONFIG.medium;
  const statusCfg = STATUS_CONFIG[incident.status] ?? STATUS_CONFIG.monitoring;

  return (
    <motion.div layout className={`border-l-2 ${sev.leftBorder} rounded-r-lg transition-colors cursor-pointer ${sev.rowBg}`}>
      {/* Collapsed row */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        onClick={() => setExpanded(!expanded)}
      >
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${sev.bg} ${sev.text} flex-shrink-0 w-16 justify-center`}>
          {sev.label}
        </span>
        <span className="text-[#9CA3AF] text-xs font-mono flex-shrink-0 w-28" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {incident.id}
        </span>
        <p className="text-white font-semibold text-sm flex-1 truncate">{incident.title}</p>
        <span className="text-white/50 text-xs flex-shrink-0">{incident.site}</span>
        <span className="text-[#9CA3AF] text-xs font-mono flex-shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {incident.timeSinceDetection}
        </span>
        <OwnerAvatar name={incident.resolutionOwner} />
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${statusCfg.color}`}>
          {statusCfg.label}
        </span>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} className="text-white/40" />
        </motion.div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-white/[0.06] pt-3">
              {/* Root cause */}
              <div>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-1">Root Cause</p>
                <p className="text-white/80 text-xs leading-relaxed">{incident.rootCause}</p>
              </div>

              {/* Impacted tenants */}
              <div className="flex items-center gap-2">
                <Users size={12} className="text-white/40" />
                <span className="text-white/60 text-xs">{incident.impactedTenants} tenant{incident.impactedTenants !== 1 ? 's' : ''} impacted</span>
                <span className="text-white/30">·</span>
                <span className="text-white/60 text-xs">Owner: <span className="text-white/80 font-semibold">{incident.resolutionOwner}</span></span>
              </div>

              {/* AI Recommendation */}
              <div className="bg-[#0077C8]/10 border border-[#0077C8]/20 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <Brain size={14} className="text-[#0077C8] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[#0077C8] text-[10px] font-bold uppercase tracking-wider mb-1">AI Recommendation</p>
                    <p className="text-white/80 text-xs leading-relaxed">{incident.aiRecommendation}</p>
                  </div>
                </div>
              </div>

              {/* Acknowledge button */}
              <button
                onClick={(e) => { e.stopPropagation(); }}
                className="px-4 py-1.5 bg-[#00338D] hover:bg-[#0044b8] text-white text-xs font-bold rounded-lg transition-colors"
              >
                Acknowledge Incident
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

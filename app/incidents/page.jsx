'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, ChevronDown, Loader2, Clock, User } from 'lucide-react';
import CCLayout from '@/components/command-center/CCLayout';
import { mockIncidents } from '@/data/mock/index';

const SEV_CONFIG = {
  critical: { color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' },
  high:     { color: '#D97706', bg: '#FFFBEB', border: '#FCD34D' },
  medium:   { color: '#D4A017', bg: '#FFFBEB', border: '#FDE68A' },
  low:      { color: '#0077C8', bg: '#EFF6FF', border: '#93C5FD' },
};

function IncidentCard({ incident, showToast }) {
  const [expanded, setExpanded] = useState(false);
  const [ackState, setAckState] = useState('idle'); // idle | loading | done
  const [actionState, setActionState] = useState('idle');
  const [localStatus, setLocalStatus] = useState(incident.status);

  const sc = SEV_CONFIG[incident.severity] || SEV_CONFIG.medium;
  const isResolved = incident.status === 'resolved';

  const handleAck = () => {
    if (ackState !== 'idle') return;
    setAckState('loading');
    setTimeout(() => {
      setAckState('done');
      setLocalStatus('acknowledged');
      showToast(`${incident.id} acknowledged by Arjun Mehta`);
    }, 1500);
  };

  const handleAction = () => {
    if (actionState !== 'idle') return;
    setActionState('loading');
    setTimeout(() => {
      setActionState('done');
      showToast(`Action dispatched to operations team for: ${incident.title}`);
    }, 2000);
  };

  return (
    <div className="flex gap-4">
      {/* Timeline spine */}
      <div className="flex flex-col items-center flex-shrink-0 w-6">
        <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-3 ${isResolved ? 'bg-[#00A36C]' : incident.severity === 'critical' ? 'bg-[#DC2626]' : incident.severity === 'high' ? 'bg-[#D97706]' : 'bg-[#D4A017]'}`} />
        <div className="w-px flex-1 bg-[#E2E8F0] mt-1" />
      </div>

      {/* Card */}
      <div className="flex-1 pb-6">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="p-4">
            <div className="flex items-start gap-3 mb-2">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase" style={{ backgroundColor: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>{incident.severity}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-[#F4F6F9] text-[#6B7280] rounded-full capitalize">{localStatus}</span>
                  <span className="font-mono text-[10px] text-[#9CA3AF]">{incident.id}</span>
                </div>
                <h3 className="text-sm font-bold text-[#1A1F36]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{incident.title}</h3>
              </div>
              <div className="text-right flex-shrink-0">
                {isResolved ? (
                  <div className="flex items-center gap-1 text-[#00A36C]">
                    <CheckCircle size={12} />
                    <span className="text-[10px] font-bold">Resolved</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[#9CA3AF]">
                    <Clock size={10} />
                    <span className="text-[10px]">{incident.timeSinceDetection}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#9CA3AF] mb-3">
              <span className="flex items-center gap-1"><AlertTriangle size={10} />{incident.site}</span>
              <span className="flex items-center gap-1"><User size={10} />{incident.resolutionOwner}</span>
              {incident.impactedTenants > 0 && <span className="text-[#D4A017]">{incident.impactedTenants} tenants impacted</span>}
            </div>

            <p className="text-xs text-[#6B7280] mb-3">{incident.rootCause}</p>

            {!isResolved && (
              <div className="bg-[#EFF6FF] border border-[#0077C8]/20 rounded-lg p-2.5 mb-3">
                <p className="text-[10px] font-bold text-[#0077C8] mb-0.5">AI Recommendation</p>
                <p className="text-[10px] text-[#1A1F36] leading-relaxed">{incident.aiRecommendation}</p>
              </div>
            )}

            {isResolved && incident.resolution && (
              <div className="bg-[#F0FDF4] border border-[#00A36C]/20 rounded-lg p-2.5 mb-3">
                <p className="text-[10px] font-bold text-[#00A36C] mb-0.5">Resolution</p>
                <p className="text-[10px] text-[#1A1F36] leading-relaxed">{incident.resolution}</p>
              </div>
            )}

            {/* Status timeline */}
            {incident.timeline && (
              <div className="flex gap-2 mb-3 overflow-x-auto">
                {['Detected', 'Investigating', 'Identified', 'Monitoring', 'Resolved'].map((step, i) => {
                  const reached = incident.timeline.some(t => t.status === step);
                  const current = incident.timeline[incident.timeline.length - 1]?.status === step;
                  return (
                    <div key={step} className="flex items-center gap-1 flex-shrink-0">
                      <div className={`w-1.5 h-1.5 rounded-full ${reached ? (current && !isResolved ? 'bg-[#0077C8] animate-pulse' : 'bg-[#00A36C]') : 'bg-[#E2E8F0]'}`} />
                      <span className={`text-[9px] font-medium ${reached ? 'text-[#1A1F36]' : 'text-[#9CA3AF]'}`}>{step}</span>
                      {i < 4 && <div className={`w-4 h-px ${reached ? 'bg-[#00A36C]' : 'bg-[#E2E8F0]'}`} />}
                    </div>
                  );
                })}
              </div>
            )}

            {!isResolved && (
              <div className="flex gap-2">
                <button onClick={handleAck} disabled={ackState !== 'idle'}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${ackState === 'done' ? 'bg-[#00A36C] text-white' : 'bg-[#00338D] hover:bg-[#0044b8] text-white'}`}>
                  {ackState === 'loading' ? <Loader2 size={11} className="animate-spin" /> : ackState === 'done' ? '✓ Acknowledged' : 'Acknowledge'}
                </button>
                <button onClick={handleAction} disabled={actionState !== 'idle'}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${actionState === 'done' ? 'bg-[#00A36C] text-white border-[#00A36C]' : 'border-[#0077C8] text-[#0077C8] hover:bg-[#0077C8]/5'}`}>
                  {actionState === 'loading' ? <Loader2 size={11} className="animate-spin" /> : actionState === 'done' ? '✓ Dispatched' : 'Take Action'}
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-[#E2E8F0] text-[#6B7280] hover:bg-[#F4F6F9] transition-colors">
                  Escalate
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IncidentsPage() {
  const [sevFilter, setSevFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dcFilter, setDcFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('Last 7d');

  const activeCount = mockIncidents.filter(i => i.status !== 'resolved').length;
  const critCount = mockIncidents.filter(i => i.severity === 'critical' && i.status !== 'resolved').length;
  const resolvedCount = mockIncidents.filter(i => i.status === 'resolved').length;

  const filtered = mockIncidents.filter(inc => {
    if (sevFilter !== 'All' && inc.severity !== sevFilter.toLowerCase()) return false;
    if (statusFilter !== 'All' && inc.status !== statusFilter.toLowerCase()) return false;
    if (dcFilter !== 'All' && inc.site !== dcFilter) return false;
    return true;
  });

  const dcs = Array.from(new Set(mockIncidents.map(i => i.site)));

  return (
    <CCLayout title="Incidents">
      {({ showToast }) => (
        <div className="p-6 space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Active Incidents', value: activeCount, color: '#DC2626' },
              { label: 'Critical', value: critCount, color: '#DC2626' },
              { label: 'Resolved (30d)', value: resolvedCount, color: '#00A36C' },
              { label: 'Avg Resolution', value: '4.2h', color: '#0077C8' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-[#E2E8F0] p-3 text-center">
                <p className="text-2xl font-bold" style={{ color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</p>
                <p className="text-xs text-[#9CA3AF] font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-3 flex flex-wrap gap-2 items-center">
            <span className="text-xs text-[#9CA3AF] font-medium">Severity:</span>
            {['All', 'Critical', 'High', 'Medium', 'Low'].map(s => (
              <button key={s} onClick={() => setSevFilter(s)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${sevFilter === s ? 'bg-[#00338D] text-white' : 'bg-[#F4F6F9] text-[#6B7280] hover:bg-[#E2E8F0]'}`}>{s}</button>
            ))}
            <div className="w-px h-4 bg-[#E2E8F0]" />
            <span className="text-xs text-[#9CA3AF] font-medium">Status:</span>
            {['All', 'Investigating', 'Identified', 'Monitoring', 'Resolved'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s === 'All' ? 'All' : s.toLowerCase())}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${statusFilter === (s === 'All' ? 'All' : s.toLowerCase()) ? 'bg-[#00338D] text-white' : 'bg-[#F4F6F9] text-[#6B7280] hover:bg-[#E2E8F0]'}`}>{s}</button>
            ))}
            <div className="w-px h-4 bg-[#E2E8F0]" />
            <select value={dcFilter} onChange={e => setDcFilter(e.target.value)}
              className="text-xs text-[#6B7280] bg-[#F4F6F9] border border-[#E2E8F0] rounded-lg px-3 py-1.5 focus:outline-none">
              <option value="All">All Facilities</option>
              {dcs.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Timeline */}
          <div className="space-y-0">
            {filtered.map(inc => (
              <IncidentCard key={inc.id} incident={inc} showToast={showToast} />
            ))}
          </div>
        </div>
      )}
    </CCLayout>
  );
}

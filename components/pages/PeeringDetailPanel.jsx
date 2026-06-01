'use client';
import { motion } from 'framer-motion';
import { X, Radio, Network, Globe, Building2 } from 'lucide-react';
import { LoadingDots } from '@/components/shared/LoadingDots';

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#00A36C]/15 text-[#00A36C] border border-[#00A36C]/25 font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-[#00A36C] animate-pulse inline-block" />LIVE DATA
    </span>
  );
}

export default function PeeringDetailPanel({ facility, detail, loading, onClose }) {
  const liveData = detail?.liveData ?? null;
  const summary = detail?.summary ?? null;

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="absolute top-0 right-0 h-full w-96 bg-[#1A1F36] border-l border-white/10 z-[900] flex flex-col shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #334155 0%, #1A1F36 100%)' }}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-500/30 text-slate-300 border border-slate-500/30 font-semibold">
              PeeringDB
            </span>
            {!loading && liveData && <LiveBadge />}
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        <h2 className="text-white font-bold text-base leading-tight mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {facility.name}
        </h2>
        <p className="text-white/60 text-sm">
          {facility.org_name ? `${facility.org_name} · ` : ''}{facility.city}, {facility.country}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Connectivity metrics — show PeeringDB data if loaded, else loading state */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: 'Networks', value: liveData?.net_count, icon: Network, color: '#00A36C' },
            { label: 'IX Present', value: liveData?.ix_count, icon: Globe, color: '#0077C8' },
            { label: 'Colos', value: liveData?.fac_count, icon: Building2, color: '#D4A017' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
              <Icon size={14} className="mx-auto mb-1" style={{ color }} />
              <div className="font-bold text-base font-mono" style={{ color }}>
                {loading ? '—' : (value ?? '—')}
              </div>
              <div className="text-white/40 text-[10px] mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Intelligence briefing */}
        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Radio size={13} className="text-[#0077C8]" />
              <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">Intelligence Briefing</span>
            </div>
            {!loading && liveData && <LiveBadge />}
          </div>
          <div className="p-3">
            {loading && (
              <div className="flex items-center gap-2 py-4">
                <LoadingDots color="#0077C8" size={6} />
                <span className="text-white/40 text-xs">Fetching live intelligence...</span>
              </div>
            )}
            {!loading && summary && (
              <div className="space-y-2">
                {summary.split('\n').filter(Boolean).map((line, i) => {
                  const clean = line.replace(/#{1,3}\s*/g, '').replace(/\*\*/g, '').trim();
                  const isBullet = clean.startsWith('-') || clean.startsWith('•');
                  const isHeader = clean.length < 50 && !clean.endsWith('.') && i > 0;
                  return isHeader
                    ? <p key={i} className="text-white/50 text-[10px] font-bold uppercase tracking-wider mt-2">{clean}</p>
                    : <p key={i} className={`text-white/70 text-xs leading-relaxed ${isBullet ? 'pl-2' : ''}`}>{isBullet ? '· ' + clean.replace(/^[-•]\s*/, '') : clean}</p>;
                })}
              </div>
            )}
            {!loading && !summary && (
              <p className="text-white/30 text-xs italic py-2">No intelligence available for this facility.</p>
            )}
          </div>
        </div>

        {/* PeeringDB metadata */}
        {!loading && liveData && (
          <div className="bg-white/5 rounded-xl p-3 border border-white/5 space-y-1.5">
            {liveData.org && (
              <div className="flex justify-between"><span className="text-white/40 text-xs">Organisation</span><span className="text-white/70 text-xs font-medium">{liveData.org}</span></div>
            )}
            {liveData.region_continent && (
              <div className="flex justify-between"><span className="text-white/40 text-xs">Region</span><span className="text-white/70 text-xs font-medium">{liveData.region_continent}</span></div>
            )}
            {liveData.status && (
              <div className="flex justify-between"><span className="text-white/40 text-xs">Status</span><span className="text-white/70 text-xs font-medium capitalize">{liveData.status}</span></div>
            )}
          </div>
        )}
      </div>

      {/* Footer transparency note */}
      <div className="p-3 border-t border-white/10 flex-shrink-0">
        <p className="text-white/25 text-[10px] text-center">
          AI-generated · Sourced from PeeringDB + web · Not verified by KPMG
        </p>
      </div>
    </motion.div>
  );
}

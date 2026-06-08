'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Globe, Zap, Leaf, Activity, Server, X, ArrowLeft, Search,
  Bot, Award, Users, Wifi, Radio, Building2, Network
} from 'lucide-react';
import { loadDatacenters, calculateGlobalStats, formatDatacenterForAI, filterPeeringFacilities } from '@/lib/datacenter-data';
import { getCountryColor, getPUEColor } from '@/utils/helpers';
import { StatusBadge } from '@/components/shared/Badge';
import { LoadingDots } from '@/components/shared/LoadingDots';
import AIChatPanel from '@/components/ai-chat/AIChatPanel';
import PeeringDetailPanel from '@/components/pages/PeeringDetailPanel';
import useAppStore from '@/store/appStore';

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer   = dynamic(() => import('react-leaflet').then(m => m.TileLayer),    { ssr: false });
const MapHook     = dynamic(() => import('./MapHook'), { ssr: false });

function CountUpNumber({ target, duration = 2000, suffix = '', prefix = '', decimals = 0 }) {
  const [current, setCurrent] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting && !started) setStarted(true); }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);
  useEffect(() => {
    if (!started) return;
    const start = Date.now();
    const step = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      setCurrent((1 - Math.pow(1 - p, 3)) * target);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);
  const display = decimals > 0 ? current.toFixed(decimals) : Math.round(current).toLocaleString();
  return <span ref={ref} style={{ fontFamily: "'JetBrains Mono', monospace" }} className="font-mono font-bold">{prefix}{display}{suffix}</span>;
}

function StatCard({ icon: Icon, label, value, suffix = '', prefix = '', decimals = 0, color = '#0077C8', sublabel = null }) {
  return (
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '18' }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <div className="text-slate-900 text-xl leading-none mb-0.5">
          <CountUpNumber target={Number(value)} suffix={suffix} prefix={prefix} decimals={decimals} />
        </div>
        <div className="text-slate-500 text-xs">{label}</div>
        {sublabel && <div className="text-slate-400 text-[10px] mt-0.5">{sublabel}</div>}
      </div>
    </motion.div>
  );
}

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#00A36C]/15 text-[#00A36C] border border-[#00A36C]/25 font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-[#00A36C] animate-pulse inline-block" />LIVE DATA
    </span>
  );
}

function DatacenterDetailPanel({ dc, onClose, onAskAI }) {
  const [liveData, setLiveData] = useState(null);
  const [liveSummary, setLiveSummary] = useState('');
  const [liveLoading, setLiveLoading] = useState(true);

  useEffect(() => {
    if (!dc) return;
    setLiveData(null); setLiveSummary(''); setLiveLoading(true);
    fetch('/api/facility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: dc.name, city: dc.city, country: dc.country, existingData: formatDatacenterForAI(dc) }),
    })
      .then(r => r.json())
      .then(d => { setLiveData(d.liveData || null); setLiveSummary(d.summary || ''); })
      .catch(() => {})
      .finally(() => setLiveLoading(false));
  }, [dc?.id]);

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="absolute top-0 right-0 h-full w-96 bg-[#1A1F36] border-l border-white/10 z-[900] flex flex-col shadow-2xl overflow-hidden"
    >
      <div className="p-5 flex-shrink-0" style={{ background: `linear-gradient(135deg, ${getCountryColor(dc.country)} 0%, #1A1F36 100%)` }}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <StatusBadge status={dc.status} />
            {!liveLoading && liveData && <LiveBadge />}
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        <h2 className="text-white font-bold text-base leading-tight mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{dc.name}</h2>
        <p className="text-white/60 text-sm">{dc.operator} · {dc.city}, {dc.country}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { label: 'Capacity', value: `${dc.capacity_mw} MW`, color: '#0077C8' },
            { label: 'Tier Rating', value: dc.tier_rating, color: '#D4A017' },
            { label: 'PUE', value: (dc.pue ?? 0).toFixed(2), color: getPUEColor(dc.pue ?? 0) },
            { label: 'Renewable', value: `${dc.renewable_energy_pct}%`, color: '#00A36C' },
          ].map((m, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/5">
              <div className="text-xs text-white/40 mb-1">{m.label}</div>
              <div className="font-bold text-base" style={{ color: m.color, fontFamily: "'JetBrains Mono', monospace" }}>{m.value}</div>
            </div>
          ))}
        </div>

        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Radio size={13} className="text-[#0077C8]" />
              <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">Intelligence Briefing</span>
            </div>
            {!liveLoading && liveData && <LiveBadge />}
          </div>
          <div className="p-3">
            {liveLoading && (
              <div className="flex items-center gap-2 py-2">
                <LoadingDots color="#0077C8" size={6} />
                <span className="text-white/40 text-xs">Fetching live intelligence...</span>
              </div>
            )}
            {!liveLoading && liveSummary && (
              <div className="space-y-2">
                {liveSummary.split('\n').filter(Boolean).map((line, i) => {
                  const clean = line.replace(/#{1,3}\s*/g, '').replace(/\*\*/g, '').trim();
                  const isBullet = clean.startsWith('-') || clean.startsWith('•');
                  const isHeader = clean.length < 50 && !clean.endsWith('.') && i > 0;
                  return isHeader
                    ? <p key={i} className="text-white/50 text-[10px] font-bold uppercase tracking-wider mt-2">{clean}</p>
                    : <p key={i} className={`text-white/70 text-xs leading-relaxed ${isBullet ? 'pl-2' : ''}`}>{isBullet ? '· ' + clean.replace(/^[-•]\s*/, '') : clean}</p>;
                })}
              </div>
            )}
            {!liveLoading && !liveSummary && <p className="text-white/30 text-xs italic">No live intelligence available for this facility.</p>}
          </div>
          {!liveLoading && liveData && (
            <div className="border-t border-white/10 px-3 py-2 flex items-center gap-4">
              {liveData.ix_count != null && <div className="text-center"><div className="text-[#0077C8] font-mono font-bold text-sm">{liveData.ix_count}</div><div className="text-white/40 text-[10px]">IX Present</div></div>}
              {liveData.net_count != null && <div className="text-center"><div className="text-[#00A36C] font-mono font-bold text-sm">{liveData.net_count}</div><div className="text-white/40 text-[10px]">Networks</div></div>}
            </div>
          )}
        </div>

        {dc.certifications?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2"><Award size={14} className="text-[#D4A017]" /><span className="text-white/60 text-xs font-semibold uppercase tracking-wider">Certifications</span></div>
            <div className="flex flex-wrap gap-1.5">{dc.certifications.map((c, i) => <span key={i} className="text-xs px-2 py-1 bg-[#D4A017]/10 text-[#D4A017] rounded-md border border-[#D4A017]/20 font-medium">{c}</span>)}</div>
          </div>
        )}
        {dc.key_tenants?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2"><Users size={14} className="text-[#0077C8]" /><span className="text-white/60 text-xs font-semibold uppercase tracking-wider">Key Tenants</span></div>
            <div className="flex flex-wrap gap-1.5">{dc.key_tenants.map((t, i) => <span key={i} className="text-xs px-2 py-1 bg-white/5 text-white/70 rounded-md border border-white/10">{t}</span>)}</div>
          </div>
        )}
        {dc.connectivity?.submarine_cables?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2"><Wifi size={14} className="text-[#00A36C]" /><span className="text-white/60 text-xs font-semibold uppercase tracking-wider">Submarine Cables</span></div>
            <div className="flex flex-wrap gap-1.5">{dc.connectivity.submarine_cables.map((c, i) => <span key={i} className="text-xs px-2 py-1 bg-[#00A36C]/10 text-[#00A36C] rounded-md border border-[#00A36C]/20">{c}</span>)}</div>
          </div>
        )}
        <div>
          <div className="flex items-center gap-2 mb-2"><Server size={14} className="text-[#0077C8]" /><span className="text-white/60 text-xs font-semibold uppercase tracking-wider">Cloud On-Ramps</span></div>
          <div className="flex flex-wrap gap-1.5">{dc.connectivity?.cloud_on_ramps?.map((c, i) => <span key={i} className="text-xs px-2 py-1 bg-[#0077C8]/10 text-[#0077C8] rounded-md border border-[#0077C8]/20">{c}</span>)}</div>
        </div>
        {dc.notable_facts?.length > 0 && (
          <div>
            <div className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Notable Facts</div>
            <ul className="space-y-1.5">{dc.notable_facts.map((fact, i) => <li key={i} className="flex gap-2 text-xs text-white/60 leading-relaxed"><span className="text-[#0077C8] mt-0.5 flex-shrink-0">▸</span>{fact}</li>)}</ul>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/10 flex-shrink-0">
        <button onClick={onAskAI} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#00338D] hover:bg-[#0044b8] text-white text-sm font-semibold rounded-xl transition-colors">
          <Bot size={16} />AI Facility Analysis
        </button>
      </div>
    </motion.div>
  );
}

export default function GlobalDashboard() {
  const [dcData, setDcData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState(null);
  const { selectedCountry, setSelectedCountry, selectedDatacenter, setSelectedDatacenter } = useAppStore();
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [localStats, setLocalStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState(null);

  // PeeringDB global facilities state
  const [peeringRaw, setPeeringRaw] = useState([]);
  const [selectedPeeringFacility, setSelectedPeeringFacility] = useState(null);
  const [peeringDetail, setPeeringDetail] = useState(null);
  const [peeringDetailLoading, setPeeringDetailLoading] = useState(false);

  // India-specific PeeringDB lazy-load state
  const [indiaFacilitiesRaw, setIndiaFacilitiesRaw] = useState([]);
  const [indiaFacilitiesLoaded, setIndiaFacilitiesLoaded] = useState(false);
  const [indiaFacilitiesLoading, setIndiaFacilitiesLoading] = useState(false);

  useEffect(() => {
    loadDatacenters().then(data => {
      setDcData(data);
      setLocalStats(calculateGlobalStats(data.datacenters));
      setLoading(false);
    });

    fetch('/api/global-stats')
      .then(r => r.json())
      .then(setGlobalStats)
      .catch(() => {});

    // Load all PeeringDB facilities in the background
    fetch('/api/peeringdb-facilities')
      .then(r => r.json())
      .then(data => { if (data.facilities?.length) setPeeringRaw(data.facilities); })
      .catch(() => {});

    return () => setSelectedDatacenter(null);
  }, []);

  // Lazy-load all India PeeringDB facilities when India is selected
  useEffect(() => {
    if (selectedCountry !== 'India' || indiaFacilitiesLoaded || indiaFacilitiesLoading) return;
    setIndiaFacilitiesLoading(true);
    fetch('/api/peeringdb-india')
      .then(r => r.json())
      .then(data => {
        if (data.facilities?.length) setIndiaFacilitiesRaw(data.facilities);
        setIndiaFacilitiesLoaded(true);
      })
      .catch(() => setIndiaFacilitiesLoaded(true))
      .finally(() => setIndiaFacilitiesLoading(false));
  }, [selectedCountry, indiaFacilitiesLoaded, indiaFacilitiesLoading]);

  // Deduplicate: remove PeeringDB facilities that are already in the curated set
  const peeringFacilities = useMemo(() => {
    // Merge global PeeringDB + India-specific (dedup by id)
    const merged = [...peeringRaw];
    const existingIds = new Set(peeringRaw.map(f => f.id));
    for (const f of indiaFacilitiesRaw) {
      if (!existingIds.has(f.id)) merged.push(f);
    }
    if (!merged.length || !dcData) return merged;
    return filterPeeringFacilities(merged, dcData.datacenters);
  }, [peeringRaw, indiaFacilitiesRaw, dcData]);

  async function handlePeeringClick(facility) {
    // Close curated panel if open
    setSelectedDatacenter(null);
    setShowAIPanel(false);
    setSelectedPeeringFacility(facility);
    setPeeringDetail(null);
    setPeeringDetailLoading(true);

    const existingData = `Datacenter: ${facility.name}\nLocation: ${facility.city}, ${facility.country}\nOrganisation: ${facility.org_name || 'Unknown'}\nSource: PeeringDB Global Registry`;
    try {
      const res = await fetch('/api/facility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: facility.name, city: facility.city, country: facility.country, existingData }),
      });
      const data = await res.json();
      setPeeringDetail(data);
    } catch {
      setPeeringDetail({ liveData: null, summary: null });
    } finally {
      setPeeringDetailLoading(false);
    }
  }

  const localCountries = dcData
    ? Array.from(new Set(dcData.datacenters.map(dc => dc.country))).sort()
    : [];

  const allFilterCountries = globalStats?.globalMarkets
    ? ['All', ...globalStats.globalMarkets]
    : ['All', ...localCountries];

  const filteredDCs = dcData?.datacenters.filter(dc => {
    const matchesCountry = !selectedCountry || selectedCountry === 'All' || dc.country === selectedCountry;
    const matchesSearch = !searchQuery ||
      dc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dc.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCountry && matchesSearch;
  }) ?? [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1428] flex items-center justify-center pt-16">
        <div className="text-center"><LoadingDots color="#0077C8" size={12} /><p className="text-white/40 text-sm mt-4">Loading global datacenter intelligence...</p></div>
      </div>
    );
  }

  const displayStats = {
    curatedFacilities: localStats?.total || 0,
    totalCapacity: localStats?.totalCapacity || 0,
    avgPUE: localStats?.avgPUE || 0,
    avgRenewable: localStats?.avgRenewable || 0,
    globalFacilities: globalStats?.globalFacilities || null,
    globalMarkets: globalStats?.marketsCount || localStats?.countries || 0,
    globalExchanges: globalStats?.globalExchanges || null,
  };

  const totalPinsOnMap = filteredDCs.length + peeringFacilities.length;

  return (
    <div className="min-h-screen bg-[#0D1428] pt-16 flex flex-col">
      <div className="bg-[#EEF4FB] border-b border-slate-200 px-6 py-4 flex-shrink-0">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/" className="text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1.5 text-sm"><ArrowLeft size={16} />Back to Lifecycle</Link>
            <div className="w-px h-4 bg-slate-300" />
            <div className="flex items-center gap-2"><Globe size={18} className="text-[#0077C8]" /><h1 className="text-slate-900 font-bold text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Global Datacenter Dashboard</h1></div>
            <div className="ml-auto"><LiveBadge /></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
            <StatCard icon={Server}    label="Curated Facilities"  value={displayStats.curatedFacilities}                         color="#0077C8" sublabel="KPMG monitored" />
            <StatCard icon={Building2} label="Global Coverage"     value={peeringFacilities.length || displayStats.globalFacilities || 9000} color="#0055A4" sublabel="PeeringDB tracked" />
            <StatCard icon={Globe}     label="Markets Covered"     value={displayStats.globalMarkets || 25}                       color="#00A36C" sublabel="Active regions" />
            <StatCard icon={Network}   label="Internet Exchanges"  value={displayStats.globalExchanges || 1200}                   color="#D4A017" sublabel="Global IX points" />
            <StatCard icon={Activity}  label="Average PUE"         value={displayStats.avgPUE} decimals={2}                      color="#0077C8" sublabel="Curated portfolio" />
            <StatCard icon={Leaf}      label="Avg Renewable %"     value={displayStats.avgRenewable} suffix="%"                  color="#00A36C" sublabel="Curated portfolio" />
          </div>

          <div className="flex items-center gap-2 flex-wrap mb-1">
            <div className="flex items-center gap-1.5 flex-wrap flex-1">
              {allFilterCountries.map(c => {
                const localCount = dcData?.datacenters.filter(d => d.country === c).length || 0;
                const hasLocal = c === 'All' || localCount > 0;
                return (
                  <button key={c} onClick={() => { setSelectedCountry(c); setSelectedDatacenter(null); setSelectedPeeringFacility(null); }}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                      selectedCountry === c
                        ? 'bg-[#0077C8] text-white shadow-md'
                        : hasLocal
                        ? 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
                        : 'bg-slate-100/70 text-slate-400 hover:text-slate-500 hover:bg-slate-100 border border-slate-200/60'
                    }`}>
                    {c}
                    {c !== 'All' && localCount > 0 && (
                      <span className="ml-1 opacity-70">{localCount}</span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="relative flex-shrink-0">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={searchQuery || ''} onChange={e => setSearchQuery(e.target.value)} placeholder="Search facilities..."
                className="bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0077C8]/50 w-44" />
            </div>
          </div>
          <p className="text-slate-400 text-[10px] mb-2">
            Dimmed markets = global coverage tracked · Highlighted = curated KPMG facilities available
          </p>
        </div>
      </div>

      <div className="flex-1 flex relative overflow-hidden">
        <div className="flex-1 relative">
          <MapContainer center={[20, 0]} zoom={2} style={{ width: '100%', height: '100%', minHeight: 500 }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; OpenStreetMap &copy; CARTO'
              maxZoom={19}
            />
            <MapHook
              selectedCountry={selectedCountry}
              selectedDC={selectedDatacenter}
              dcData={dcData}
              filteredDCs={filteredDCs}
              peeringFacilities={peeringFacilities}
              setSelectedDatacenter={setSelectedDatacenter}
              onPeeringClick={handlePeeringClick}
              setShowAIPanel={setShowAIPanel}
              getPUEColor={getPUEColor}
              getCountryColor={getCountryColor}
            />
          </MapContainer>

          <div className="absolute top-4 left-4 z-10 glass-dark rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00A36C] animate-pulse" />
              <span className="text-white/80 text-sm font-semibold">
                {filteredDCs.length} curated
                {peeringFacilities.length > 0 && (
                  <span className="text-white/40 font-normal"> · {totalPinsOnMap.toLocaleString()} total on map</span>
                )}
              </span>
              {indiaFacilitiesLoading && (
                <span className="text-white/50 text-xs ml-1 animate-pulse">· Loading India DCs…</span>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {selectedDatacenter && (
            showAIPanel ? (
              <motion.div key="ai-panel" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute top-0 right-0 h-full w-96 bg-[#1A1F36] border-l border-white/10 z-[900] flex flex-col">
                <div className="flex items-center gap-3 p-4 border-b border-white/10 flex-shrink-0">
                  <button onClick={() => setShowAIPanel(false)} className="text-white/50 hover:text-white/80 transition-colors"><ArrowLeft size={16} /></button>
                  <div><div className="text-white font-bold text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>AI Facility Analysis</div><div className="text-white/40 text-xs">{selectedDatacenter.name}</div></div>
                </div>
                <div className="flex-1 overflow-hidden p-4">
                  <AIChatPanel context={`You are analyzing this specific datacenter:\n\n${formatDatacenterForAI(selectedDatacenter)}`} title={`${selectedDatacenter.name}`} className="h-full" />
                </div>
              </motion.div>
            ) : (
              <DatacenterDetailPanel key={`detail-${selectedDatacenter.id}`} dc={selectedDatacenter}
                onClose={() => setSelectedDatacenter(null)} onAskAI={() => setShowAIPanel(true)} />
            )
          )}
          {selectedPeeringFacility && !selectedDatacenter && (
            <PeeringDetailPanel
              key={`peering-${selectedPeeringFacility.id}`}
              facility={selectedPeeringFacility}
              detail={peeringDetail}
              loading={peeringDetailLoading}
              onClose={() => setSelectedPeeringFacility(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

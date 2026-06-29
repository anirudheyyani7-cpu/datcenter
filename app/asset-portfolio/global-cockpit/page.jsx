'use client';
import { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Globe, BarChart2, AlertTriangle, Zap, Server, CheckCircle2, Construction } from 'lucide-react';
import { GOOGLE_DC_MASTER, DC_STATS } from '@/data/googleDCMasterData';
import GlobalDashboardPanel from '@/components/asset-portfolio/global-cockpit/GlobalDashboardPanel';
import DCCommandCenter from '@/components/asset-portfolio/global-cockpit/DCCommandCenter';

const GlobeViewer = dynamic(() => import('@/components/globe/GlobeViewer'), { ssr: false });

const REGIONS = ['All', 'AMER', 'EMEA', 'APAC', 'LATAM'];

const REGION_COLORS = { All: '#0077C8', AMER: '#0077C8', EMEA: '#00A36C', APAC: '#D4A017', LATAM: '#7C3AED' };

const STATUS_COLORS = {
  Active: '#00A36C',
  'Under Construction': '#D4A017',
};

const RISK_COLORS = {
  High: '#DC2626',
  Medium: '#D4A017',
  Low: '#00A36C',
};

export default function GlobalCockpitPage() {
  const [activeRegion, setActiveRegion] = useState('All');
  const [showGlobalDashboard, setShowGlobalDashboard] = useState(false);
  const [selectedDC, setSelectedDC] = useState(null);

  // Filter DCs by region
  const filteredDCs = useMemo(() => {
    if (activeRegion === 'All') return GOOGLE_DC_MASTER;
    return GOOGLE_DC_MASTER.filter(d => d.region === activeRegion);
  }, [activeRegion]);

  // Map DC data to GlobeViewer shape
  const globeDCs = useMemo(() => filteredDCs.map(d => ({
    ...d,
    id: d.id,
    name: d.name,
    capacity_mw: d.capacity_mw,
    tier_rating: d.tier,
    coordinates: { latitude: d.lat, longitude: d.lng },
  })), [filteredDCs]);

  const getMarkerColor = useCallback((dc) => {
    const src = filteredDCs.find(d => d.id === dc.id);
    if (!src) return '#0077C8';
    if (src.risk_flag === 'High') return '#DC2626';
    if (src.risk_flag === 'Medium') return '#D4A017';
    if (src.status === 'Under Construction') return '#7C3AED';
    return '#00A36C';
  }, [filteredDCs]);

  const handleMarkerClick = useCallback((dc) => {
    const src = GOOGLE_DC_MASTER.find(d => d.id === dc.id);
    if (src) {
      setSelectedDC(src);
      setShowGlobalDashboard(false);
    }
  }, []);

  const handleGlobalDashboard = () => {
    setShowGlobalDashboard(prev => !prev);
    setSelectedDC(null);
  };

  const handleRegion = (region) => {
    setActiveRegion(region);
    setSelectedDC(null);
    setShowGlobalDashboard(false);
  };

  const regionStats = useMemo(() => ({
    total: filteredDCs.length,
    active: filteredDCs.filter(d => d.status === 'Active').length,
    atRisk: filteredDCs.filter(d => d.risk_flag !== 'Low').length,
    totalMW: Math.round(filteredDCs.reduce((s, d) => s + d.capacity_mw, 0)),
  }), [filteredDCs]);

  const panelOpen = showGlobalDashboard || !!selectedDC;
  const globeHeight = panelOpen ? 'calc(50vh - 49px)' : 'calc(100vh - 110px)';

  return (
    <div style={{ background: '#0B1929', minHeight: 'calc(100vh - 49px)', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top Nav ─────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(10,22,40,0.95)', flexWrap: 'wrap',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 8 }}>
          <Globe size={15} color="#0077C8" />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.9)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Global Cockpit
          </span>
        </div>

        {/* Region Filters */}
        <div style={{ display: 'flex', gap: 4 }}>
          {REGIONS.map(r => {
            const active = activeRegion === r;
            return (
              <button
                key={r}
                onClick={() => handleRegion(r)}
                style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  border: `1px solid ${active ? REGION_COLORS[r] : 'rgba(255,255,255,0.12)'}`,
                  background: active ? `${REGION_COLORS[r]}22` : 'transparent',
                  color: active ? REGION_COLORS[r] : 'rgba(255,255,255,0.5)',
                  transition: 'all 0.15s',
                }}
              >
                {r}
              </button>
            );
          })}
        </div>

        <div style={{ flex: 1 }} />

        {/* Stat Chips */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Chip icon={<Server size={10} />} label={`${regionStats.total} DCs`} color="rgba(255,255,255,0.5)" />
          <Chip icon={<CheckCircle2 size={10} color="#00A36C" />} label={`${regionStats.active} Active`} color="#00A36C" />
          <Chip icon={<Construction size={10} color="#D4A017" />} label={`${filteredDCs.filter(d => d.status === 'Under Construction').length} In Build`} color="#D4A017" />
          <Chip icon={<AlertTriangle size={10} color="#DC2626" />} label={`${regionStats.atRisk} At Risk`} color="#DC2626" />
          <Chip icon={<Zap size={10} color="#06B6D4" />} label={`${regionStats.totalMW.toLocaleString()} MW`} color="#06B6D4" />
        </div>

        {/* Global Dashboard Button */}
        <button
          onClick={handleGlobalDashboard}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 16px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
            background: showGlobalDashboard ? '#0077C8' : 'rgba(0,119,200,0.15)',
            border: `1px solid ${showGlobalDashboard ? '#0077C8' : 'rgba(0,119,200,0.4)'}`,
            color: showGlobalDashboard ? '#fff' : '#0077C8',
            transition: 'all 0.15s',
          }}
        >
          <BarChart2 size={12} />
          Global Dashboard
        </button>
      </div>

      {/* ── Globe ───────────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', height: globeHeight, transition: 'height 0.3s ease', overflow: 'hidden', flexShrink: 0 }}>
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, #0a1628 0%, #0d2040 40%, #060e1a 100%)',
          }}
        >
          <GlobeViewer
            datacenters={globeDCs}
            selectedId={selectedDC?.id ?? null}
            onMarkerClick={handleMarkerClick}
            getMarkerColor={getMarkerColor}
            showLink={false}
          />
        </div>

        {/* Legend overlay */}
        <div style={{
          position: 'absolute', bottom: 16, left: 20,
          display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
        }}>
          {[
            { color: '#00A36C', label: 'Active' },
            { color: '#7C3AED', label: 'Under Construction' },
            { color: '#D4A017', label: 'Medium Risk' },
            { color: '#DC2626', label: 'High Risk' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* Click hint when nothing selected */}
        {!panelOpen && (
          <div style={{
            position: 'absolute', bottom: 16, right: 20,
            fontSize: 10, color: 'rgba(255,255,255,0.3)',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            Click a pin to open DC Command Center
          </div>
        )}
      </div>

      {/* ── Dashboard Panel ──────────────────────────────────────────────────── */}
      {panelOpen && (
        <div style={{ flex: 1, overflowY: 'auto', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {showGlobalDashboard ? (
            <GlobalDashboardPanel activeRegion={activeRegion} />
          ) : selectedDC ? (
            <DCCommandCenter dc={selectedDC} onClose={() => setSelectedDC(null)} />
          ) : null}
        </div>
      )}
    </div>
  );
}

function Chip({ icon, label, color }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 20,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      fontSize: 10, fontWeight: 600, color,
    }}>
      {icon}
      {label}
    </div>
  );
}

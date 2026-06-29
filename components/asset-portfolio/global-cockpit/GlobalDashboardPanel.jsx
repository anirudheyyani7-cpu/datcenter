'use client';
import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import { GOOGLE_DC_MASTER, DC_STATS } from '@/data/googleDCMasterData';

const C = {
  card: '#0d1f3c',
  border: 'rgba(255,255,255,0.09)',
  blue: '#0077C8',
  green: '#00A36C',
  amber: '#D4A017',
  red: '#DC2626',
  cyan: '#06B6D4',
  purple: '#7C3AED',
  text: 'rgba(255,255,255,0.85)',
  muted: 'rgba(255,255,255,0.45)',
};

const REGION_COLORS = { ASPAC: '#D4A017', EMEA: '#00A36C', Americas: '#0077C8', LA: '#7C3AED', Sahara: '#F97316', CASA: '#06B6D4' };

function KPI({ label, value, sub, color = C.blue }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 18px', flex: 1, minWidth: 120 }}>
      <p style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
      {children}
    </p>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0d1f3c', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '8px 12px' }}>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginBottom: 4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color || '#fff', fontSize: 12, fontWeight: 600 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function GlobalDashboardPanel({ activeRegion }) {
  const dcs = useMemo(() => {
    if (!activeRegion || activeRegion === 'All') return GOOGLE_DC_MASTER;
    return GOOGLE_DC_MASTER.filter(d => d.region === activeRegion);
  }, [activeRegion]);

  const stats = useMemo(() => ({
    total: dcs.length,
    active: dcs.filter(d => d.status === 'Active').length,
    uc: dcs.filter(d => d.status === 'Under Construction').length,
    atRisk: dcs.filter(d => d.risk_flag !== 'Low').length,
    highRisk: dcs.filter(d => d.risk_flag === 'High').length,
    totalMW: Math.round(dcs.reduce((s, d) => s + d.capacity_mw, 0)),
    totalServers: dcs.reduce((s, d) => s + d.asset_servers, 0).toLocaleString(),
    totalGPUs: dcs.reduce((s, d) => s + d.asset_gpus, 0).toLocaleString(),
    totalRacks: dcs.reduce((s, d) => s + d.asset_racks, 0).toLocaleString(),
    avgPUE: (dcs.reduce((s, d) => s + d.pue, 0) / dcs.length).toFixed(2),
    avgRenewable: Math.round(dcs.reduce((s, d) => s + d.renewable_pct, 0) / dcs.length),
    totalCarbon: Math.round(dcs.reduce((s, d) => s + d.carbon_mt, 0)),
    critAlarms: dcs.reduce((s, d) => s + d.alarm_critical, 0),
    highAlarms: dcs.reduce((s, d) => s + d.alarm_high, 0),
    medAlarms: dcs.reduce((s, d) => s + d.alarm_medium, 0),
    lowAlarms: dcs.reduce((s, d) => s + d.alarm_low, 0),
    countries: [...new Set(dcs.map(d => d.country))].length,
  }), [dcs]);

  const regionBarData = useMemo(() => {
    return ['ASPAC', 'EMEA', 'Americas', 'LA', 'Sahara', 'CASA'].map(r => ({
      region: r,
      Active: GOOGLE_DC_MASTER.filter(d => d.region === r && d.status === 'Active').length,
      'Under Construction': GOOGLE_DC_MASTER.filter(d => d.region === r && d.status === 'Under Construction').length,
      MW: Math.round(GOOGLE_DC_MASTER.filter(d => d.region === r).reduce((s, d) => s + d.capacity_mw, 0)),
    }));
  }, []);

  const tierData = useMemo(() => {
    const map = {};
    dcs.forEach(d => { map[`Tier ${d.tier}`] = (map[`Tier ${d.tier}`] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [dcs]);

  const tierColors = ['#0077C8', '#00A36C', '#D4A017', '#7C3AED'];

  const topRisk = useMemo(() => dcs.filter(d => d.risk_flag !== 'Low').sort((a, b) => {
    const order = { High: 0, Medium: 1 };
    return order[a.risk_flag] - order[b.risk_flag];
  }).slice(0, 6), [dcs]);

  const mwByRegion = useMemo(() => ['ASPAC', 'EMEA', 'Americas', 'LA', 'Sahara', 'CASA'].map(r => ({
    region: r,
    MW: Math.round(dcs.filter(d => d.region === r).reduce((s, d) => s + d.capacity_mw, 0)),
  })), [dcs]);

  return (
    <div style={{ background: '#0B1929', padding: '20px 24px', overflowY: 'auto', maxHeight: 'calc(100vh - 420px)' }}>

      {/* Google DC Source Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', gap: 2.5 }}>
            <div style={{ width: 5, height: 22, borderRadius: 3, background: '#4285F4' }} />
            <div style={{ width: 5, height: 22, borderRadius: 3, background: '#EA4335' }} />
            <div style={{ width: 5, height: 22, borderRadius: 3, background: '#FBBC05' }} />
            <div style={{ width: 5, height: 22, borderRadius: 3, background: '#34A853' }} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0 }}>
              Google Data Center Infrastructure
            </p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', margin: '2px 0 0' }}>
              Source: datacenters.google &nbsp;·&nbsp; {dcs.length} campus{dcs.length !== 1 ? 'es' : ''} in view &nbsp;·&nbsp; GSRS Regional Taxonomy
            </p>
          </div>
        </div>
        <div style={{
          padding: '4px 10px', borderRadius: 6,
          background: 'rgba(66,133,244,0.10)', border: '1px solid rgba(66,133,244,0.22)',
          fontSize: 9, fontWeight: 700, color: '#4285F4', letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          Google · DC Only
        </div>
      </div>

      {/* Row 1 — KPI Cards */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        <KPI label="Total DCs" value={stats.total} sub={`${stats.countries} Countries`} color={C.blue} />
        <KPI label="Active" value={stats.active} sub={`${stats.uc} Under Construction`} color={C.green} />
        <KPI label="Total MW" value={`${stats.totalMW.toLocaleString()} MW`} sub="IT Load Capacity" color={C.cyan} />
        <KPI label="Avg PUE" value={stats.avgPUE} sub="Power Usage Effectiveness" color={C.blue} />
        <KPI label="Renewable" value={`${stats.avgRenewable}%`} sub="Avg Renewable Energy" color={C.green} />
        <KPI label="At Risk" value={stats.atRisk} sub={`${stats.highRisk} Critical`} color={stats.highRisk > 0 ? C.red : C.amber} />
      </div>

      {/* Row 2 — Assets */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        <KPI label="Servers" value={stats.totalServers} color={C.muted} />
        <KPI label="GPUs" value={stats.totalGPUs} color={C.muted} />
        <KPI label="Racks" value={stats.totalRacks} color={C.muted} />
        <KPI label="Carbon Output" value={`${stats.totalCarbon.toLocaleString()} MT`} sub="Estimated CO₂/yr" color={C.amber} />
        <KPI label="Critical Alarms" value={stats.critAlarms} color={stats.critAlarms > 0 ? C.red : C.green} />
        <KPI label="High Alarms" value={stats.highAlarms} color={stats.highAlarms > 0 ? C.amber : C.green} />
      </div>

      {/* Row 3 — Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Regional DC Count */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
          <SectionTitle>DCs by Region</SectionTitle>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={regionBarData} barSize={14}>
              <XAxis dataKey="region" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Active" fill={C.blue} radius={[3, 3, 0, 0]} />
              <Bar dataKey="Under Construction" fill={C.amber} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* MW by Region */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
          <SectionTitle>Capacity MW by Region</SectionTitle>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={mwByRegion} barSize={20}>
              <XAxis dataKey="region" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="MW" radius={[4, 4, 0, 0]}>
                {mwByRegion.map((d, i) => (
                  <Cell key={d.region} fill={Object.values(REGION_COLORS)[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tier Donut */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
          <SectionTitle>Tier Distribution</SectionTitle>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={tierData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={60}>
                {tierData.map((_, i) => <Cell key={i} fill={tierColors[i % tierColors.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10, color: C.muted }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 4 — Alarms + At Risk */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Alarm Summary */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
          <SectionTitle>Alarm Summary</SectionTitle>
          {[
            { label: 'Critical', count: stats.critAlarms, color: C.red },
            { label: 'High', count: stats.highAlarms, color: C.amber },
            { label: 'Medium', count: stats.medAlarms, color: '#F59E0B' },
            { label: 'Low', count: stats.lowAlarms, color: C.muted },
          ].map(a => (
            <div key={a.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.color }} />
                <span style={{ fontSize: 12, color: C.text }}>{a.label}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: a.color, fontFamily: "'JetBrains Mono', monospace" }}>{a.count}</span>
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: C.muted }}>Total Alarms</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>
              {stats.critAlarms + stats.highAlarms + stats.medAlarms + stats.lowAlarms}
            </span>
          </div>
        </div>

        {/* At Risk DCs */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
          <SectionTitle>At Risk DCs</SectionTitle>
          {topRisk.length === 0 ? (
            <p style={{ fontSize: 12, color: C.green }}>No at-risk DCs in this region</p>
          ) : topRisk.map(d => (
            <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
              <div>
                <p style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{d.name}</p>
                <p style={{ fontSize: 10, color: C.muted }}>{d.market} · {d.region}</p>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                background: d.risk_flag === 'High' ? 'rgba(220,38,38,0.15)' : 'rgba(212,160,23,0.15)',
                color: d.risk_flag === 'High' ? C.red : C.amber,
                border: `1px solid ${d.risk_flag === 'High' ? 'rgba(220,38,38,0.3)' : 'rgba(212,160,23,0.3)'}`,
              }}>
                {d.risk_flag}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Row 5 — ESG */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
        <SectionTitle>ESG Snapshot</SectionTitle>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Avg PUE', value: stats.avgPUE, note: 'Power Efficiency', color: C.blue },
            { label: 'Avg Renewable', value: `${stats.avgRenewable}%`, note: 'Renewable Energy Mix', color: C.green },
            { label: 'Total Carbon', value: `${stats.totalCarbon.toLocaleString()} MT/yr`, note: 'Est. CO₂ emissions', color: C.amber },
            { label: 'Carbon Intensity', value: `${(stats.totalCarbon / (stats.totalMW || 1)).toFixed(1)} MT/MW`, note: 'Per MW of IT Load', color: C.purple },
          ].map(e => (
            <div key={e.label} style={{ flex: 1, minWidth: 140 }}>
              <p style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{e.label}</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: e.color, fontFamily: "'JetBrains Mono', monospace" }}>{e.value}</p>
              <p style={{ fontSize: 10, color: C.muted }}>{e.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

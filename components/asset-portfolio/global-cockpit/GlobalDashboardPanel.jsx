'use client';
import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import { GOOGLE_DC_MASTER, DC_STATS } from '@/data/googleDCMasterData';

const C = {
  bg:     '#F4F6F9',
  card:   '#FFFFFF',
  border: '#E2E8F0',
  blue:   '#0077C8',
  green:  '#00A36C',
  amber:  '#D4A017',
  red:    '#DC2626',
  cyan:   '#06B6D4',
  purple: '#7C3AED',
  text:   '#1A1F36',
  muted:  '#9CA3AF',
};

const REGION_COLORS = { 'North America': '#0077C8', Europe: '#00A36C', Asia: '#D4A017', 'South America': '#7C3AED' };

function KPI({ label, value, sub, color = C.blue, elaboration = null }) {
  const [hovered, setHovered] = useState(false);
  const [locked, setLocked] = useState(false);
  return (
    <div
      style={{ position: 'relative', background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 18px', flex: 1, minWidth: 120, boxShadow: '0 1px 2px rgba(16,24,40,0.04)', cursor: elaboration ? 'pointer' : 'default' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { if (!locked) setHovered(false); }}
      onDoubleClick={() => elaboration && setLocked(prev => !prev)}
    >
      <p style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>{sub}</p>}
      {elaboration && (hovered || locked) && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 200,
          width: 270, background: '#1A1F36', color: '#fff',
          borderRadius: 10, padding: '12px 14px', marginTop: 6,
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          border: '1px solid rgba(255,255,255,0.1)',
          pointerEvents: 'none',
        }}>
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
          </div>
          <p style={{ fontSize: 10.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.8)', margin: 0 }}>{elaboration}</p>
          {locked && <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>Double-click to close</p>}
        </div>
      )}
    </div>
  );
}

function WithElab({ children, label, elaboration, color = '#60A5FA' }) {
  const [hovered, setHovered] = useState(false);
  const [locked, setLocked]   = useState(false);
  return (
    <div style={{ position: 'relative', cursor: elaboration ? 'pointer' : 'default' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { if (!locked) setHovered(false); }}
      onDoubleClick={() => elaboration && setLocked(p => !p)}
    >
      {children}
      {elaboration && (hovered || locked) && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 300,
          width: 280, background: '#1A1F36', color: '#fff',
          borderRadius: 10, padding: '12px 14px', marginTop: 6,
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          border: '1px solid rgba(255,255,255,0.1)',
          pointerEvents: 'none',
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, margin: '0 0 6px' }}>{label}</p>
          <p style={{ fontSize: 10.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.8)', margin: 0 }}>{elaboration}</p>
          {locked && <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 6, marginBottom: 0 }}>Double-click to close</p>}
        </div>
      )}
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
    <div style={{ background: '#FFFFFF', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 12px rgba(16,24,40,0.08)' }}>
      <p style={{ color: C.muted, fontSize: 11, marginBottom: 4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color || C.text, fontSize: 12, fontWeight: 600 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function GlobalDashboardPanel({ activeRegion, dataSource = 'Google DC', dcsOverride = null }) {
  const baseData = dcsOverride ?? GOOGLE_DC_MASTER;
  const dcs = useMemo(() => {
    if (!activeRegion || activeRegion === 'All') return baseData;
    return baseData.filter(d => d.region === activeRegion);
  }, [activeRegion, baseData]);

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
    avgUtil: Math.round(dcs.reduce((s, d) => s + d.utilization_pct, 0) / (dcs.length || 1)),
    tierIV: dcs.filter(d => d.tier === 'IV').length,
  }), [dcs]);

  const regionBarData = useMemo(() => {
    return ['North America', 'Europe', 'Asia', 'South America'].map(r => ({
      region: r,
      Active: baseData.filter(d => d.region === r && d.status === 'Active').length,
      'Under Construction': baseData.filter(d => d.region === r && d.status === 'Under Construction').length,
      MW: Math.round(baseData.filter(d => d.region === r).reduce((s, d) => s + d.capacity_mw, 0)),
    }));
  }, [baseData]);

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

  const mwByRegion = useMemo(() => ['North America', 'Europe', 'Asia', 'South America'].map(r => ({
    region: r,
    MW: Math.round(dcs.filter(d => d.region === r).reduce((s, d) => s + d.capacity_mw, 0)),
  })), [dcs]);

  return (
    <div style={{ background: C.bg, padding: '20px 24px', overflowY: 'auto', maxHeight: 'calc(100vh - 420px)' }}>

      {/* Google DC Source Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {dataSource.toLowerCase().includes('google') && (
            <div style={{ display: 'flex', gap: 2.5 }}>
              <div style={{ width: 5, height: 22, borderRadius: 3, background: '#4285F4' }} />
              <div style={{ width: 5, height: 22, borderRadius: 3, background: '#EA4335' }} />
              <div style={{ width: 5, height: 22, borderRadius: 3, background: '#FBBC05' }} />
              <div style={{ width: 5, height: 22, borderRadius: 3, background: '#34A853' }} />
            </div>
          )}
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0 }}>
              {dataSource} Data Center Infrastructure
            </p>
            <p style={{ fontSize: 10, color: C.muted, margin: '2px 0 0' }}>
              Source: {dataSource} &nbsp;·&nbsp; {dcs.length} campus{dcs.length !== 1 ? 'es' : ''} in view &nbsp;·&nbsp; GSRS Regional Taxonomy
            </p>
          </div>
        </div>
        <div style={{
          padding: '4px 10px', borderRadius: 6,
          background: dataSource.toLowerCase().includes('google') ? 'rgba(66,133,244,0.10)' : 'rgba(0,51,141,0.08)',
          border: `1px solid ${dataSource.toLowerCase().includes('google') ? 'rgba(66,133,244,0.22)' : 'rgba(0,51,141,0.20)'}`,
          fontSize: 9, fontWeight: 700,
          color: dataSource.toLowerCase().includes('google') ? '#4285F4' : '#00338D',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          {dataSource.toUpperCase().slice(0, 12)}
        </div>
      </div>

      {/* Row 1 — KPI Cards */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        <KPI label="Total DCs" value={stats.total} sub={`${stats.countries} Countries`} color={C.blue}
          elaboration={`${stats.total} data center sites across ${stats.countries} countries in the current view — ${stats.active} active and ${stats.uc} under construction. This is the master inventory count and the denominator for all portfolio-level ratios including utilisation, risk rate, and carbon intensity.`} />
        <KPI label="Active" value={stats.active} sub={`${stats.countries} Countries`} color={C.green}
          elaboration={`${stats.active} sites currently in live commercial operation, accepting workloads and generating revenue. Active count as a percentage of total (${Math.round((stats.active / stats.total) * 100)}%) indicates how much of the planned portfolio is generating utilisation versus still consuming build capital.`} />
        <KPI label="Under Construction" value={stats.uc} sub="Planned campuses" color={C.amber}
          elaboration={`${stats.uc} sites where physical construction, fit-out, or commissioning is underway but commercial operations have not yet commenced. Represents committed forward capacity — capital already deployed but not yet generating utilisation. Once commissioned, these sites will ${stats.uc > stats.active ? 'more than double' : 'significantly expand'} the active fleet.`} />
        <KPI label="Total MW" value={`${stats.totalMW.toLocaleString()} MW`} sub="IT Load Capacity" color={C.cyan}
          elaboration={`${stats.totalMW.toLocaleString()} MW total nameplate IT power capacity across all sites in view. This is the primary sizing metric for data center scale — it represents the maximum theoretical AI and cloud compute load the portfolio can support. Includes both active and under-construction sites.`} />
        <KPI label="Avg PUE" value={stats.avgPUE} sub="Power Usage Effectiveness" color={C.blue}
          elaboration={`Portfolio-average PUE of ${stats.avgPUE} — the ratio of total facility energy to IT energy. A PUE of 1.0 is theoretical perfection; industry best practice is ≤1.10. At ${stats.avgPUE}, this portfolio is ${parseFloat(stats.avgPUE) <= 1.12 ? 'world-class' : parseFloat(stats.avgPUE) <= 1.16 ? 'above-industry-average' : 'at industry average'}. Each 0.01 PUE reduction represents millions of dollars in annual energy savings at this scale.`} />
        <KPI label="Avg Utilization" value={`${stats.avgUtil}%`} sub="Across DCs in view" color={stats.avgUtil > 85 ? C.red : stats.avgUtil > 70 ? C.amber : C.green}
          elaboration={`Average utilisation of ${stats.avgUtil}% across all sites in view, including under-construction sites with low shell-commissioning loads. Filtered to active sites only, utilisation is significantly higher. ${stats.avgUtil > 85 ? 'High portfolio utilisation — expansion pipeline is critical to avoid capacity constraints.' : stats.avgUtil > 70 ? 'Healthy range indicating strong asset yield.' : 'Blended average is moderated by under-construction sites; active-site utilisation is materially higher.'}`} />
        <KPI label="Renewable" value={`${stats.avgRenewable}%`} sub="Avg Renewable Energy" color={C.green}
          elaboration={`${stats.avgRenewable}% portfolio-average renewable energy percentage. Google's target is 100% 24/7 CFE matching. ${stats.avgRenewable >= 90 ? 'Near-target performance — exceptional portfolio-wide renewable penetration.' : stats.avgRenewable >= 70 ? 'Above-average. Sites in fossil-heavy grids are pulling the average below the CFE target.' : 'Below the 71% global portfolio average — regional grid constraints are limiting renewable procurement options.'} Sites below 80% represent material Scope 2 carbon liability under CSRD and CDP frameworks.`} />
        <KPI label="At Risk" value={stats.atRisk} sub={`${stats.highRisk} Critical`} color={stats.highRisk > 0 ? C.red : C.amber}
          elaboration={`${stats.atRisk} site${stats.atRisk !== 1 ? 's' : ''} carrying a Medium or High risk flag — ${stats.highRisk} High (immediate P1 escalation required) and ${stats.atRisk - stats.highRisk} Medium. Risk flags are set by NOC operations teams based on threshold crossings for power, cooling, connectivity, and physical security alarms. At-risk rate: ${Math.round((stats.atRisk / stats.active) * 100)}% of active sites.`} />
        <KPI label="Tier IV DCs" value={stats.tierIV} sub="Tier IV campuses" color={C.purple}
          elaboration={`${stats.tierIV} Tier IV certified campuses in view — fault-tolerant 2N design with 99.995% uptime SLA. Tier IV sites support the highest-value enterprise and regulated-industry workloads where any downtime carries significant financial or compliance consequences. ${Math.round((stats.tierIV / stats.total) * 100)}% of the portfolio holds Tier IV certification.`} />
      </div>

      {/* Row 2 — Assets */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        <KPI label="Servers" value={stats.totalServers} color={C.muted}
          elaboration={`${stats.totalServers} server instances deployed across all sites in view. Drives hardware refresh capex cycles, OEM contract volume, and is the primary metric for compute capacity planning. Server count growth rate is a leading indicator of workload onboarding velocity.`} />
        <KPI label="GPUs" value={stats.totalGPUs} color={C.muted}
          elaboration={`${stats.totalGPUs} GPU accelerator units deployed — powering Gemini model training, Google Search AI, YouTube recommendations, and GCP AI Platform. GPU count is the fastest-growing metric in the portfolio as AI workload density accelerates. GPU expansion drives high-density power design requirements (≥20 kW/rack).`} />
        <KPI label="Racks" value={stats.totalRacks} color={C.muted}
          elaboration={`${stats.totalRacks} installed rack positions across the portfolio in view. Rack count combined with average power density per rack gives a more operationally accurate picture of usable IT capacity than MW alone — high-density GPU racks can draw 30–60 kW versus a standard 5–8 kW server rack.`} />
        <KPI label="Carbon Output" value={`${stats.totalCarbon.toLocaleString()} MT`} sub="Estimated CO₂/yr" color={C.amber}
          elaboration={`Estimated ${stats.totalCarbon.toLocaleString()} metric tonnes of CO₂ equivalent per year from the portfolio's electricity consumption. At ${stats.avgRenewable}% renewable penetration, this is materially below what a fossil-grid-only footprint would produce. Reported as Scope 2 market-based emissions under the GHG Protocol for CDP and CSRD disclosures.`} />
        <KPI label="Carbon Intensity" value={`${(stats.totalCarbon / (stats.totalMW || 1)).toFixed(1)} MT/MW`} sub="Per MW IT load" color={C.purple}
          elaboration={`Carbon intensity of ${(stats.totalCarbon / (stats.totalMW || 1)).toFixed(1)} MT CO₂ per MW normalises emissions by IT capacity for like-for-like comparison across portfolios of different scales. Best-in-class Nordic sites achieve 0.04–0.06 MT/MW via near-100% hydropower. This portfolio intensity reflects the blended impact of the ${stats.avgRenewable}% renewable mix.`} />
        <KPI label="Critical Alarms" value={stats.critAlarms} color={stats.critAlarms > 0 ? C.red : C.green}
          elaboration={stats.critAlarms > 0
            ? `${stats.critAlarms} active Critical alarms across the portfolio — P1 incidents with actual or imminent service disruption risk requiring NOC response within 15 minutes. These are concentrated at the ${stats.highRisk} High-risk site${stats.highRisk !== 1 ? 's' : ''} and require immediate remediation tracking.`
            : `No active Critical alarms across the portfolio. All sites are operating within critical thresholds. P1 status is clear.`} />
        <KPI label="High Alarms" value={stats.highAlarms} color={stats.highAlarms > 0 ? C.amber : C.green}
          elaboration={`${stats.highAlarms} active High-severity alarms — P2 conditions indicating significant degradation or redundancy loss. Response SLA is 2 hours. At ${stats.highAlarms} alarms across ${stats.active} active sites, the average is ${(stats.highAlarms / Math.max(1, stats.active)).toFixed(1)} per site — ${stats.highAlarms / Math.max(1, stats.active) > 2 ? 'elevated and warranting portfolio-level review.' : 'within normal operational range.'}`} />
        <KPI label="Med Alarms" value={stats.medAlarms} color={stats.medAlarms > 0 ? '#F59E0B' : C.green}
          elaboration={`${stats.medAlarms} active Medium-severity alarms — P3 early-warning signals (temperature trending, generator fuel, UPS battery health) requiring corrective action within 8 hours. Medium alarms feed the weekly preventive maintenance schedule and average ${(stats.medAlarms / Math.max(1, stats.active)).toFixed(1)} per active site.`} />
        <KPI label="Low Alarms" value={stats.lowAlarms} color={C.muted}
          elaboration={`${stats.lowAlarms} active Low-severity notices — P4 informational alerts such as firmware updates, minor sensor drift, and inspection reminders. While non-urgent individually, a sustained high volume signals potential maintenance backlog accumulation. Monthly trend analysis is used to identify sites where deferred maintenance is compounding into systemic risk.`} />
      </div>

      {/* Row 3 — Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Regional DC Count */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}>
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
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}>
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
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}>
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
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}>
          <SectionTitle>Alarm Summary</SectionTitle>
          {[
            { label: 'Critical', count: stats.critAlarms, color: C.red,     elab: 'Critical alarms require immediate remediation — typically power, cooling, or network failures affecting service availability. A count above 0 triggers P1 incident response protocols with a 15-minute NOC response SLA. Industry target: 0 critical alarms per 100 MW of installed capacity.' },
            { label: 'High',     count: stats.highAlarms, color: C.amber,   elab: 'High-severity alarms signal degraded redundancy or imminent failure risk — A/B-feed imbalance, cooling unit failures, or generator test failures. Response SLA is 2 hours. Each high alarm must be resolved before fault-tolerance margins can be considered restored.' },
            { label: 'Medium',   count: stats.medAlarms,  color: '#F59E0B', elab: 'Medium alarms flag conditions that reduce fault-tolerance margins without yet impacting uptime. Common causes: elevated temperatures, UPS battery health alerts, or partial network path degradation. Corrective action required within 8 hours.' },
            { label: 'Low',      count: stats.lowAlarms,  color: C.muted,   elab: 'Low-severity alarms are informational and typically auto-resolve. Represent minor threshold breaches, routine maintenance notifications, or monitoring health checks. A sustained high volume signals potential maintenance backlog accumulation.' },
          ].map(a => (
            <WithElab key={a.label} label={a.label} elaboration={a.elab} color={a.color}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.color }} />
                  <span style={{ fontSize: 12, color: C.text }}>{a.label}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: a.color, fontFamily: "'JetBrains Mono', monospace" }}>{a.count}</span>
              </div>
            </WithElab>
          ))}
          <WithElab label="Total Alarms" color={C.text} elaboration="Aggregate alarm load across all severity tiers in the selected region. A healthy portfolio targets fewer than 5 critical and fewer than 20 high alarms per 100 MW of installed capacity. Use this number as a trend indicator — a rising total warrants portfolio-level review.">
            <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: C.muted }}>Total Alarms</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>
                {stats.critAlarms + stats.highAlarms + stats.medAlarms + stats.lowAlarms}
              </span>
            </div>
          </WithElab>
        </div>

        {/* At Risk DCs */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}>
          <SectionTitle>At Risk DCs</SectionTitle>
          {topRisk.length === 0 ? (
            <p style={{ fontSize: 12, color: C.green }}>No at-risk DCs in this region</p>
          ) : topRisk.map(d => (
            <WithElab
              key={d.id}
              label={d.name}
              color={d.risk_flag === 'High' ? C.red : C.amber}
              elaboration={`${d.name} is rated ${d.risk_flag} risk based on alarm density, utilisation headroom, and infrastructure health indicators. ${d.risk_flag === 'High' ? 'High risk sites require a site assessment within 30 days and may be subject to capacity restrictions pending remediation.' : 'Medium risk sites are flagged for monitoring and scheduled review within 90 days. No immediate service impact expected.'} Alarm load: ${d.alarm_critical ?? 0} critical · ${d.alarm_high ?? 0} high · ${d.alarm_medium ?? 0} medium.`}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
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
            </WithElab>
          ))}
        </div>
      </div>

      {/* Row 5 — ESG */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}>
        <SectionTitle>ESG Snapshot</SectionTitle>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <KPI label="Avg PUE" value={stats.avgPUE} sub="Power Efficiency" color={C.blue}
            elaboration={`Power Usage Effectiveness: total facility power ÷ IT equipment power. Industry average is 1.58; hyperscaler best-in-class is below 1.10. A PUE of ${stats.avgPUE} means every watt of compute draws ${stats.avgPUE}W from the grid — the overhead above 1.0 is cooling, lighting, and power conversion losses. Each 0.01 PUE reduction saves millions in annual energy cost at this portfolio scale.`} />
          <KPI label="Avg Renewable" value={`${stats.avgRenewable}%`} sub="Renewable Energy Mix" color={C.green}
            elaboration={`${stats.avgRenewable}% of energy consumption is matched by renewable energy certificates (RECs) or direct power purchase agreements (PPAs) with wind, solar, or hydro generators. Google's target is 24/7 carbon-free energy (CFE) across all campuses — meaning every hour of operation matched by zero-carbon generation, not just annual averages.`} />
          <KPI label="Total Carbon" value={`${stats.totalCarbon.toLocaleString()} MT/yr`} sub="Est. CO₂ emissions" color={C.amber}
            elaboration={`Estimated Scope 1 + Scope 2 CO₂-equivalent emissions across all facilities in scope, measured in metric tonnes per year. Includes grid electricity carbon intensity adjusted for renewable coverage, plus direct diesel generator emissions during outage events. Reported under the GHG Protocol for CDP and CSRD compliance disclosures.`} />
          <KPI label="Carbon Intensity" value={`${(stats.totalCarbon / (stats.totalMW || 1)).toFixed(1)} MT/MW`} sub="Per MW of IT Load" color={C.purple}
            elaboration={`Carbon intensity normalises emissions against installed IT capacity, enabling fair cross-portfolio comparison regardless of campus size. Industry benchmark is 0.4–0.6 MT/MW; best-in-class Nordic hydro sites achieve 0.04–0.06 MT/MW. Values below 0.3 indicate a leading ESG position. Calculated as total carbon ÷ total installed MW across the current region filter.`} />
        </div>
      </div>
    </div>
  );
}

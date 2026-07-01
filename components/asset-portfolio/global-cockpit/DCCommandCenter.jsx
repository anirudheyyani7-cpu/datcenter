'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, MapPin, Boxes, Sparkles } from 'lucide-react';
import { GOOGLE_DC_MASTER } from '@/data/googleDCMasterData';

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

const FLAG_EMOJI = {
  'USA': '🇺🇸', 'Chile': '🇨🇱', 'Uruguay': '🇺🇾', 'Australia': '🇦🇺',
  'Austria': '🇦🇹', 'Belgium': '🇧🇪', 'Denmark': '🇩🇰', 'Finland': '🇫🇮',
  'France': '🇫🇷', 'Germany': '🇩🇪', 'Ireland': '🇮🇪', 'Netherlands': '🇳🇱',
  'Norway': '🇳🇴', 'Portugal': '🇵🇹', 'Sweden': '🇸🇪', 'UK': '🇬🇧',
  'India': '🇮🇳', 'Japan': '🇯🇵', 'Malaysia': '🇲🇾', 'Singapore': '🇸🇬',
  'Taiwan': '🇹🇼',
};

function KPI({ label, value, sub, color = C.blue, elaboration = null }) {
  const [hovered, setHovered] = useState(false);
  const [locked, setLocked] = useState(false);
  return (
    <div
      style={{ position: 'relative', background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 18px', flex: 1, minWidth: 110, boxShadow: '0 1px 2px rgba(16,24,40,0.04)', cursor: elaboration ? 'pointer' : 'default' }}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
            <AIBadge />
          </div>
          <p style={{ fontSize: 10.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.8)', margin: 0 }}>{elaboration}</p>
          {locked && <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>Double-click to close</p>}
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
      {children}
    </p>
  );
}

function AIBadge() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 9, fontWeight: 700,
      padding: '2px 7px', borderRadius: 20, color: C.cyan,
      background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)',
    }}>
      <Sparkles size={9} /> AI Elaborated
    </span>
  );
}

const MOCK_ALARMS = [
  {
    severity: 'HIGH',
    message: 'UPS module B2 — battery health below threshold',
    time: '2h ago',
    elaboration: 'Battery cell impedance has drifted 14% beyond baseline over the past 30 days, consistent with accelerated degradation from elevated power-room ambient temperature. If left unaddressed, ride-through runtime during a utility outage could fall below the 10-minute SLA. Recommend scheduling cell replacement within the next maintenance window.',
  },
  {
    severity: 'MEDIUM',
    message: 'CRAC unit 14 — supply air temperature deviation +2°C',
    time: '5h ago',
    elaboration: 'The deviation correlates with a partially restricted condenser coil, reducing heat rejection efficiency by an estimated 8%. Adjacent racks remain within the ASHRAE thermal envelope, so this is not yet rack-critical, but sustained drift could push hot-aisle containment past threshold within 48 hours. Filter and coil cleaning is recommended ahead of the next PM cycle.',
  },
  {
    severity: 'LOW',
    message: 'PDU branch circuit 07 load at 78% — approaching limit',
    time: '8h ago',
    elaboration: 'Load on this circuit has grown roughly 1.2% per week over the trailing quarter, consistent with new GPU rack provisioning in this zone. At the current trajectory it will breach its 80% derated capacity threshold within about three weeks. Rebalancing a portion of load to circuit 09, currently at 52%, is the lowest-risk mitigation.',
  },
  {
    severity: 'INFO',
    message: 'Scheduled maintenance window confirmed — Sunday 02:00',
    time: '1d ago',
    elaboration: 'This is a planned 90-minute window for generator load-bank testing and UPS firmware updates, with no expected impact to IT load given dual-path redundancy. Facilities has confirmed N+1 coverage is maintained throughout. Customers with single-corded equipment in this zone should be notified per standard change protocol.',
  },
];

const MOCK_INTEL = [
  {
    tag: 'Power Grid',
    text: 'Regional utility upgrade expanding capacity by 200 MW by Q3',
    elaboration: 'The local transmission operator has approved a substation expansion adding 200 MW of firm capacity to the grid interconnect serving this campus, targeted for energization in Q3. This supports planned IT load growth without requiring additional on-site generation investment and should ease interconnection-queue pressure for adjacent expansion phases.',
  },
  {
    tag: 'Sustainability',
    text: 'PPA signed for new wind farm — renewable % rising 12pts',
    elaboration: 'A 15-year power purchase agreement was executed for output from a 180 MW wind farm roughly 60 miles from this site, expected to lift the campus renewable energy mix by approximately 12 percentage points once delivery begins. This advances progress toward the regional 24/7 carbon-free energy target and reduces exposure to wholesale price volatility.',
  },
  {
    tag: 'Network',
    text: 'New 400G backbone ring reduces regional latency by 18%',
    elaboration: 'A new 400G optical ring connecting this campus to two adjacent regional hubs entered service, cutting median inter-site latency by 18% and adding a second diverse path for disaster-recovery traffic. This materially improves resilience for latency-sensitive workloads and removes a single point of failure from the prior ring topology.',
  },
];

const ALARM_COLOR = { HIGH: C.red, MEDIUM: C.amber, LOW: '#F59E0B', INFO: C.muted };

function getRE(dc) {
  const acreage   = Math.round((dc.capacity_mw / 100) * 2.8 * 10) / 10;
  const buildings = Math.max(1, Math.round(dc.capacity_mw / 60));
  const ownership = (dc.tier === 'IV' || dc.capacity_mw >= 150) ? 'Owned' : 'Ground Lease';
  const expAcres  = Math.round(acreage * 0.4 * 10) / 10;
  return { acreage, buildings, ownership, expAcres };
}

function getConstruction(dc) {
  const pct        = Math.min(95, Math.round(40 + dc.utilization_pct * 2.5));
  const remaining  = 100 - pct;
  const monthsLeft = Math.max(3, Math.round((remaining / 100) * (dc.capacity_mw / 25)));
  const handover   = new Date();
  handover.setMonth(handover.getMonth() + monthsLeft);
  const handoverStr = handover.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  const phase = pct < 50 ? 'Civil & Structural'
              : pct < 70 ? 'MEP Installation'
              : pct < 85 ? 'Fit-Out & Commissioning'
              : 'Final Testing';
  const activity = dc.tier === 'IV' ? 'Tier IV Programme'
                 : dc.capacity_mw >= 120 ? 'Large Campus Build'
                 : 'Standard Campus Build';
  return { pct, monthsLeft, handoverStr, phase, activity };
}

function getConstructionIntel(dc, con) {
  const halls = Math.max(1, Math.round(dc.capacity_mw / 60));
  return [
    {
      tag: 'Build Progress',
      text: `${con.pct}% complete — ${con.phase}`,
      elaboration: con.phase === 'Civil & Structural'
        ? `Foundation works, structural steel erection, and building envelope are the primary activities across ${halls} planned data hall${halls > 1 ? 's' : ''}. MEP design is being finalised in parallel. At ${con.pct}% completion the site is on track for MEP installation to begin within ${Math.round(con.monthsLeft * 0.4)} months.`
        : con.phase === 'MEP Installation'
        ? `Mechanical, electrical, and plumbing systems are being installed across ${halls} data hall${halls > 1 ? 's' : ''}. Power distribution, UPS, and cooling plant commissioning follow. At ${con.pct}% completion, fit-out and white space commissioning are expected to begin in approximately ${Math.round(con.monthsLeft * 0.5)} months.`
        : con.phase === 'Fit-Out & Commissioning'
        ? `IT white space fit-out, power distribution units, and cooling systems are being commissioned at ${con.pct}% overall completion. Initial rack energisation and pre-production testing are expected within ${Math.round(con.monthsLeft * 0.4)} months. All systems remain on schedule for final acceptance testing.`
        : `All systems are undergoing integrated acceptance testing at ${con.pct}% completion. Uptime Institute certification inspection and final utility interconnect energisation are the remaining critical-path items ahead of commercial handover in ${con.handoverStr}.`,
    },
    {
      tag: 'Completion Forecast',
      text: `Predicted handover: ${con.handoverStr}`,
      elaboration: `Commercial operations are forecast for ${con.handoverStr} — approximately ${con.monthsLeft} months from today. This is derived from current completion rate (${con.pct}%), site scale (${dc.capacity_mw} MW, ${halls} hall${halls > 1 ? 's' : ''}), and ${dc.tier === 'IV' ? 'Tier IV 2N redundancy commissioning benchmarks' : 'standard N+1 campus commissioning timelines'}. Key schedule risks include grid interconnection permit timing, long-lead equipment deliveries (transformers, UPS systems), and any scope changes requiring fresh planning consent.`,
    },
    {
      tag: 'Recommendations',
      text: dc.renewable_pct < 70
        ? `Accelerate PPA execution to reach ≥${Math.min(100, dc.renewable_pct + 20)}% renewable before commissioning`
        : dc.tier === 'IV'
        ? `Initiate Tier IV certification audit in parallel with final testing phase`
        : `Execute anchor tenant pre-commitment to de-risk post-commissioning revenue ramp`,
      elaboration: dc.renewable_pct < 70
        ? `At ${dc.renewable_pct}% renewable energy, this site is below Google's 24/7 CFE target. Executing a PPA for local wind or solar capacity before commercial operations locks in a lower cost basis than post-commissioning procurement. The ${dc.region} grid has available renewable capacity — early engagement with the transmission operator and off-take desk is recommended within the next ${Math.round(con.monthsLeft / 2)} months.`
        : dc.tier === 'IV'
        ? `Tier IV certification requires demonstrated 2N redundancy under live load. Initiating the Uptime Institute audit process now — ${con.monthsLeft} months ahead of planned handover — ensures any findings can be remediated before commercial operations begin, avoiding the significant cost of post-certification modifications. Certification strengthens SLA commitments to regulated-industry and AI infrastructure tenants.`
        : `Pre-committing ${Math.round(dc.capacity_mw * 0.3)} MW (~30% of capacity) to anchor enterprise or AI infrastructure tenants before commissioning substantially de-risks the revenue ramp. This campus's ${dc.renewable_pct}% renewable energy mix and ${dc.pue.toFixed(2)} PUE design are above-market for ${dc.market}, supporting premium pricing and accelerated payback on the ${dc.capacity_mw} MW build investment.`,
    },
  ];
}

export default function DCCommandCenter({ dc, onClose }) {
  const router = useRouter();
  if (!dc) return null;

  const regionDCs = GOOGLE_DC_MASTER.filter(d => d.region === dc.region);
  const regionCtx = {
    total:  regionDCs.length,
    active: regionDCs.filter(d => d.status === 'Active').length,
    uc:     regionDCs.filter(d => d.status === 'Under Construction').length,
    atRisk: regionDCs.filter(d => d.risk_flag !== 'Low').length,
  };

  const flag        = FLAG_EMOJI[dc.country] || '🌐';
  const statusColor = dc.status === 'Active' ? C.green : C.amber;
  const riskColor   = { High: C.red, Medium: C.amber, Low: C.green }[dc.risk_flag];
  const utilPct     = Math.round(dc.utilization_pct);
  const utilColor   = utilPct > 90 ? C.red : utilPct > 75 ? C.amber : C.green;
  const re          = getRE(dc);
  const isUC        = dc.status === 'Under Construction';
  const con         = isUC ? getConstruction(dc) : null;
  const conIntel    = isUC ? getConstructionIntel(dc, con) : null;

  return (
    <div style={{ background: C.bg, padding: '20px 24px', overflowY: 'auto', maxHeight: 'calc(100vh - 420px)' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 20 }}>{flag}</span>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{dc.name}</h2>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
              background: dc.status === 'Active' ? 'rgba(0,163,108,0.15)' : 'rgba(212,160,23,0.15)',
              color: statusColor, border: `1px solid ${statusColor}44`,
            }}>{dc.status}</span>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
              background: dc.risk_flag === 'High' ? 'rgba(220,38,38,0.15)' : dc.risk_flag === 'Medium' ? 'rgba(212,160,23,0.15)' : 'rgba(0,163,108,0.1)',
              color: riskColor, border: `1px solid ${riskColor}44`,
            }}>{dc.risk_flag} Risk</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.muted }}>
            <MapPin size={11} />
            <span style={{ fontSize: 11 }}>{dc.address}</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span style={{ fontSize: 11 }}>{dc.market}</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span style={{ fontSize: 11 }}>{dc.country}</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span style={{ fontSize: 11, color: C.blue }}>{dc.region}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => router.push(`/asset-portfolio/${dc.id}/twin`)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600,
              color: C.cyan, background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)',
              borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
            }}
          >
            <Boxes size={13} /> Open Digital Twin
          </button>
          <button onClick={onClose} style={{ color: C.muted, cursor: 'pointer', background: 'none', border: 'none', padding: 4 }}>
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Region Context */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        <KPI label="DCs in Region"     value={regionCtx.total}  sub={dc.region}           color={C.blue}
          elaboration={`${regionCtx.total} data centers in the ${dc.region} region — ${regionCtx.active} active and ${regionCtx.uc} under construction. This campus is one of ${regionCtx.total} sites in the region forming Google's ${dc.region} infrastructure cluster.`} />
        <KPI label="Active in Region"  value={regionCtx.active} sub="Operational"          color={C.green}
          elaboration={`${regionCtx.active} of ${regionCtx.total} ${dc.region} sites are in live commercial operation. The ${Math.round((regionCtx.active / regionCtx.total) * 100)}% active rate reflects the region's current build-out stage — the remaining ${regionCtx.uc} under-construction sites will materially increase regional capacity once commissioned.`} />
        <KPI label="UC in Region"      value={regionCtx.uc}     sub="Under Construction"   color={C.amber}
          elaboration={`${regionCtx.uc} sites across ${dc.region} are actively under construction, representing the near-term supply pipeline for this region. Once commissioned, these sites will significantly expand regional IT capacity and reduce geographic concentration risk.`} />
        <KPI label="At Risk in Region" value={regionCtx.atRisk} sub="Medium + High risk"   color={regionCtx.atRisk > 0 ? C.red : C.green}
          elaboration={regionCtx.atRisk > 0
            ? `${regionCtx.atRisk} site${regionCtx.atRisk > 1 ? 's' : ''} in ${dc.region} carry a non-Low risk flag, requiring elevated NOC attention. Regional risk concentration above 20% of active sites triggers a portfolio-level operational review.`
            : `All ${dc.region} sites are currently at Low risk. The region is operating within normal operational parameters with no elevated alarm or infrastructure vulnerability flags.`} />
      </div>

      {/* KPI Row 1 — Capacity & Operations */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        <KPI label="IT Capacity" value={`${dc.capacity_mw} MW`} sub="Total IT Load" color={C.cyan}
          elaboration={`${dc.capacity_mw} MW of nameplate IT power capacity — the maximum compute load this campus can support across all installed power distribution paths. ${utilPct > 80 ? `At ${utilPct}% utilisation, headroom is limited and capacity expansion planning is likely in progress.` : utilPct < 40 ? `At ${utilPct}% utilisation, significant headroom remains for workload growth without new infrastructure investment.` : `At ${utilPct}% utilisation, the site is in the healthy operating range.`}`} />
        <KPI label="Utilization" value={`${utilPct}%`} sub="Current Load" color={utilColor}
          elaboration={`${utilPct}% of the ${dc.capacity_mw} MW nameplate capacity is currently consumed by live workloads. ${utilPct > 85 ? 'This is approaching the 85% sustained utilisation trigger for expansion planning — additional capacity or load migration should be assessed.' : utilPct > 70 ? 'Healthy utilisation range. The site is generating strong asset yield while maintaining headroom for demand spikes.' : 'Utilisation is below the optimal range, indicating available capacity for new workload onboarding.'}`} />
        <KPI label="PUE" value={dc.pue.toFixed(2)} sub="Power Efficiency" color={C.blue}
          elaboration={`PUE of ${dc.pue.toFixed(2)} means ${((dc.pue - 1) * 100).toFixed(0)} cents of overhead energy (cooling, lighting, UPS losses) is consumed per dollar of IT power delivered. ${dc.pue <= 1.10 ? 'World-class efficiency — in the top tier globally.' : dc.pue <= 1.15 ? 'Above-industry-average efficiency.' : 'Improvement opportunity exists — each 0.01 PUE reduction yields meaningful annual energy cost savings at this site scale.'}`} />
        <KPI label="Tier" value={`Tier ${dc.tier}`} sub="Facility Rating" color={C.purple}
          elaboration={`Tier ${dc.tier} certification from the Uptime Institute. ${dc.tier === 'IV' ? 'Tier IV = 2N fault-tolerant design with 99.995% uptime SLA. No single point of failure exists — any component can be taken offline without impacting IT load.' : dc.tier === 'III' ? 'Tier III = N+1 concurrent maintainability with 99.982% uptime SLA. All components can be maintained without IT load interruption.' : 'Tier II = N+1 redundancy with 99.741% uptime SLA.'}`} />
        <KPI label="Renewable" value={`${dc.renewable_pct}%`} sub="Energy Mix" color={C.green}
          elaboration={`${dc.renewable_pct}% of this site's electricity consumption is matched to renewable or carbon-free energy via PPAs, on-site generation, or market instruments. ${dc.renewable_pct >= 90 ? 'Near-fully matched to CFE — among the best in the portfolio.' : dc.renewable_pct >= 70 ? 'Above portfolio average. Additional PPA procurement could close the gap to 100% CFE.' : 'Below the portfolio average of 71%. PPA execution for local wind or solar is the recommended path to close this gap.'}`} />
        <KPI label="Carbon/yr" value={`${dc.carbon_mt} MT`} sub="Estimated CO₂" color={dc.carbon_mt > 80 ? C.amber : C.muted}
          elaboration={`Estimated ${dc.carbon_mt} metric tonnes of CO₂ equivalent per year from this site's electricity consumption. Calculated as: IT Capacity × Utilization × PUE × (1 - Renewable%) × regional grid carbon intensity. ${dc.carbon_mt > 80 ? 'Above-average carbon output — accelerating renewable procurement would materially reduce this figure.' : 'Within normal range given the site scale and current renewable mix.'}`} />
        <KPI label="Carbon Intensity" value={`${(dc.carbon_mt / (dc.capacity_mw || 1)).toFixed(2)} MT/MW`} sub="Per MW IT Load" color={C.purple}
          elaboration={`Carbon intensity of ${(dc.carbon_mt / (dc.capacity_mw || 1)).toFixed(2)} MT CO₂ per MW normalises emissions by IT capacity, enabling like-for-like comparison across sites of different scales. Best-in-class Nordic sites achieve 0.04–0.06 MT/MW via near-100% hydropower. Sites above 0.5 MT/MW represent material Scope 2 ESG reporting risk under CSRD and CDP frameworks.`} />
      </div>

      {/* KPI Row 2 — Assets & Alarms */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <KPI label="Racks" value={dc.asset_racks.toLocaleString()} color={C.muted}
          elaboration={`${dc.asset_racks.toLocaleString()} installed rack positions across this campus. Each rack represents a discrete unit of IT real estate — at an average density of ${(dc.capacity_mw / dc.asset_racks * 1000).toFixed(0)} kW/rack for this site, ${dc.capacity_mw / dc.asset_racks * 1000 > 15 ? 'indicating high-density GPU or AI compute configuration.' : 'consistent with standard server rack density.'}`} />
        <KPI label="Servers" value={dc.asset_servers.toLocaleString()} color={C.muted}
          elaboration={`${dc.asset_servers.toLocaleString()} server instances (physical and virtual host devices) deployed at this site. Drives hardware refresh capex cycles and OEM contract sizing. Average of ${Math.round(dc.asset_servers / dc.asset_racks)} servers per rack at this campus.`} />
        <KPI label="GPUs" value={dc.asset_gpus.toLocaleString()} color={C.muted}
          elaboration={`${dc.asset_gpus.toLocaleString()} GPU accelerator units deployed, representing ${Math.round((dc.asset_gpus / dc.asset_servers) * 100)}% GPU density relative to server count. GPUs power AI and ML workloads — Gemini model training, Google Search AI, YouTube recommendations, and GCP AI Platform. GPU count is the fastest-growing metric in the portfolio as AI workload density increases.`} />
        <KPI label="Critical Alarms" value={dc.alarm_critical} color={dc.alarm_critical > 0 ? C.red : C.green}
          elaboration={dc.alarm_critical > 0
            ? `${dc.alarm_critical} active Critical alarm${dc.alarm_critical > 1 ? 's' : ''} — P1 incidents with actual or imminent service disruption risk. Each requires NOC response within 15 minutes. Immediate investigation and escalation to the on-call facilities manager is required.`
            : `No active Critical alarms. This site is operating within all critical thresholds. P1 status is clear.`} />
        <KPI label="High Alarms" value={dc.alarm_high} color={dc.alarm_high > 0 ? C.amber : C.green}
          elaboration={dc.alarm_high > 0
            ? `${dc.alarm_high} active High-severity alarm${dc.alarm_high > 1 ? 's' : ''} — P2 conditions indicating significant degradation or redundancy loss (e.g. UPS battery fault, redundant path failure). Response SLA is 2 hours. Root cause investigation and corrective action should be in progress.`
            : `No active High alarms. All redundancy paths and major systems are healthy.`} />
        <KPI label="Med Alarms" value={dc.alarm_medium} color={dc.alarm_medium > 0 ? '#F59E0B' : C.green}
          elaboration={`${dc.alarm_medium} active Medium-severity alarm${dc.alarm_medium !== 1 ? 's' : ''} — P3 early-warning signals (temperature trending, generator fuel level, UPS battery score) requiring planned corrective action within 8 hours. These feed the weekly preventive maintenance schedule.`} />
        <KPI label="Low Alarms" value={dc.alarm_low} color={C.muted}
          elaboration={`${dc.alarm_low} active Low-severity notice${dc.alarm_low !== 1 ? 's' : ''} — P4 informational alerts such as firmware updates, minor sensor drift, or inspection reminders. Non-urgent individually, but a high volume may indicate maintenance backlog accumulation and should be reviewed monthly.`} />
      </div>

      {/* Real Estate KPIs — Active DCs only */}
      {!isUC && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          <KPI label="Site Area (est.)" value={`${re.acreage} ac`} sub="Campus footprint" color={C.blue}
            elaboration={`Estimated campus footprint of ${re.acreage} acres derived from ${dc.capacity_mw} MW IT capacity at ~2.8 acres per 100 MW — consistent with hyperscale benchmarks for power infrastructure, cooling yards, and security perimeters. Actual site acreage may vary with local topography and campus master-plan layout.`} />
          <KPI label="Ownership" value={re.ownership} sub="Title type" color={C.purple}
            elaboration={re.ownership === 'Owned'
              ? `Fee-simple ownership provides full control over future expansion phasing, eliminates ground-lease reversion risk, and maximises asset value on the balance sheet. Typical of Tier ${dc.tier} campuses at ${dc.capacity_mw} MW scale — Google's preference for strategic long-term infrastructure investments.`
              : `Ground lease structure reduces upfront capital outlay and is common for urban or constrained sites. Lease terms for data center campuses typically run 40–99 years with renewal options designed to cover the full expected asset life, providing operational continuity equivalent to ownership.`} />
          <KPI label="Data Halls" value={re.buildings} sub="Campus buildings" color={C.cyan}
            elaboration={`${re.buildings} data hall building${re.buildings > 1 ? 's' : ''} estimated from ${dc.capacity_mw} MW IT load at ~60 MW per hall — standard hyperscale envelope. Each hall is designed for independent commissioning, enabling phased capacity delivery that matches demand growth and avoids stranded capital on unfilled white space.`} />
          <KPI label="Expansion Reserve" value={`${re.expAcres} ac`} sub="Land held for future phases" color={C.green}
            elaboration={`Approximately ${re.expAcres} acres (~40% of campus footprint) reserved for future expansion phases. This land reserve allows additional data hall construction without new land acquisition or planning consent, reducing time-to-capacity for future builds and protecting the campus's long-term growth optionality.`} />
          <KPI label="Phase Status" value="Fully Operational" sub={dc.status} color={C.green}
            elaboration={`Campus is fully commissioned and serving production AI and cloud workloads at ${utilPct}% utilisation. All power distribution, cooling, and network infrastructure has passed acceptance testing. The site is generating revenue and contributing to regional SLA coverage for enterprise and hyperscale tenants.`} />
        </div>
      )}

      {/* Construction Progress KPIs — Under Construction DCs only */}
      {isUC && con && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          <KPI label="Completion" value={`${con.pct}%`} sub="Construction progress"
            color={con.pct > 80 ? C.green : con.pct > 60 ? C.amber : C.blue}
            elaboration={`Estimated ${con.pct}% of physical construction and electrical commissioning complete. Derived from commissioning test utilisation levels (${dc.utilization_pct}% shell load) and construction milestone benchmarks. ${con.pct > 80 ? 'Final acceptance testing is the remaining critical path.' : con.pct > 60 ? 'MEP and fit-out works are the current critical path activities.' : 'Civil and structural works are the primary focus at this stage.'}`} />
          <KPI label="Handover Est." value={con.handoverStr} sub={`~${con.monthsLeft} months away`} color={C.cyan}
            elaboration={`Predicted commercial operations date of ${con.handoverStr} based on current completion rate (${con.pct}%), site scale (${dc.capacity_mw} MW), and remaining phase duration benchmarks. This is an AI-derived estimate — subject to grid interconnection permit timing, long-lead equipment deliveries, and any planning scope changes.`} />
          <KPI label="Current Phase" value={con.phase} sub="Active build stage" color={C.purple}
            elaboration={`The site is in the ${con.phase} phase. ${
              con.phase === 'Civil & Structural' ? 'Foundation works, structural steel, and building envelope are the primary activities. MEP design is being finalised in parallel.' :
              con.phase === 'MEP Installation' ? 'Mechanical, electrical, and plumbing systems are being installed. Power distribution, UPS, and cooling plant commissioning follow.' :
              con.phase === 'Fit-Out & Commissioning' ? 'IT white space, power distribution units, and cooling systems are being commissioned. Initial rack energisation is approaching.' :
              'All systems are undergoing integrated acceptance testing prior to commercial handover.'
            }`} />
          <KPI label="Programme" value={con.activity} sub="Build classification" color={C.muted}
            elaboration={`Classified as a ${con.activity}. ${dc.tier === 'IV' ? `Tier IV fault-tolerant design requires 2N redundancy across all systems — extending commissioning timelines but delivering 99.995% uptime SLA capability for regulated-industry and AI infrastructure tenants.` : `Standard build programme with N+1 redundancy targeting Tier III concurrent maintainability (99.982% uptime SLA).`}`} />
          <KPI label="Site Area (est.)" value={`${re.acreage} ac`} sub="Campus footprint" color={C.blue}
            elaboration={`Estimated campus footprint of ${re.acreage} acres from ${dc.capacity_mw} MW IT capacity. Construction site boundary includes active build zones, laydown areas, and land reserved for future expansion phases (~${re.expAcres} ac).`} />
        </div>
      )}

      {/* Bottom Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        {/* Active Alarms (Active DCs) / Construction Progress (UC DCs) */}
        {!isUC ? (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <SectionTitle>Active Alarms</SectionTitle>
              <AIBadge />
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {[
                { label: 'Crit', val: dc.alarm_critical, color: C.red },
                { label: 'High', val: dc.alarm_high, color: C.amber },
                { label: 'Med',  val: dc.alarm_medium, color: '#F59E0B' },
                { label: 'Low',  val: dc.alarm_low, color: C.muted },
              ].map(a => (
                <div key={a.label} style={{ flex: 1, background: 'rgba(0,0,0,0.04)', borderRadius: 8, padding: '6px 8px', textAlign: 'center' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: a.color, fontFamily: "'JetBrains Mono', monospace" }}>{a.val}</p>
                  <p style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase' }}>{a.label}</p>
                </div>
              ))}
            </div>
            {MOCK_ALARMS.slice(0, dc.alarm_high + dc.alarm_critical > 0 ? 3 : 1).map((al, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 12, paddingBottom: 12, borderBottom: i < (dc.alarm_high + dc.alarm_critical > 0 ? 2 : 0) ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: ALARM_COLOR[al.severity], marginTop: 5, flexShrink: 0 }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: C.text, margin: 0 }}>{al.message}</p>
                    <span style={{ fontSize: 9, color: C.muted, flexShrink: 0 }}>· {al.time}</span>
                  </div>
                  <p style={{ fontSize: 10.5, color: C.muted, lineHeight: 1.55, margin: 0 }}>{al.elaboration}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <SectionTitle>Construction Progress</SectionTitle>
              <AIBadge />
            </div>
            {/* Completion bar */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: C.muted }}>Build completion</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: con.pct > 80 ? C.green : con.pct > 60 ? C.amber : C.blue, fontFamily: "'JetBrains Mono', monospace" }}>{con.pct}%</span>
              </div>
              <div style={{ height: 6, background: C.border, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${con.pct}%`, background: con.pct > 80 ? C.green : con.pct > 60 ? C.amber : C.blue, borderRadius: 4, transition: 'width 0.4s ease' }} />
              </div>
            </div>
            {conIntel.map((item, i) => (
              <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < conIntel.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, marginBottom: 5, display: 'inline-block',
                  background: 'rgba(212,160,23,0.12)', color: C.amber, border: '1px solid rgba(212,160,23,0.3)',
                }}>{item.tag}</span>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 3 }}>{item.text}</p>
                <p style={{ fontSize: 10.5, color: C.muted, lineHeight: 1.55, margin: 0 }}>{item.elaboration}</p>
              </div>
            ))}
          </div>
        )}

        {/* DC Intelligence */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <SectionTitle>DC Intelligence</SectionTitle>
            <AIBadge />
          </div>
          {MOCK_INTEL.map((item, i) => (
            <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < MOCK_INTEL.length - 1 ? `1px solid ${C.border}` : 'none' }}>
              <span style={{
                fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, marginBottom: 5, display: 'inline-block',
                background: 'rgba(0,119,200,0.12)', color: C.blue, border: '1px solid rgba(0,119,200,0.25)',
              }}>{item.tag}</span>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 3 }}>{item.text}</p>
              <p style={{ fontSize: 10.5, color: C.muted, lineHeight: 1.55, margin: 0 }}>{item.elaboration}</p>
            </div>
          ))}
          <div style={{ paddingTop: 2 }}>
            <p style={{ fontSize: 10, color: C.muted }}>
              Lat {dc.lat.toFixed(4)}°, Lng {dc.lng.toFixed(4)}° · ID: {dc.id}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

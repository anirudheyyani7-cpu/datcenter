'use client';
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

function KPI({ label, value, sub, color = C.blue }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 18px', flex: 1, minWidth: 110, boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}>
      <p style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>{sub}</p>}
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

  const flag = FLAG_EMOJI[dc.country] || '🌐';
  const statusColor = dc.status === 'Active' ? C.green : C.amber;
  const riskColor = { High: C.red, Medium: C.amber, Low: C.green }[dc.risk_flag];
  const utilPct = Math.round(dc.utilization_pct);
  const utilColor = utilPct > 90 ? C.red : utilPct > 75 ? C.amber : C.green;

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
        <KPI label="DCs in Region"     value={regionCtx.total}  sub={dc.region}            color={C.blue}  />
        <KPI label="Active in Region"  value={regionCtx.active} sub="Operational"           color={C.green} />
        <KPI label="UC in Region"      value={regionCtx.uc}     sub="Under Construction"    color={C.amber} />
        <KPI label="At Risk in Region" value={regionCtx.atRisk} sub="Medium + High risk"    color={regionCtx.atRisk > 0 ? C.red : C.green} />
      </div>

      {/* KPI Row 1 — Capacity & Operations */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        <KPI label="IT Capacity" value={`${dc.capacity_mw} MW`} sub="Total IT Load" color={C.cyan} />
        <KPI label="Utilization" value={`${utilPct}%`} sub="Current Load" color={utilColor} />
        <KPI label="PUE" value={dc.pue.toFixed(2)} sub="Power Efficiency" color={C.blue} />
        <KPI label="Tier" value={`Tier ${dc.tier}`} sub="Facility Rating" color={C.purple} />
        <KPI label="Renewable" value={`${dc.renewable_pct}%`} sub="Energy Mix" color={C.green} />
        <KPI label="Carbon/yr" value={`${dc.carbon_mt} MT`} sub="Estimated CO₂" color={dc.carbon_mt > 80 ? C.amber : C.muted} />
        <KPI label="Carbon Intensity" value={`${(dc.carbon_mt / (dc.capacity_mw || 1)).toFixed(2)} MT/MW`} sub="Per MW IT Load" color={C.purple} />
      </div>

      {/* KPI Row 2 — Assets & Alarms */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <KPI label="Racks" value={dc.asset_racks.toLocaleString()} color={C.muted} />
        <KPI label="Servers" value={dc.asset_servers.toLocaleString()} color={C.muted} />
        <KPI label="GPUs" value={dc.asset_gpus.toLocaleString()} color={C.muted} />
        <KPI label="Critical Alarms" value={dc.alarm_critical} color={dc.alarm_critical > 0 ? C.red : C.green} />
        <KPI label="High Alarms" value={dc.alarm_high} color={dc.alarm_high > 0 ? C.amber : C.green} />
        <KPI label="Med Alarms" value={dc.alarm_medium} color={dc.alarm_medium > 0 ? '#F59E0B' : C.green} />
        <KPI label="Low Alarms" value={dc.alarm_low} color={C.muted} />
      </div>

      {/* Bottom Grid — Alarms + Intel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        {/* Active Alarms */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <SectionTitle>Active Alarms</SectionTitle>
            <AIBadge />
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {[
              { label: 'Crit', val: dc.alarm_critical, color: C.red },
              { label: 'High', val: dc.alarm_high, color: C.amber },
              { label: 'Med',  val: dc.alarm_medium,  color: '#F59E0B' },
              { label: 'Low',  val: dc.alarm_low,     color: C.muted },
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

'use client';
import { X, Server, Cpu, Layers, Zap, Leaf, AlertTriangle, MapPin } from 'lucide-react';

const C = {
  card: '#0d1f3c',
  cardInner: '#0a1628',
  border: 'rgba(255,255,255,0.09)',
  blue: '#0077C8',
  green: '#00A36C',
  amber: '#D4A017',
  red: '#DC2626',
  cyan: '#06B6D4',
  purple: '#7C3AED',
  text: 'rgba(255,255,255,0.9)',
  muted: 'rgba(255,255,255,0.45)',
};

const FLAG_EMOJI = {
  'USA': '🇺🇸', 'Chile': '🇨🇱', 'Uruguay': '🇺🇾', 'Australia': '🇦🇺',
  'Austria': '🇦🇹', 'Belgium': '🇧🇪', 'Denmark': '🇩🇰', 'Finland': '🇫🇮',
  'France': '🇫🇷', 'Germany': '🇩🇪', 'Ireland': '🇮🇪', 'Netherlands': '🇳🇱',
  'Norway': '🇳🇴', 'Portugal': '🇵🇹', 'Sweden': '🇸🇪', 'UK': '🇬🇧',
  'India': '🇮🇳', 'Japan': '🇯🇵', 'Malaysia': '🇲🇾', 'Singapore': '🇸🇬',
  'Taiwan': '🇹🇼',
};

function KPI({ label, value, icon: Icon, color = C.blue }) {
  return (
    <div style={{
      background: C.cardInner, border: `1px solid ${C.border}`, borderRadius: 10,
      padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 110
    }}>
      {Icon && (
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={13} color={color} />
        </div>
      )}
      <div>
        <p style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 14, fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{value}</p>
      </div>
    </div>
  );
}

const MOCK_ALARMS = [
  { severity: 'HIGH',   message: 'UPS module B2 — battery health below threshold',   time: '2h ago' },
  { severity: 'MEDIUM', message: 'CRAC unit 14 — supply air temperature deviation +2°C', time: '5h ago' },
  { severity: 'LOW',    message: 'PDU branch circuit 07 load at 78% — approaching limit', time: '8h ago' },
  { severity: 'INFO',   message: 'Scheduled maintenance window confirmed — Sunday 02:00', time: '1d ago' },
];

const MOCK_INTEL = [
  { tag: 'Power Grid', text: 'Regional utility upgrade expanding capacity by 200 MW by Q3' },
  { tag: 'Sustainability', text: 'PPA signed for new wind farm — renewable % rising 12pts' },
  { tag: 'Network', text: 'New 400G backbone ring reduces regional latency by 18%' },
];

const ALARM_COLOR = { HIGH: C.red, MEDIUM: C.amber, LOW: '#F59E0B', INFO: C.muted };

export default function DCCommandCenter({ dc, onClose }) {
  if (!dc) return null;

  const flag = FLAG_EMOJI[dc.country] || '🌐';
  const statusColor = dc.status === 'Active' ? C.green : C.amber;
  const riskColor = { High: C.red, Medium: C.amber, Low: C.green }[dc.risk_flag];
  const utilPct = Math.round(dc.utilization_pct);
  const utilColor = utilPct > 90 ? C.red : utilPct > 75 ? C.amber : C.green;

  const totalAlarms = dc.alarm_critical + dc.alarm_high + dc.alarm_medium + dc.alarm_low;

  return (
    <div style={{ background: '#0B1929', padding: '20px 24px', overflowY: 'auto', maxHeight: 'calc(100vh - 420px)' }}>
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
            <span style={{ fontSize: 11, color: '#0077C8' }}>{dc.region}</span>
          </div>
        </div>
        <button onClick={onClose} style={{ color: C.muted, cursor: 'pointer', background: 'none', border: 'none', padding: 4 }}>
          <X size={16} />
        </button>
      </div>

      {/* KPI Row 1 — Capacity & Operations */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <KPI label="IT Capacity" value={`${dc.capacity_mw} MW`} icon={Zap} color={C.cyan} />
        <KPI label="Utilization" value={`${utilPct}%`} icon={Layers} color={utilColor} />
        <KPI label="PUE" value={dc.pue.toFixed(2)} icon={Zap} color={C.blue} />
        <KPI label="Tier" value={`Tier ${dc.tier}`} icon={Server} color={C.purple} />
        <KPI label="Renewable" value={`${dc.renewable_pct}%`} icon={Leaf} color={C.green} />
        <KPI label="Carbon/yr" value={`${dc.carbon_mt} MT`} icon={AlertTriangle} color={dc.carbon_mt > 80 ? C.amber : C.muted} />
      </div>

      {/* KPI Row 2 — Assets */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <KPI label="Racks" value={dc.asset_racks.toLocaleString()} icon={Layers} color={C.muted} />
        <KPI label="Servers" value={dc.asset_servers.toLocaleString()} icon={Server} color={C.muted} />
        <KPI label="GPUs" value={dc.asset_gpus.toLocaleString()} icon={Cpu} color={C.muted} />
        <KPI label="Active Alarms" value={totalAlarms} icon={AlertTriangle} color={dc.alarm_critical > 0 ? C.red : dc.alarm_high > 0 ? C.amber : C.green} />
      </div>

      {/* Bottom Grid — Alarms + Intel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Alarms */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
            Active Alarms
          </p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {[
              { label: 'Crit', val: dc.alarm_critical, color: C.red },
              { label: 'High', val: dc.alarm_high, color: C.amber },
              { label: 'Med', val: dc.alarm_medium, color: '#F59E0B' },
              { label: 'Low', val: dc.alarm_low, color: C.muted },
            ].map(a => (
              <div key={a.label} style={{ flex: 1, background: C.cardInner, borderRadius: 8, padding: '6px 8px', textAlign: 'center' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: a.color, fontFamily: "'JetBrains Mono', monospace" }}>{a.val}</p>
                <p style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase' }}>{a.label}</p>
              </div>
            ))}
          </div>
          {MOCK_ALARMS.slice(0, dc.alarm_high + dc.alarm_critical > 0 ? 3 : 1).map((al, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: ALARM_COLOR[al.severity], marginTop: 4, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 11, color: C.text }}>{al.message}</p>
                <p style={{ fontSize: 9, color: C.muted }}>{al.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Intelligence Feed */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
            DC Intelligence
          </p>
          {MOCK_INTEL.map((item, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <span style={{
                fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, marginBottom: 4, display: 'inline-block',
                background: 'rgba(0,119,200,0.12)', color: C.blue, border: '1px solid rgba(0,119,200,0.25)',
              }}>{item.tag}</span>
              <p style={{ fontSize: 11, color: C.text, lineHeight: 1.5 }}>{item.text}</p>
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 4 }}>
            <p style={{ fontSize: 10, color: C.muted }}>
              Lat {dc.lat.toFixed(4)}°, Lng {dc.lng.toFixed(4)}° · ID: {dc.id}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

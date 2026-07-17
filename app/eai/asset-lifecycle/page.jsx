'use client';
import { useState, useMemo } from 'react';
import {
  Search, Filter, Download, Plus, ChevronDown, Home, ChevronLeft, ChevronRight,
  Package, Activity, Wrench, AlertTriangle, CheckCircle, XCircle, Archive,
  Columns3, ExternalLink,
  AlertCircle, Lightbulb, Thermometer, Cpu,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip as RTooltip } from 'recharts';

import {
  ASSETS, PORTFOLIO, STAGE_META, STATUS_META,
  getLifecycleStats, getCategoryStats, getAgeProfileData, buildAssetTimeline,
} from '@/data/eaiAssetLifecycleMock';

import KpiCard          from '@/components/eai/widgets/KpiCard';
import DonutChart       from '@/components/eai/widgets/DonutChart';
import GaugeChart       from '@/components/eai/widgets/GaugeChart';
import HorizontalBarList from '@/components/eai/widgets/HorizontalBarList';
import Stepper          from '@/components/eai/widgets/Stepper';
import QuickActionsMenu from '@/components/eai/widgets/QuickActionsMenu';

// ─── Design tokens ────────────────────────────────────────────────────────────
const BG    = '#F4F6F9';
const CARD  = '#FFFFFF';
const BORD  = '#E2E8F0';
const DIM   = '#6B7280';
const DIMMER = '#9CA3AF';
const PER_PAGE = 8;

// ─── Pipeline strip configuration ────────────────────────────────────────────
const PIPELINE = [
  { key: 'overview',    label: 'Lifecycle Overview', sub: 'All Assets',          icon: Package,       color: '#0077C8', countKey: null,                   pct: 100     },
  { key: 'discover',    label: 'Discover / Inventory', sub: null,                icon: Search,        color: '#10B981', countKey: 'Discover',             pctKey: 'Discover'     },
  { key: 'inuse',       label: 'In Use',              sub: null,                 icon: Activity,      color: '#0077C8', countKey: 'In Use',               pctKey: 'In Use'       },
  { key: 'maintenance', label: 'Maintenance',          sub: null,                icon: Wrench,        color: '#F59E0B', countKey: 'Maintenance',           pctKey: 'Maintenance'  },
  { key: 'repair',      label: 'Repair',               sub: null,                icon: AlertTriangle, color: '#DC2626', countKey: 'Repair',               pctKey: 'Repair'       },
  { key: 'ready',       label: 'Ready for Deployment', sub: null,                icon: CheckCircle,   color: '#7C3AED', countKey: 'Ready for Deployment', pctKey: 'Ready for Deployment' },
  { key: 'eol',         label: 'End of Life',          sub: null,                icon: XCircle,       color: '#EF4444', countKey: 'End of Life',          pctKey: 'End of Life'  },
  { key: 'retired',     label: 'Retired',              sub: null,                icon: Archive,       color: '#6B7280', countKey: 'Retired',              pctKey: 'Retired'      },
];

// ─── Inline helpers ───────────────────────────────────────────────────────────

function Card({ title, action, children, style }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)', ...style }}>
      {(title || action) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: `1px solid ${BORD}`, flexShrink: 0 }}>
          {title && <span style={{ fontSize: 11, fontWeight: 700, color: '#1A1F36' }}>{title}</span>}
          {action}
        </div>
      )}
      <div style={{ flex: 1, padding: 14 }}>{children}</div>
    </div>
  );
}

function DropBtn({ children, style }) {
  return (
    <button style={{
      display: 'flex', alignItems: 'center', gap: 4,
      background: '#F8FAFC', border: `1px solid ${BORD}`,
      borderRadius: 7, padding: '4px 9px', cursor: 'pointer',
      color: DIM, fontSize: 9, ...style,
    }}>{children}</button>
  );
}

function StatusBadge({ status }) {
  const m = STATUS_META[status] ?? { color: '#6B7280', bg: 'rgba(107,114,128,0.18)' };
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 5,
      color: m.color, background: m.bg, border: `1px solid ${m.color}44`,
      whiteSpace: 'nowrap',
    }}>{status}</span>
  );
}

function StageBadge({ stage }) {
  const m = STAGE_META[stage] ?? { color: '#6B7280', bg: 'rgba(107,114,128,0.18)' };
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 5,
      color: m.color, background: m.bg, border: `1px solid ${m.color}44`,
      whiteSpace: 'nowrap',
    }}>{stage}</span>
  );
}

function RiskDot({ score }) {
  const color = score >= 70 ? '#EF4444' : score >= 40 ? '#F59E0B' : '#00A36C';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
      <span style={{ fontSize: 10, fontWeight: 700, color, fontFamily: 'ui-monospace,monospace' }}>{score}</span>
    </div>
  );
}

function StagePipelineCard({ label, sub, Icon, color, count, pct, active, onClick, seed }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? `${color}18` : CARD,
        border: `1px solid ${active ? color + '44' : BORD}`,
        borderRadius: 12, padding: '10px 12px',
        display: 'flex', flexDirection: 'column', gap: 4,
        cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
        minWidth: 0, overflow: 'hidden',
        boxShadow: active ? 'none' : '0 1px 2px rgba(16, 24, 40, 0.04)',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#F4F6F9'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = CARD; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
        <div style={{ width: 24, height: 24, borderRadius: 7, background: color + '28', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={12} style={{ color }} />
        </div>
        <span style={{ fontSize: 8, color: DIMMER, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub ?? ''}</span>
      </div>
      <div>
        <p style={{ fontSize: 8, color: DIM, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</p>
        <p style={{ fontSize: 18, fontWeight: 700, color: '#1A1F36', fontFamily: 'ui-monospace,monospace', lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {count?.toLocaleString() ?? '—'}
        </p>
      </div>
      {/* Progress bar */}
      <div style={{ marginTop: 2 }}>
        <div style={{ height: 3, borderRadius: 2, background: '#E2E8F0', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2 }} />
        </div>
        <p style={{ fontSize: 8, color: DIM, marginTop: 2 }}>{pct?.toFixed(1)}%</p>
      </div>
    </button>
  );
}

// ─── Chart data helpers ───────────────────────────────────────────────────────
const DONUT_DATA = [
  { name: 'In Use',               color: '#0077C8', value: 83.6, mw: 17842 },
  { name: 'Maintenance',          color: '#F59E0B', value: 7.7,  mw: 1642  },
  { name: 'Ready for Deploy',     color: '#7C3AED', value: 3.0,  mw: 632   },
  { name: 'End of Life',          color: '#EF4444', value: 3.7,  mw: 788   },
  { name: 'Retired',              color: '#6B7280', value: 3.4,  mw: 730   },
  { name: 'Repair',               color: '#DC2626', value: 2.0,  mw: 438   },
];

const CATEGORY_BARS = [
  { label: 'Server',   value: 7532, color: '#0077C8' },
  { label: 'Storage',  value: 3862, color: '#7C3AED' },
  { label: 'Network',  value: 3124, color: '#10B981' },
  { label: 'Power',    value: 2843, color: '#F59E0B' },
  { label: 'Cooling',  value: 2126, color: '#06B6D4' },
  { label: 'Security', value: 1245, color: '#EF4444' },
  { label: 'Others',   value:  610, color: '#6B7280' },
];

const AGE_COLORS = { 'In Use': '#0077C8', Maintenance: '#F59E0B', 'EOL <12mo': '#EF4444' };

const RISK_FACTORS = [
  { label: 'High asset age (> 7 yrs)',    score: 72 },
  { label: 'EOL within 12 months',        score: 65 },
  { label: 'Critical components aging',   score: 61 },
  { label: 'Firmware/OS outdated',        score: 58 },
  { label: 'High failure incidents',      score: 54 },
];

const MILESTONES = [
  { label: 'Warranty Expiries (30 days)',  count: 128, Icon: AlertCircle, color: '#F59E0B' },
  { label: 'EOL within 60 days',          count:  96, Icon: XCircle,     color: '#EF4444' },
  { label: 'Maintenance Due (7 days)',     count: 214, Icon: Wrench,      color: '#0077C8' },
  { label: 'Repairs Due for Completion',  count:  38, Icon: AlertTriangle, color: '#DC2626' },
  { label: 'Firmware/OS Updates',         count: 156, Icon: Cpu,         color: '#7C3AED' },
];

const INSIGHTS = [
  { text: '432 assets are above 7 years of age. Review replacement plan.',     Icon: Thermometer, color: '#F59E0B' },
  { text: '96 assets will reach EOL in next 60 days. Plan procurement.',        Icon: AlertCircle, color: '#EF4444' },
  { text: 'Cooling units in Building A require attention. Failure risk is high.', Icon: Lightbulb, color: '#0077C8' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AssetLifecyclePage() {
  const [selectedAsset,  setSelectedAsset]  = useState(ASSETS[0]);
  const [searchQ,        setSearchQ]        = useState('');
  const [stageFilter,    setStageFilter]    = useState(null);
  const [catFilter,      setCatFilter]      = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter,   setStatusFilter]   = useState('');
  const [vendorFilter,   setVendorFilter]   = useState('');
  const [page,           setPage]           = useState(1);

  // Derived data
  const lifecycleStats = useMemo(() => getLifecycleStats(), []);
  const ageProfileData = useMemo(() => getAgeProfileData(), []);
  const timeline       = useMemo(() => buildAssetTimeline(selectedAsset), [selectedAsset]);

  // Portfolio-level stage counts from PORTFOLIO (enterprise scale)
  const pCounts = PORTFOLIO.byStage;
  const pTotal  = PORTFOLIO.total;

  // Table filtering
  const filtered = useMemo(() => {
    const q = searchQ.toLowerCase();
    return ASSETS.filter(a => {
      if (q && !`${a.assetId} ${a.assetName} ${a.vendor} ${a.model} ${a.location}`.toLowerCase().includes(q)) return false;
      if (stageFilter && a.lifecycleStage !== stageFilter) return false;
      if (catFilter      && a.category                           !== catFilter)      return false;
      if (locationFilter && !a.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;
      if (statusFilter   && a.status                            !== statusFilter)   return false;
      if (vendorFilter   && a.vendor                            !== vendorFilter)   return false;
      return true;
    });
  }, [searchQ, stageFilter, catFilter, statusFilter, vendorFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageData   = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const vendors    = [...new Set(ASSETS.map(a => a.vendor))].sort();
  const locations  = [...new Set(ASSETS.map(a => a.location.split('/')[0].trim()))].sort();

  // Stage counts from actual ASSETS for sidebar badges
  const stageCounts = lifecycleStats.counts;

  const handleStageSelect = stage => {
    setStageFilter(s => s === stage ? null : stage);
    setPage(1);
  };

  const TH = { fontSize: 9, fontWeight: 700, color: DIMMER, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '8px 10px', whiteSpace: 'nowrap' };
  const TD = { fontSize: 10, color: '#1A1F36', padding: '9px 10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 0 };

  return (
    <div style={{ height: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: BG }}>

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div style={{
        height: 52, flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px',
        borderBottom: `1px solid ${BORD}`, background: 'rgba(13,20,40,0.85)', flexWrap: 'nowrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <Home size={13} color={DIM} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#1A1F36' }}>Asset Lifecycle</span>
        </div>

        {/* Global search */}
        <div style={{ flex: 1, maxWidth: 420 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F8FAFC', border: `1px solid ${BORD}`, borderRadius: 9, padding: '5px 12px' }}>
            <Search size={12} style={{ color: DIM, flexShrink: 0 }} />
            <input
              value={searchQ}
              onChange={e => { setSearchQ(e.target.value); setPage(1); }}
              placeholder="Search assets, serial no, model, vendor, or location..."
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#1A1F36', fontSize: 11 }}
            />
            <span style={{ fontSize: 9, color: DIMMER, flexShrink: 0 }}>⌘ K</span>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <DropBtn><Filter size={11} /> Filters</DropBtn>
          <DropBtn><Download size={11} /> Export <ChevronDown size={9} /></DropBtn>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px 6px 10px',
            background: '#7C3AED', border: '1px solid #8B5CF6', borderRadius: 8,
            color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer',
          }}>
            <Plus size={13} /> Add Asset <ChevronDown size={10} style={{ opacity: 0.7 }} />
          </button>
          <QuickActionsMenu items={[
            { iconKey: 'Plus',        label: 'Add New Asset'      },
            { iconKey: 'Upload',      label: 'Bulk Import Assets' },
            { iconKey: 'ClipboardList',label: 'Create Work Order' },
            { iconKey: 'BarChart2',   label: 'Generate Report'    },
            { iconKey: 'Download',    label: 'Export Data'        },
          ]} />
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Main scroll area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>

          {/* ── Pipeline strip (8 stage cards) ──────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8 }}>
            {PIPELINE.map(p => {
              const count = p.countKey ? pCounts[p.countKey] : pTotal;
              const pct   = p.countKey ? Math.round(((pCounts[p.countKey] ?? 0) / pTotal) * 1000) / 10 : 100;
              const active = stageFilter === p.countKey;
              return (
                <StagePipelineCard
                  key={p.key}
                  label={p.label}
                  sub={p.sub}
                  Icon={p.icon}
                  color={p.color}
                  count={count}
                  pct={pct}
                  active={active}
                  onClick={() => p.countKey && handleStageSelect(p.countKey)}
                />
              );
            })}
          </div>

          {/* ── Charts row ──────────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.1fr 268px', gap: 10, alignItems: 'start' }}>

            {/* Lifecycle Distribution */}
            <Card title="Lifecycle Distribution">
              <DonutChart
                data={DONUT_DATA}
                centerLabel="21,342"
                centerUnit=""
                centerSublabel="Total Assets"
                height={145}
                innerRadius={44}
                outerRadius={62}
                showLegend
              />
            </Card>

            {/* Assets by Category */}
            <Card
              title="Assets by Category"
              action={<DropBtn>All Categories <ChevronDown size={9} /></DropBtn>}
            >
              <HorizontalBarList items={CATEGORY_BARS} maxValue={CATEGORY_BARS[0].value} />
            </Card>

            {/* Assets by Age Profile */}
            <Card
              title="Assets by Age Profile"
              action={<DropBtn>All Assets <ChevronDown size={9} /></DropBtn>}
            >
              <div style={{ width: '100%', overflow: 'hidden' }}>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={ageProfileData} margin={{ top: 4, right: 4, bottom: 0, left: -26 }}>
                    <XAxis dataKey="bucket" tick={{ fontSize: 7, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 7, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                    <RTooltip
                      contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 10, boxShadow: '0 2px 8px rgba(16,24,40,0.08)' }}
                      labelStyle={{ color: '#6B7280', fontSize: 9 }}
                      itemStyle={{ color: '#1A1F36' }}
                    />
                    {Object.entries(AGE_COLORS).map(([key, color]) => (
                      <Bar key={key} dataKey={key} fill={color} radius={[2, 2, 0, 0]} maxBarSize={14} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div style={{ display: 'flex', gap: 10, marginTop: 6, justifyContent: 'center' }}>
                  {Object.entries(AGE_COLORS).map(([k, c]) => (
                    <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 8, color: DIM }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: 'inline-block', flexShrink: 0 }} />
                      {k}
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Lifecycle Risk Summary */}
            <Card title="Lifecycle Risk Summary" style={{ background: CARD }}>
              <GaugeChart score={68} height={100} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {RISK_FACTORS.map(rf => {
                  const c = rf.score >= 70 ? '#EF4444' : rf.score >= 40 ? '#F59E0B' : '#00A36C';
                  return (
                    <div key={rf.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 9, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rf.label}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, color: c, flexShrink: 0 }}>{rf.score}/100</span>
                    </div>
                  );
                })}
              </div>
              <button style={{ marginTop: 10, fontSize: 9, color: '#0077C8', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                View Risk Analysis <ExternalLink size={9} />
              </button>
            </Card>
          </div>

          {/* ── Asset Lifecycle Tracker ──────────────────────────────────── */}
          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 14, overflow: 'hidden' }}>
            {/* Tracker header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: `1px solid ${BORD}`, gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#1A1F36', flexShrink: 0 }}>Asset Lifecycle Tracker</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, flexWrap: 'wrap', minWidth: 0 }}>
                {/* In-table search */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F8FAFC', border: `1px solid ${BORD}`, borderRadius: 7, padding: '4px 10px', minWidth: 160 }}>
                  <Search size={10} style={{ color: DIM, flexShrink: 0 }} />
                  <input value={searchQ} onChange={e => { setSearchQ(e.target.value); setPage(1); }}
                    placeholder="Search assets..."
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#1A1F36', fontSize: 10, minWidth: 0 }} />
                </div>
                {/* Filter dropdowns */}
                {[
                  { label: 'All Categories', value: catFilter,      set: setCatFilter,      opts: ['Server','Storage','Network','Power','Cooling','Security'] },
                  { label: 'All Locations',  value: locationFilter, set: setLocationFilter, opts: locations },
                  { label: 'All Statuses',   value: statusFilter,   set: setStatusFilter,   opts: ['Operational','Maintenance','Repair','EOL','Ready'] },
                  { label: 'All Vendors',    value: vendorFilter,   set: setVendorFilter,   opts: vendors },
                ].map(f => (
                  <select key={f.label}
                    value={f.value}
                    onChange={e => { f.set(e.target.value); setPage(1); }}
                    style={{
                      background: '#F8FAFC', border: `1px solid ${BORD}`,
                      borderRadius: 7, padding: '4px 8px', color: f.value ? '#1A1F36' : DIM,
                      fontSize: 9, cursor: 'pointer', outline: 'none',
                    }}
                  >
                    <option value="">{f.label}</option>
                    {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ))}
                <DropBtn style={{ marginLeft: 'auto' }}><Columns3 size={10} /> Columns <ChevronDown size={9} /></DropBtn>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: 96  }} />
                  <col style={{ width: 130 }} />
                  <col style={{ width: 76  }} />
                  <col style={{ width: 90  }} />
                  <col style={{ width: 120 }} />
                  <col style={{ width: 200 }} />
                  <col style={{ width: 96  }} />
                  <col style={{ width: 140 }} />
                  <col style={{ width: 52  }} />
                  <col style={{ width: 136 }} />
                  <col style={{ width: 72  }} />
                </colgroup>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORD}` }}>
                    {['Asset ID','Asset Name','Category','Vendor','Model','Location','Status','Lifecycle Stage','Age','Next Milestone','Risk Score'].map(h => (
                      <th key={h} style={{ ...TH, textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageData.map(asset => {
                    const isSel = asset.assetId === selectedAsset.assetId;
                    return (
                      <tr
                        key={asset.assetId}
                        onClick={() => setSelectedAsset(asset)}
                        style={{
                          borderBottom: `1px solid ${BORD}`,
                          background: isSel ? 'rgba(0,119,200,0.10)' : 'transparent',
                          cursor: 'pointer', transition: 'background 0.12s',
                        }}
                        onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = '#F4F6F9'; }}
                        onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <td style={{ ...TD, color: '#0077C8', fontWeight: 600, fontFamily: 'ui-monospace,monospace' }}>{asset.assetId}</td>
                        <td style={TD}>{asset.assetName}</td>
                        <td style={TD}>{asset.category}</td>
                        <td style={TD}>{asset.vendor}</td>
                        <td style={TD}>{asset.model}</td>
                        <td style={TD}>{asset.location}</td>
                        <td style={{ ...TD, overflow: 'visible' }}><StatusBadge status={asset.status} /></td>
                        <td style={{ ...TD, overflow: 'visible' }}><StageBadge stage={asset.lifecycleStage} /></td>
                        <td style={{ ...TD, color: DIM }}>{asset.ageYears} yrs</td>
                        <td style={{ ...TD }}>
                          <p style={{ fontSize: 9, color: '#1A1F36', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{asset.nextMilestone.label}</p>
                          <p style={{ fontSize: 8, color: DIMMER, whiteSpace: 'nowrap' }}>{asset.nextMilestone.date}</p>
                        </td>
                        <td style={{ ...TD, overflow: 'visible' }}><RiskDot score={asset.riskScore} /></td>
                      </tr>
                    );
                  })}
                  {pageData.length === 0 && (
                    <tr><td colSpan={11} style={{ textAlign: 'center', padding: 24, color: DIMMER, fontSize: 11 }}>No assets match the current filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderTop: `1px solid ${BORD}` }}>
              <span style={{ fontSize: 9, color: DIMMER }}>
                Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} assets
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${BORD}`, background: 'transparent', cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: page === 1 ? DIMMER : '#1A1F36', opacity: page === 1 ? 0.4 : 1 }}>
                  <ChevronLeft size={12} />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pg = i + 1;
                  return (
                    <button key={pg} onClick={() => setPage(pg)}
                      style={{ width: 26, height: 26, borderRadius: 6, fontSize: 10, fontWeight: page === pg ? 700 : 400, border: page === pg ? '1px solid #0077C8' : `1px solid ${BORD}`, background: page === pg ? 'rgba(0,119,200,0.20)' : 'transparent', color: page === pg ? '#0077C8' : DIM, cursor: 'pointer' }}>
                      {pg}
                    </button>
                  );
                })}
                {totalPages > 5 && <span style={{ color: DIMMER, fontSize: 10 }}>…{totalPages}</span>}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${BORD}`, background: 'transparent', cursor: page === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: page === totalPages ? DIMMER : '#1A1F36', opacity: page === totalPages ? 0.4 : 1 }}>
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* ── Bottom: Asset Timeline + Right Rail ─────────────────────── */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>

            {/* Asset Timeline */}
            <div style={{ flex: 1, minWidth: 0, background: CARD, border: `1px solid ${BORD}`, borderRadius: 14, overflow: 'hidden' }}>
              {/* Timeline header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: `1px solid ${BORD}` }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1A1F36' }}>
                  Asset Timeline: <span style={{ color: '#0077C8' }}>{selectedAsset.assetName}</span>
                  <span style={{ color: DIMMER, fontWeight: 400, marginLeft: 6 }}>({selectedAsset.assetId})</span>
                </span>
                <button style={{ fontSize: 9, color: '#0077C8', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  View Full History <ExternalLink size={9} />
                </button>
              </div>
              {/* Timeline body */}
              <div style={{ display: 'flex', gap: 14, padding: 14 }}>
                {/* Asset info card */}
                <div style={{ width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ width: '100%', aspectRatio: '4/3', borderRadius: 8, background: 'rgba(0,119,200,0.12)', border: `1px solid ${BORD}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 9, color: DIMMER }}>[ Asset Image ]</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {[
                      { l: 'Category',    v: selectedAsset.category },
                      { l: 'Vendor / Model', v: `${selectedAsset.vendor} / ${selectedAsset.model}` },
                      { l: 'Location',    v: selectedAsset.location },
                      { l: 'Serial No.',  v: selectedAsset.serialNumber },
                    ].map(row => (
                      <div key={row.l} style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 8, color: DIMMER }}>{row.l}</span>
                        <span style={{ fontSize: 9, color: '#1A1F36', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.v}</span>
                      </div>
                    ))}
                    {/* QR placeholder */}
                    <div style={{ marginTop: 4, width: 52, height: 52, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #111 25%, transparent 25%, transparent 75%, #111 75%)', backgroundSize: '6px 6px' }} />
                    </div>
                  </div>
                </div>
                {/* Stepper */}
                <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
                  <Stepper stages={timeline} />
                </div>
              </div>
            </div>

            {/* Right Rail */}
            <div style={{ width: 268, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>

              {/* Upcoming Milestones */}
              <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: `1px solid ${BORD}` }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#1A1F36' }}>Upcoming Milestones</span>
                  <button style={{ fontSize: 9, color: DIMMER, background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
                </div>
                <div style={{ padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {MILESTONES.map(m => (
                    <div key={m.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 7, background: m.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <m.Icon size={11} style={{ color: m.color }} />
                        </div>
                        <span style={{ fontSize: 9, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.label}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1F36', fontFamily: 'ui-monospace,monospace', flexShrink: 0 }}>{m.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Insights & Recommendations */}
              <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${BORD}` }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#1A1F36' }}>Insights & Recommendations</span>
                </div>
                <div style={{ padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {INSIGHTS.map((ins, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <div style={{ width: 24, height: 24, borderRadius: 7, background: ins.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <ins.Icon size={11} style={{ color: ins.color }} />
                      </div>
                      <p style={{ fontSize: 9, color: '#6B7280', lineHeight: 1.5, flex: 1 }}>{ins.text}</p>
                    </div>
                  ))}
                  <button style={{ marginTop: 4, fontSize: 9, color: '#0077C8', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                    View Full AI Insights <ExternalLink size={9} />
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom spacer */}
          <div style={{ height: 8, flexShrink: 0 }} />
        </div>
      </div>
    </div>
  );
}

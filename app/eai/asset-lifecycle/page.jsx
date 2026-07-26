'use client';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Search, Filter, Download, Plus, ChevronDown, ChevronUp, Home, ChevronLeft, ChevronRight,
  Package, Activity, Wrench, AlertTriangle, CheckCircle, XCircle, Archive,
  Columns3, ExternalLink,
  AlertCircle, Lightbulb, Thermometer, Cpu,
  FileSpreadsheet, FileText, FileDown, UploadCloud, ClipboardList, QrCode,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip as RTooltip } from 'recharts';

import {
  ASSETS, PORTFOLIO, STAGE_META, STATUS_META,
  CATEGORIES, LIFECYCLE_STAGES, STATUSES, AGE_BUCKETS,
  getLifecycleStats, getAgeProfileData, buildAssetTimeline,
} from '@/data/eaiAssetLifecycleMock';

import DonutChart        from '@/components/eai/widgets/DonutChart';
import GaugeChart        from '@/components/eai/widgets/GaugeChart';
import HorizontalBarList from '@/components/eai/widgets/HorizontalBarList';
import Stepper           from '@/components/eai/widgets/Stepper';
import QuickActionsMenu  from '@/components/eai/widgets/QuickActionsMenu';
import DetailDrawer, { DrawerTable, DrawerStatRow, DrawerPill } from '@/components/eai/widgets/DetailDrawer';
import FilterPopover      from '@/components/eai/widgets/FilterPopover';
import { useToast }       from '@/components/eai/widgets/Toast';

// ─── Design tokens ────────────────────────────────────────────────────────────
const BG    = '#F4F6F9';
const CARD  = '#FFFFFF';
const BORD  = '#E2E8F0';
const DIM   = '#6B7280';
const DIMMER = '#9CA3AF';
const PER_PAGE = 8;
const LABEL_STYLE = { fontSize: 9, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' };
const INPUT_STYLE = { fontSize: 11, padding: '8px 10px', border: `1px solid ${BORD}`, borderRadius: 8, color: '#1A1F36', fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box' };

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

const SORT_FIELD = { asset: 'assetName', category: 'category', stage: 'lifecycleStage', status: 'status', location: 'location', age: 'ageYears' };
const COLUMNS = [
  { key: 'assetId',   label: 'Asset ID' },
  { key: 'assetName', label: 'Asset Name', sortKey: 'asset' },
  { key: 'category',  label: 'Category',   sortKey: 'category' },
  { key: 'vendor',    label: 'Vendor' },
  { key: 'model',     label: 'Model' },
  { key: 'location',  label: 'Location', sortKey: 'location' },
  { key: 'status',    label: 'Status',   sortKey: 'status' },
  { key: 'stage',     label: 'Lifecycle Stage', sortKey: 'stage' },
  { key: 'age',       label: 'Age', sortKey: 'age' },
  { key: 'milestone', label: 'Next Milestone' },
  { key: 'risk',      label: 'Risk Score' },
];

const STAGE_TO_STATUS = {
  'In Use': 'Operational', 'Maintenance': 'Maintenance', 'Repair': 'Repair',
  'Ready for Deployment': 'Ready', 'End of Life': 'EOL', 'Retired': 'EOL', 'Discover': 'Operational',
};

function ageBucketOf(ageYears) {
  if (ageYears < 1) return AGE_BUCKETS[0];
  if (ageYears < 3) return AGE_BUCKETS[1];
  if (ageYears < 5) return AGE_BUCKETS[2];
  if (ageYears < 7) return AGE_BUCKETS[3];
  if (ageYears < 10) return AGE_BUCKETS[4];
  return AGE_BUCKETS[5];
}

function nextAssetId(list) {
  const nums = list.map(a => parseInt(a.assetId.replace('AST-', ''), 10)).filter(n => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 1245;
  return `AST-${String(max + 1).padStart(7, '0')}`;
}

function formatAnchorDate(daysOffset) {
  const d = new Date('2026-07-05');
  d.setDate(d.getDate() + daysOffset);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── export helpers ──────────────────────────────────────────────────────────
async function exportWorkbook(sheets, filename) {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();
  sheets.forEach(({ name, rows }) => {
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
  });
  XLSX.writeFile(wb, filename);
}

async function exportCsv(rows, filename) {
  const XLSX = await import('xlsx');
  const ws = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function exportPanelPdf(el, filename) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
  const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#FFFFFF' });
  const imgData = canvas.toDataURL('image/png');
  const pxToMm = 0.264583 / 2;
  const w = canvas.width * pxToMm;
  const h = canvas.height * pxToMm;
  const doc = new jsPDF({ orientation: w > h ? 'landscape' : 'portrait', unit: 'mm', format: [w, h] });
  doc.addImage(imgData, 'PNG', 0, 0, w, h);
  doc.save(filename);
}

function parseAssetsFile(rows, seedList) {
  let maxNum = Math.max(1245, ...seedList.map(a => parseInt(a.assetId.replace('AST-', ''), 10) || 0));
  const norm = row => {
    const map = {};
    Object.keys(row).forEach(k => { map[k.trim().toLowerCase().replace(/[\s_]+/g, '')] = String(row[k] ?? '').trim(); });
    return map;
  };
  const pick = (m, keys) => { for (const k of keys) { if (m[k]) return m[k]; } return ''; };

  return rows.map((row, i) => {
    const m = norm(row);
    const stageRaw = pick(m, ['lifecyclestage', 'stage']);
    const lifecycleStage = LIFECYCLE_STAGES.includes(stageRaw) ? stageRaw : 'Discover';
    const category = CATEGORIES.includes(pick(m, ['category'])) ? pick(m, ['category']) : 'Server';
    const assetName = pick(m, ['assetname', 'name']) || `Imported Asset ${i + 1}`;
    const vendor = pick(m, ['vendor']) || 'Unknown';
    const model = pick(m, ['model']) || 'Unknown';
    const location = pick(m, ['location']) || 'Unassigned';
    const serialNumber = pick(m, ['serialnumber', 'serial']) || `SN-IMP-${Date.now()}-${i}`;
    maxNum += 1;
    return {
      assetId: `AST-${String(maxNum).padStart(7, '0')}`,
      assetName, category, vendor, model, location,
      status: STAGE_TO_STATUS[lifecycleStage] ?? 'Operational',
      lifecycleStage, ageYears: 0,
      nextMilestone: { label: 'Initial Inspection', date: formatAnchorDate(30) },
      riskScore: 10, serialNumber,
    };
  });
}

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

function DropBtn({ children, style, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className="eai-focusable"
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        background: active ? '#EEF2F7' : '#F8FAFC', border: `1px solid ${BORD}`,
        borderRadius: 7, padding: '4px 9px', cursor: 'pointer',
        color: DIM, fontSize: 9, ...style,
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#EEF2F7'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = '#F8FAFC'; }}
    >{children}</button>
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

function StagePipelineCard({ label, sub, Icon, color, count, pct, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="eai-focusable"
      style={{
        background: active ? `${color}18` : CARD,
        border: `1px solid ${active ? color + '44' : BORD}`,
        borderRadius: 12, padding: '10px 12px',
        display: 'flex', flexDirection: 'column', gap: 4,
        cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
        minWidth: 0, overflow: 'hidden',
        boxShadow: active ? 'inset 0 0 0 1px ' + color + '30' : '0 1px 2px rgba(16, 24, 40, 0.04)',
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

function Field({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={LABEL_STYLE}>{label}</span>
      {children}
    </label>
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

// ─── drawer-body forms ────────────────────────────────────────────────────────
function AddAssetForm({ onSubmit, categories, stages }) {
  const [assetName, setAssetName] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [vendor, setVendor] = useState('');
  const [model, setModel] = useState('');
  const [location, setLocation] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [stage, setStage] = useState('Discover');

  const valid = assetName.trim() && vendor.trim() && model.trim() && location.trim();

  function submit() {
    if (!valid) return;
    onSubmit({ assetName: assetName.trim(), category, vendor: vendor.trim(), model: model.trim(), location: location.trim(), serialNumber: serialNumber.trim(), stage });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Field label="Asset Name"><input value={assetName} onChange={e => setAssetName(e.target.value)} placeholder="e.g. Server-Dell-05" style={INPUT_STYLE} /></Field>
      <Field label="Category">
        <select value={category} onChange={e => setCategory(e.target.value)} style={INPUT_STYLE}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Vendor"><input value={vendor} onChange={e => setVendor(e.target.value)} placeholder="e.g. Dell" style={INPUT_STYLE} /></Field>
      <Field label="Model"><input value={model} onChange={e => setModel(e.target.value)} placeholder="e.g. PowerEdge R760" style={INPUT_STYLE} /></Field>
      <Field label="Location"><input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Singapore / Bldg A / Fl 2 / Rack A06" style={INPUT_STYLE} /></Field>
      <Field label="Serial Number (optional)"><input value={serialNumber} onChange={e => setSerialNumber(e.target.value)} placeholder="e.g. DL-R760-00001" style={INPUT_STYLE} /></Field>
      <Field label="Initial Stage">
        <select value={stage} onChange={e => setStage(e.target.value)} style={INPUT_STYLE}>
          {stages.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      <button
        type="button" onClick={submit} disabled={!valid} className="eai-focusable"
        style={{
          padding: '9px 0', borderRadius: 8, border: 'none', fontSize: 11, fontWeight: 700,
          cursor: valid ? 'pointer' : 'default',
          background: valid ? '#7C3AED' : '#E2E8F0', color: valid ? '#fff' : '#9CA3AF',
        }}
      >Add Asset</button>
    </div>
  );
}

function BulkImportForm({ onFile }) {
  const [fileName, setFileName] = useState('');
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  async function handleChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setBusy(true);
    await onFile(file);
    setBusy(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div
        onClick={() => inputRef.current?.click()}
        role="button" tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click(); } }}
        className="eai-focusable"
        style={{
          border: '1.5px dashed #CBD5E1', borderRadius: 10, padding: '28px 16px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', background: '#F8FAFC',
        }}
      >
        <UploadCloud size={22} style={{ color: '#7C3AED' }} />
        <p style={{ fontSize: 11, color: '#1A1F36', fontWeight: 600 }}>{fileName || 'Click to choose a CSV or XLSX file'}</p>
        <p style={{ fontSize: 9, color: '#9CA3AF' }}>{busy ? 'Importing…' : 'or drag and drop'}</p>
        <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleChange} style={{ display: 'none' }} />
      </div>
      <div style={{ background: '#F8FAFC', border: `1px solid ${BORD}`, borderRadius: 8, padding: '10px 12px' }}>
        <p style={{ fontSize: 9, fontWeight: 700, color: '#1A1F36', marginBottom: 4 }}>Column Mapping</p>
        <p style={{ fontSize: 9, color: '#6B7280', lineHeight: 1.6 }}>
          Recognized headers: Asset Name, Category, Vendor, Model, Location, Serial Number, Lifecycle Stage.
          Unrecognized columns are ignored; missing fields fall back to sensible defaults.
        </p>
      </div>
    </div>
  );
}

function WorkOrderForm({ asset, onSubmit }) {
  const [priority, setPriority] = useState('Medium');
  const [assignee, setAssignee] = useState('');
  const [description, setDescription] = useState('');

  function submit() {
    if (!description.trim()) return;
    onSubmit({ priority, assignee: assignee.trim(), description: description.trim() });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ background: '#F8FAFC', border: `1px solid ${BORD}`, borderRadius: 8, padding: '8px 10px' }}>
        <p style={{ fontSize: 9, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Asset</p>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#1A1F36' }}>{asset.assetName} <span style={{ color: '#9CA3AF', fontWeight: 400 }}>({asset.assetId})</span></p>
      </div>
      <Field label="Priority">
        <select value={priority} onChange={e => setPriority(e.target.value)} style={INPUT_STYLE}>
          {['Low', 'Medium', 'High', 'Critical'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </Field>
      <Field label="Assignee (optional)"><input value={assignee} onChange={e => setAssignee(e.target.value)} placeholder="e.g. Facilities Team" style={INPUT_STYLE} /></Field>
      <Field label="Description"><textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} style={{ ...INPUT_STYLE, resize: 'vertical' }} /></Field>
      <button
        type="button" onClick={submit} disabled={!description.trim()} className="eai-focusable"
        style={{
          padding: '9px 0', borderRadius: 8, border: 'none', fontSize: 11, fontWeight: 700,
          cursor: description.trim() ? 'pointer' : 'default',
          background: description.trim() ? '#0077C8' : '#E2E8F0', color: description.trim() ? '#fff' : '#9CA3AF',
        }}
      >Create Work Order</button>
    </div>
  );
}

// ─── page (inner — uses useSearchParams, must be wrapped in Suspense) ────────
function AssetLifecycleInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { showToast, ToastHost } = useToast();
  const tableRef = useRef(null);

  const [assets, setAssets] = useState(ASSETS);
  const [selectedAsset, setSelectedAssetState] = useState(() => {
    const id = searchParams.get('assetId');
    return (id && ASSETS.find(a => a.assetId === id)) || ASSETS[0];
  });
  const [searchQ,        setSearchQState]     = useState(() => searchParams.get('q') || '');
  const [stageFilter,    setStageFilterState] = useState(() => searchParams.get('stage') || null);
  const [catFilter,      setCatFilter]      = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter,   setStatusFilter]   = useState('');
  const [vendorFilter,   setVendorFilter]   = useState('');
  const [ageFilter,      setAgeFilter]      = useState('');
  const [page,           setPage]           = useState(1);
  const [sortState,      setSortState]      = useState(null);

  const [drawer, setDrawer] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  const updateURL = useCallback((patch) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') params.delete(k);
      else params.set(k, v);
    });
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  function setSearchQ(v) { setSearchQState(v); updateURL({ q: v }); }
  function setStageFilter(v) { setStageFilterState(v); updateURL({ stage: v }); }
  function selectAsset(asset) { setSelectedAssetState(asset); updateURL({ assetId: asset.assetId }); }
  function handleStageSelect(stage) { setStageFilter(stageFilter === stage ? null : stage); }
  function openDrawer(kind, payload) { setDrawer({ kind, payload }); }
  function closeDrawer() { setDrawer(null); }

  // Bug fix: reset to page 1 whenever ANY filter or search input changes,
  // regardless of which control (dropdown, popover, stage card) changed it.
  useEffect(() => {
    setPage(1);
  }, [searchQ, stageFilter, catFilter, locationFilter, statusFilter, vendorFilter, ageFilter]);

  // Derived data
  const lifecycleStats = useMemo(() => getLifecycleStats(), []);
  const ageProfileData = useMemo(() => getAgeProfileData(), []);
  const timeline       = useMemo(() => buildAssetTimeline(selectedAsset), [selectedAsset]);

  const pCounts = PORTFOLIO.byStage;
  const pTotal  = PORTFOLIO.total;

  const vendors   = useMemo(() => [...new Set(assets.map(a => a.vendor))].sort(), [assets]);
  const locations = useMemo(() => [...new Set(assets.map(a => a.location.split('/')[0].trim()))].sort(), [assets]);

  // Table filtering — bug fix: `locationFilter` is now included in the deps
  // array below, so the Location dropdown actually recomputes the table.
  const filtered = useMemo(() => {
    const q = searchQ.toLowerCase();
    return assets.filter(a => {
      if (q && !`${a.assetId} ${a.assetName} ${a.vendor} ${a.model} ${a.location}`.toLowerCase().includes(q)) return false;
      if (stageFilter && a.lifecycleStage !== stageFilter) return false;
      if (catFilter      && a.category                           !== catFilter)      return false;
      if (locationFilter && !a.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;
      if (statusFilter   && a.status                            !== statusFilter)   return false;
      if (vendorFilter   && a.vendor                            !== vendorFilter)   return false;
      if (ageFilter       && ageBucketOf(a.ageYears)              !== ageFilter)      return false;
      return true;
    });
  }, [assets, searchQ, stageFilter, catFilter, locationFilter, statusFilter, vendorFilter, ageFilter]);

  const sorted = useMemo(() => {
    if (!sortState) return filtered;
    const field = SORT_FIELD[sortState.key];
    const mult = sortState.dir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = a[field], bv = b[field];
      if (typeof av === 'number') return (av - bv) * mult;
      return String(av).localeCompare(String(bv)) * mult;
    });
  }, [filtered, sortState]);

  function handleSort(key) {
    setSortState(prev => (prev && prev.key === key) ? (prev.dir === 'asc' ? { key, dir: 'desc' } : null) : { key, dir: 'asc' });
  }

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const pageData   = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Stage counts from actual ASSETS for sidebar badges
  const stageCounts = lifecycleStats.counts;

  // ─── Filters popover ─────────────────────────────────────────────────────
  const FILTER_GROUPS = useMemo(() => [
    { key: 'category', label: 'Category',         options: CATEGORIES,       single: true },
    { key: 'location', label: 'Location',          options: locations,        single: true },
    { key: 'status',   label: 'Status',            options: STATUSES,         single: true },
    { key: 'vendor',   label: 'Vendor',            options: vendors,          single: true },
    { key: 'stage',    label: 'Lifecycle Stage',   options: LIFECYCLE_STAGES, single: true },
    { key: 'age',      label: 'Asset Age',         options: AGE_BUCKETS,      single: true },
  ], [locations, vendors]);

  const filterSelected = {
    category: catFilter ? [catFilter] : [],
    location: locationFilter ? [locationFilter] : [],
    status: statusFilter ? [statusFilter] : [],
    vendor: vendorFilter ? [vendorFilter] : [],
    stage: stageFilter ? [stageFilter] : [],
    age: ageFilter ? [ageFilter] : [],
  };
  const activeFilterCount = Object.values(filterSelected).reduce((n, arr) => n + arr.length, 0);

  function handleFilterToggle(groupKey, value) {
    switch (groupKey) {
      case 'category': setCatFilter(v => (v === value ? '' : value)); break;
      case 'location': setLocationFilter(v => (v === value ? '' : value)); break;
      case 'status':   setStatusFilter(v => (v === value ? '' : value)); break;
      case 'vendor':   setVendorFilter(v => (v === value ? '' : value)); break;
      case 'stage':    handleStageSelect(value); break;
      case 'age':      setAgeFilter(v => (v === value ? '' : value)); break;
      default: break;
    }
  }

  function clearAllFilters() {
    setCatFilter(''); setLocationFilter(''); setStatusFilter(''); setVendorFilter(''); setAgeFilter('');
    setStageFilter(null);
    showToast('Filters cleared', 'info');
  }

  // ─── Add / import / work order actions ──────────────────────────────────
  function addAsset(data) {
    const id = nextAssetId(assets);
    const asset = {
      assetId: id,
      assetName: data.assetName,
      category: data.category,
      vendor: data.vendor,
      model: data.model,
      location: data.location,
      status: STAGE_TO_STATUS[data.stage] ?? 'Operational',
      lifecycleStage: data.stage,
      ageYears: 0,
      nextMilestone: { label: 'Initial Inspection', date: formatAnchorDate(30) },
      riskScore: 8,
      serialNumber: data.serialNumber || `SN-${id.replace('AST-', '')}`,
    };
    setAssets(prev => [asset, ...prev]);
    selectAsset(asset);
    closeDrawer();
    showToast(`${asset.assetName} added to the asset registry`, 'success');
  }

  async function handleBulkImportFile(file) {
    try {
      const XLSX = await import('xlsx');
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      if (!rows.length) { showToast('No rows found in that file', 'error'); return; }
      const imported = parseAssetsFile(rows, assets);
      setAssets(prev => [...imported, ...prev]);
      showToast(`Imported ${imported.length} assets`, 'success');
      closeDrawer();
    } catch {
      showToast('Import failed — check the file format', 'error');
    }
  }

  function submitWorkOrder(asset, data) {
    showToast(`Work order created for ${asset.assetName} (${data.priority} priority)`, 'success');
    closeDrawer();
  }

  // ─── Export ──────────────────────────────────────────────────────────────
  async function handleExport(kind) {
    setExportOpen(false);
    const dateStr = new Date().toISOString().slice(0, 10);
    try {
      if (kind === 'pdf') {
        if (!tableRef.current) return;
        await exportPanelPdf(tableRef.current, `eai-assets-${dateStr}.pdf`);
        showToast('PDF exported successfully', 'success');
        return;
      }
      const rows = sorted.map(a => ({
        'Asset ID': a.assetId, 'Asset Name': a.assetName, Category: a.category, Vendor: a.vendor,
        Model: a.model, Location: a.location, Status: a.status, 'Lifecycle Stage': a.lifecycleStage,
        'Age (yrs)': a.ageYears, 'Next Milestone': a.nextMilestone.label, 'Milestone Date': a.nextMilestone.date,
        'Risk Score': a.riskScore,
      }));
      if (kind === 'xlsx') await exportWorkbook([{ name: 'Assets', rows }], `eai-assets-export-${dateStr}.xlsx`);
      else await exportCsv(rows, `eai-assets-export-${dateStr}.csv`);
      showToast(`${kind.toUpperCase()} exported successfully (${rows.length} assets)`, 'success');
    } catch {
      showToast('Export failed — please try again', 'error');
    }
  }

  const TH = { fontSize: 9, fontWeight: 700, color: DIMMER, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '8px 10px', whiteSpace: 'nowrap' };
  const TD = { fontSize: 10, color: '#1A1F36', padding: '9px 10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 0 };

  // ─── drawer content ──────────────────────────────────────────────────────
  function renderDrawer() {
    if (!drawer) return <DetailDrawer open={false} onClose={closeDrawer} />;
    const { kind, payload } = drawer;

    if (kind === 'asset-full') {
      const asset = payload;
      const fullTimeline = buildAssetTimeline(asset);
      const maintenanceEvents = fullTimeline.filter(s => s.label === 'Maintenance');
      const statusColor = STATUS_META[asset.status]?.color ?? '#6B7280';
      return (
        <DetailDrawer
          open title={asset.assetName} subtitle={`${asset.assetId} · ${asset.status}`}
          icon={<Package size={16} color={statusColor} />} accentColor={statusColor} width={480} onClose={closeDrawer}
          footer={
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => openDrawer('work-order', asset)} className="eai-focusable" style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', background: '#0077C8', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Create Work Order</button>
              <button onClick={() => router.push('/eai/real-estate-explorer')} className="eai-focusable" style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: `1px solid ${BORD}`, background: '#F8FAFC', color: '#1A1F36', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>View in Real Estate Explorer</button>
            </div>
          }
        >
          <DrawerStatRow items={[
            { label: 'Category', value: asset.category },
            { label: 'Status', value: asset.status, color: statusColor },
            { label: 'Stage', value: asset.lifecycleStage },
            { label: 'Age', value: `${asset.ageYears} yrs` },
            { label: 'Risk Score', value: asset.riskScore },
          ]} />
          <p style={{ fontSize: 10, fontWeight: 700, color: '#1A1F36', marginBottom: 8 }}>Full Timeline</p>
          <div style={{ marginBottom: 16 }}><Stepper stages={fullTimeline} /></div>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#1A1F36', marginBottom: 8 }}>Specifications</p>
          <DrawerTable columns={[{ key: 'field', label: 'Field' }, { key: 'val', label: 'Value', align: 'right' }]} rows={[
            { field: 'Vendor', val: asset.vendor },
            { field: 'Model', val: asset.model },
            { field: 'Serial Number', val: asset.serialNumber },
            { field: 'Location', val: asset.location },
            { field: 'Next Milestone', val: `${asset.nextMilestone.label} — ${asset.nextMilestone.date}` },
          ]} keyField="field" />
          {maintenanceEvents.length > 0 && (
            <>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#1A1F36', margin: '16px 0 8px' }}>Maintenance History</p>
              <DrawerTable columns={[{ key: 'label', label: 'Event' }, { key: 'date', label: 'Date', align: 'right' }]} rows={maintenanceEvents} keyField="date" />
            </>
          )}
        </DetailDrawer>
      );
    }

    if (kind === 'milestones-all') {
      return (
        <DetailDrawer open title="Upcoming Milestones" subtitle={`${MILESTONES.length} categories`} icon={<AlertCircle size={16} color="#F59E0B" />} accentColor="#F59E0B" onClose={closeDrawer}>
          <DrawerTable columns={[
            { key: 'label', label: 'Milestone' },
            { key: 'count', label: 'Count', align: 'right' },
          ]} rows={MILESTONES} keyField="label" />
        </DetailDrawer>
      );
    }

    if (kind === 'insights-all') {
      return (
        <DetailDrawer
          open title="AI Insights & Recommendations" subtitle={`${INSIGHTS.length} insights`}
          icon={<Lightbulb size={16} color="#0077C8" />} accentColor="#0077C8" onClose={closeDrawer}
          footer={
            <button onClick={() => showToast('Analysis refreshed — no new insights at this time', 'info')} className="eai-focusable" style={{ width: '100%', padding: '9px 0', borderRadius: 8, border: 'none', background: '#0077C8', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
              Run Analysis
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {INSIGHTS.map((ins, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', background: '#F8FAFC', border: `1px solid ${BORD}`, borderRadius: 10 }}>
                <div style={{ width: 24, height: 24, borderRadius: 7, background: ins.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ins.Icon size={12} style={{ color: ins.color }} />
                </div>
                <p style={{ fontSize: 11, color: '#1A1F36', lineHeight: 1.6 }}>{ins.text}</p>
              </div>
            ))}
          </div>
        </DetailDrawer>
      );
    }

    if (kind === 'risk-analysis') {
      return (
        <DetailDrawer open title="Lifecycle Risk Analysis" subtitle="Portfolio-wide risk factors" icon={<AlertTriangle size={16} color="#EF4444" />} accentColor="#EF4444" onClose={closeDrawer}>
          <DrawerTable columns={[
            { key: 'label', label: 'Risk Factor' },
            { key: 'score', label: 'Score', align: 'right', render: r => <DrawerPill label={`${r.score}/100`} color={r.score >= 70 ? '#EF4444' : r.score >= 40 ? '#F59E0B' : '#00A36C'} /> },
          ]} rows={RISK_FACTORS} keyField="label" />
        </DetailDrawer>
      );
    }

    if (kind === 'qr') {
      const asset = payload;
      const assetUrl = typeof window !== 'undefined' ? `${window.location.origin}/eai/asset-lifecycle?assetId=${asset.assetId}` : `/eai/asset-lifecycle?assetId=${asset.assetId}`;
      return (
        <DetailDrawer open title="Asset QR Reference" subtitle={asset.assetId} icon={<QrCode size={16} color="#0077C8" />} accentColor="#0077C8" onClose={closeDrawer}>
          <DrawerStatRow items={[{ label: 'Asset ID', value: asset.assetId }, { label: 'Asset Name', value: asset.assetName }]} />
          <p style={{ fontSize: 10, fontWeight: 700, color: '#1A1F36', marginBottom: 6 }}>Direct Link</p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#F8FAFC', border: `1px solid ${BORD}`, borderRadius: 8, padding: '8px 10px' }}>
            <span style={{ fontSize: 10, color: '#6B7280', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'ui-monospace,monospace' }}>{assetUrl}</span>
            <button
              onClick={() => { navigator.clipboard?.writeText(assetUrl); showToast('Link copied to clipboard', 'success'); }}
              className="eai-focusable"
              style={{ fontSize: 9, fontWeight: 700, color: '#0077C8', background: 'transparent', border: '1px solid rgba(0,119,200,0.3)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', flexShrink: 0 }}
            >Copy</button>
          </div>
          <p style={{ fontSize: 10, color: '#9CA3AF', marginTop: 10, lineHeight: 1.5 }}>Scan the printed asset tag or share this link to open this asset's record directly.</p>
        </DetailDrawer>
      );
    }

    if (kind === 'add-asset') {
      return (
        <DetailDrawer open title="Add Asset" subtitle="Asset Lifecycle" icon={<Plus size={16} color="#7C3AED" />} accentColor="#7C3AED" onClose={closeDrawer}>
          <AddAssetForm onSubmit={addAsset} categories={CATEGORIES} stages={LIFECYCLE_STAGES} />
        </DetailDrawer>
      );
    }

    if (kind === 'bulk-import') {
      return (
        <DetailDrawer open title="Bulk Import Assets" subtitle="CSV / XLSX" icon={<UploadCloud size={16} color="#7C3AED" />} accentColor="#7C3AED" onClose={closeDrawer}>
          <BulkImportForm onFile={handleBulkImportFile} />
        </DetailDrawer>
      );
    }

    if (kind === 'work-order') {
      const asset = payload;
      return (
        <DetailDrawer open title="Create Work Order" subtitle={`${asset.assetName} · ${asset.assetId}`} icon={<ClipboardList size={16} color="#0077C8" />} accentColor="#0077C8" onClose={closeDrawer}>
          <WorkOrderForm asset={asset} onSubmit={data => submitWorkOrder(asset, data)} />
        </DetailDrawer>
      );
    }

    return <DetailDrawer open={false} onClose={closeDrawer} />;
  }

  return (
    <div style={{ height: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: BG }}>
      <style>{`
        .eai-focusable:focus-visible { outline: 2px solid #0077C8; outline-offset: 2px; border-radius: 4px; }
      `}</style>

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
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Search assets, serial no, model, vendor, or location..."
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#1A1F36', fontSize: 11 }}
            />
            <span style={{ fontSize: 9, color: DIMMER, flexShrink: 0 }}>⌘ K</span>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <DropBtn active={filtersOpen} onClick={() => { setFiltersOpen(o => !o); setExportOpen(false); setAddMenuOpen(false); }}>
              <Filter size={11} /> Filters
              {activeFilterCount > 0 && (
                <span style={{ fontSize: 8, fontWeight: 700, background: '#0077C8', color: '#fff', borderRadius: 20, padding: '1px 5px', marginLeft: 2 }}>{activeFilterCount}</span>
              )}
            </DropBtn>
            <FilterPopover open={filtersOpen} onClose={() => setFiltersOpen(false)} groups={FILTER_GROUPS} selected={filterSelected} onToggle={handleFilterToggle} onClear={clearAllFilters} />
          </div>

          <div style={{ position: 'relative' }}>
            <DropBtn active={exportOpen} onClick={() => { setExportOpen(o => !o); setFiltersOpen(false); setAddMenuOpen(false); }}>
              <Download size={11} /> Export <ChevronDown size={9} />
            </DropBtn>
            {exportOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 400, width: 190, background: '#fff', border: `1px solid ${BORD}`, borderRadius: 10, boxShadow: '0 8px 24px rgba(16,24,40,0.12)', overflow: 'hidden' }}>
                {[
                  { key: 'csv',  label: 'Export view (CSV)',  Icon: FileDown },
                  { key: 'xlsx', label: 'Export view (XLSX)', Icon: FileSpreadsheet },
                  { key: 'pdf',  label: 'Export PDF',         Icon: FileText },
                ].map(({ key, label, Icon }) => (
                  <button
                    key={key} type="button" onClick={() => handleExport(key)} className="eai-focusable"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#374151', fontSize: 11 }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Icon size={12} style={{ color: '#0077C8' }} /> {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { setAddMenuOpen(o => !o); setFiltersOpen(false); setExportOpen(false); }}
              className="eai-focusable"
              style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px 6px 10px',
                background: '#7C3AED', border: '1px solid #8B5CF6', borderRadius: 8,
                color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer',
              }}
            >
              <Plus size={13} /> Add Asset <ChevronDown size={10} style={{ opacity: 0.7, transform: addMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
            </button>
            {addMenuOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 400, width: 170, background: '#fff', border: `1px solid ${BORD}`, borderRadius: 10, boxShadow: '0 8px 24px rgba(16,24,40,0.12)', overflow: 'hidden' }}>
                <button
                  type="button" onClick={() => { setAddMenuOpen(false); openDrawer('add-asset'); }} className="eai-focusable"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#374151', fontSize: 11 }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Plus size={12} style={{ color: '#7C3AED' }} /> Add Asset
                </button>
                <button
                  type="button" onClick={() => { setAddMenuOpen(false); openDrawer('bulk-import'); }} className="eai-focusable"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#374151', fontSize: 11 }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <UploadCloud size={12} style={{ color: '#7C3AED' }} /> Bulk Import
                </button>
              </div>
            )}
          </div>

          <QuickActionsMenu items={[
            { iconKey: 'Plus',         label: 'Add New Asset',      onClick: () => openDrawer('add-asset') },
            { iconKey: 'Upload',       label: 'Bulk Import Assets', onClick: () => openDrawer('bulk-import') },
            { iconKey: 'ClipboardList',label: 'Create Work Order',  onClick: () => openDrawer('work-order', selectedAsset) },
            { iconKey: 'BarChart2',    label: 'Generate Report',    onClick: () => setExportOpen(true) },
            { iconKey: 'Download',     label: 'Export Data',        onClick: () => setExportOpen(true) },
          ]} />
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Main scroll area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>

          {/* ── Pipeline strip (8 stage cards) ──────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: DIM, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Lifecycle Pipeline</span>
            <button
              type="button" onClick={() => openDrawer('add-asset')} className="eai-focusable"
              style={{
                display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, fontWeight: 700, color: '#7C3AED',
                background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 7,
                padding: '4px 9px', cursor: 'pointer',
              }}
            >
              <Plus size={10} /> Add Asset
            </button>
          </div>
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
              <button
                onClick={() => openDrawer('risk-analysis')}
                className="eai-focusable"
                style={{ marginTop: 10, fontSize: 9, color: '#0077C8', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
              >
                View Risk Analysis <ExternalLink size={9} />
              </button>
            </Card>
          </div>

          {/* ── Asset Lifecycle Tracker ──────────────────────────────────── */}
          <div ref={tableRef} style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 14, overflow: 'hidden' }}>
            {/* Tracker header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: `1px solid ${BORD}`, gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#1A1F36', flexShrink: 0 }}>Asset Lifecycle Tracker</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, flexWrap: 'wrap', minWidth: 0 }}>
                {/* In-table search */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F8FAFC', border: `1px solid ${BORD}`, borderRadius: 7, padding: '4px 10px', minWidth: 160 }}>
                  <Search size={10} style={{ color: DIM, flexShrink: 0 }} />
                  <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                    placeholder="Search assets..."
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#1A1F36', fontSize: 10, minWidth: 0 }} />
                </div>
                {/* Filter dropdowns */}
                {[
                  { label: 'All Categories', value: catFilter,      set: setCatFilter,      opts: CATEGORIES },
                  { label: 'All Locations',  value: locationFilter, set: setLocationFilter, opts: locations },
                  { label: 'All Statuses',   value: statusFilter,   set: setStatusFilter,   opts: STATUSES },
                  { label: 'All Vendors',    value: vendorFilter,   set: setVendorFilter,   opts: vendors },
                ].map(f => (
                  <select key={f.label}
                    value={f.value}
                    onChange={e => f.set(e.target.value)}
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
                    {COLUMNS.map(col => (
                      <th key={col.key} style={{ ...TH, textAlign: 'left' }}>
                        {col.sortKey ? (
                          <button
                            type="button" onClick={() => handleSort(col.sortKey)} className="eai-focusable"
                            aria-label={`Sort by ${col.label}`}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 2, border: 'none', background: 'transparent',
                              cursor: 'pointer', padding: 0, fontSize: 9, fontWeight: 700,
                              color: sortState?.key === col.sortKey ? '#0077C8' : DIMMER,
                              textTransform: 'uppercase', letterSpacing: '0.07em',
                            }}
                          >
                            {col.label}
                            {sortState?.key === col.sortKey ? (sortState.dir === 'asc' ? <ChevronUp size={9} /> : <ChevronDown size={9} />) : null}
                          </button>
                        ) : col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageData.map(asset => {
                    const isSel = asset.assetId === selectedAsset.assetId;
                    return (
                      <tr
                        key={asset.assetId}
                        onClick={() => selectAsset(asset)}
                        onDoubleClick={() => openDrawer('asset-full', asset)}
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
                Showing {Math.min((page - 1) * PER_PAGE + 1, sorted.length)}–{Math.min(page * PER_PAGE, sorted.length)} of {sorted.length} assets
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
                <button
                  onClick={() => openDrawer('asset-full', selectedAsset)}
                  className="eai-focusable"
                  style={{ fontSize: 9, color: '#0077C8', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                >
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
                    {/* QR block — click opens the asset's direct-link reference */}
                    <button
                      type="button"
                      onClick={() => openDrawer('qr', selectedAsset)}
                      aria-label="View asset QR reference"
                      className="eai-focusable"
                      style={{ marginTop: 4, width: 52, height: 52, background: '#fff', border: `1px solid ${BORD}`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#0077C8'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = BORD}
                    >
                      <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #111 25%, transparent 25%, transparent 75%, #111 75%)', backgroundSize: '6px 6px' }} />
                    </button>
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
                  <button onClick={() => openDrawer('milestones-all')} className="eai-focusable" style={{ fontSize: 9, color: DIMMER, background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
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
                  <button
                    onClick={() => openDrawer('insights-all')}
                    className="eai-focusable"
                    style={{ marginTop: 4, fontSize: 9, color: '#0077C8', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
                  >
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

      {renderDrawer()}
      <ToastHost />
    </div>
  );
}

export default function AssetLifecyclePage() {
  return (
    <Suspense fallback={
      <div style={{ height: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F6F9', color: '#9CA3AF', fontSize: 12 }}>
        Loading…
      </div>
    }>
      <AssetLifecycleInner />
    </Suspense>
  );
}

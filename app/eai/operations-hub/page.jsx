'use client';
import { Suspense, useCallback, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Filter, Download, ChevronDown, Plus, AlertOctagon, CalendarDays, Users,
  Wrench, ShieldAlert, Building2, Activity, Timer, Layers, Zap, Droplets,
  CheckCircle2, Circle, FileText, FileSpreadsheet, FileDown,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

import KpiCard          from '@/components/eai/widgets/KpiCard';
import DonutChart       from '@/components/eai/widgets/DonutChart';
import TrendChart       from '@/components/eai/widgets/TrendChart';
import DataTable        from '@/components/eai/widgets/DataTable';
import ListCard         from '@/components/eai/widgets/ListCard';
import CalendarListCard from '@/components/eai/widgets/CalendarListCard';
import QuickActionsMenu from '@/components/eai/widgets/QuickActionsMenu';
import DetailDrawer, { DrawerTable, DrawerStatRow, DrawerPill } from '@/components/eai/widgets/DetailDrawer';
import FilterPopover     from '@/components/eai/widgets/FilterPopover';
import { useToast }      from '@/components/eai/widgets/Toast';

import {
  PORTFOLIO,
  INCIDENTS_BY_SEVERITY, WORK_ORDERS_BY_STATUS,
  INCIDENTS_TREND, ACTIVE_ALERTS, MAINTENANCE_CALENDAR,
  SLA_COMPLIANCE, MTTR_TREND, ASSETS_HEALTH, OPERATIONAL_TASKS,
  WORK_ORDERS, getWoTabTotal,
} from '@/data/eaiOperationsMock';

// ─── Shared card styles ────────────────────────────────────────────────────────
const CARD = {
  background: '#FFFFFF',
  border: '1px solid #E2E8F0',
  borderRadius: 12,
  overflow: 'hidden',
  boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)',
};
const CARD_HDR = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '10px 14px',
  borderBottom: '1px solid #E2E8F0',
};
const CARD_TITLE = { fontSize: 11, fontWeight: 700, color: '#1A1F36', letterSpacing: '-0.01em' };
const LINK_STYLE = { fontSize: 9, color: '#0077C8', textDecoration: 'none', fontWeight: 600 };
const LINK_BTN_STYLE = { ...LINK_STYLE, background: 'none', border: 'none', cursor: 'pointer', padding: 0 };
const DROPDOWN_BTN = {
  display: 'flex', alignItems: 'center', gap: 3,
  fontSize: 9, color: '#6B7280',
  background: '#F8FAFC', border: '1px solid #E2E8F0',
  borderRadius: 6, padding: '3px 8px', cursor: 'pointer',
};
const LABEL_STYLE = { fontSize: 9, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' };
const INPUT_STYLE = { fontSize: 11, padding: '8px 10px', border: '1px solid #E2E8F0', borderRadius: 8, color: '#1A1F36', fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box' };

// ─── Work Orders table config ──────────────────────────────────────────────────
const PRIORITY_STYLE = {
  Critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.30)'   },
  High:     { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.30)'  },
  Medium:   { color: '#3B82F6', bg: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.30)'  },
  Low:      { color: '#10B981', bg: 'rgba(16,185,129,0.15)',  border: 'rgba(16,185,129,0.30)'  },
};
const STATUS_STYLE = {
  'In Progress': { color: '#0077C8', bg: 'rgba(0,119,200,0.15)',   border: 'rgba(0,119,200,0.25)'   },
  'Planned':     { color: '#10B981', bg: 'rgba(16,185,129,0.15)',  border: 'rgba(16,185,129,0.25)'  },
  'On Hold':     { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.25)'  },
  'Completed':   { color: '#6B7280', bg: 'rgba(107,114,128,0.15)', border: 'rgba(107,114,128,0.25)' },
  'Cancelled':   { color: '#EF4444', bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.25)'   },
};
const PRIORITY_RANK = { Critical: 0, High: 1, Medium: 2, Low: 3 };
const KPI_ICONS = { shieldAlert: ShieldAlert, layers: Layers, timer: Timer, building: Building2, activity: Activity, zap: Zap, droplets: Droplets };

function StatusPill({ v, map }) {
  const s = map[v] ?? {};
  return (
    <span style={{
      fontSize: 8, fontWeight: 700, padding: '2px 7px', borderRadius: 5, whiteSpace: 'nowrap',
      color: s.color, background: s.bg, border: `1px solid ${s.border}`,
    }}>
      {v}
    </span>
  );
}

const WO_COLUMNS = [
  { key: 'woId',      label: 'WO ID',           width: 96, sortable: true },
  { key: 'title',     label: 'Title', sortable: true },
  { key: 'type',      label: 'Type',             width: 80, sortable: true,
    render: v => <span style={{ fontSize: 9, color: '#6B7280' }}>{v}</span> },
  { key: 'asset',     label: 'Asset / Location', width: 136, sortable: true,
    render: (v, row) => (
      <div>
        <p style={{ fontSize: 10, fontWeight: 600, color: '#1A1F36', lineHeight: 1.3 }}>{v}</p>
        <p style={{ fontSize: 8, color: '#6B7280', marginTop: 1 }}>{row.location}</p>
      </div>
    ) },
  { key: 'priority',  label: 'Priority',         width: 72, sortable: true,
    render: v => <StatusPill v={v} map={PRIORITY_STYLE} /> },
  { key: 'status',    label: 'Status',           width: 92, sortable: true,
    render: v => <StatusPill v={v} map={STATUS_STYLE} /> },
  { key: 'assignedTo', label: 'Assigned To',     width: 108, sortable: true,
    render: v => <span style={{ fontSize: 9, color: '#6B7280' }}>{v}</span> },
  { key: 'dueDate',   label: 'Due Date',         width: 92, sortable: true,
    render: v => <span style={{ fontSize: 9, color: '#6B7280' }}>{v}</span> },
  { key: 'slaPct',    label: 'SLA',              width: 82, sortable: true,
    render: v => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: '#E2E8F0', overflow: 'hidden' }}>
          <div style={{
            width: `${v}%`, height: '100%', borderRadius: 2,
            background: v >= 80 ? '#10B981' : v >= 50 ? '#F59E0B' : '#EF4444',
          }} />
        </div>
        <span style={{ fontSize: 9, fontWeight: 700, color: '#1A1F36', width: 26, textAlign: 'right', flexShrink: 0 }}>{v}%</span>
      </div>
    ) },
  { key: '_act',      label: '',                 width: 36, align: 'center',
    render: () => <span style={{ color: '#9CA3AF', fontSize: 14, cursor: 'pointer' }}>···</span> },
];

const WO_TABS = [
  { key: 'all',         label: 'All',         count: PORTFOLIO.openWorkOrders },
  { key: 'in-progress', label: 'In Progress', count: PORTFOLIO.inProgressWOs  },
  { key: 'planned',     label: 'Planned',     count: PORTFOLIO.plannedWOs     },
  { key: 'on-hold',     label: 'On Hold',     count: PORTFOLIO.onHoldWOs      },
  { key: 'overdue',     label: 'Overdue',     count: PORTFOLIO.overdueWOs     },
];

const KPI_DATA = [
  { key: 'openIncidents',  label: 'Open Incidents',      value: PORTFOLIO.openIncidents,     unit: '',     delta: '↑14 vs last month',      up: false, iconKey: 'shieldAlert', color: '#EF4444', bg: 'rgba(239,68,68,0.15)',   seed: 11 },
  { key: 'openWO',         label: 'Open Work Orders',    value: PORTFOLIO.openWorkOrders,    unit: '',     delta: '↑9% vs last month',      up: false, iconKey: 'layers',      color: '#0077C8', bg: 'rgba(0,119,200,0.15)',   seed: 22 },
  { key: 'overdueWO',      label: 'Overdue Work Orders', value: PORTFOLIO.overdueWorkOrders, unit: '',     delta: '↑5 vs last month',       up: false, iconKey: 'timer',       color: '#EF4444', bg: 'rgba(239,68,68,0.15)',   seed: 33 },
  { key: 'assetsDown',     label: 'Assets Down',         value: PORTFOLIO.assetsDown,        unit: '',     delta: '↑6 vs last month',       up: false, iconKey: 'building',    color: '#F59E0B', bg: 'rgba(245,158,11,0.15)',  seed: 44 },
  { key: 'slaPct',         label: 'SLA Compliance',      value: PORTFOLIO.slaPct,            unit: '%',    delta: '↓3.6% vs last month',    up: false, iconKey: 'activity',    color: '#00A36C', bg: 'rgba(0,163,108,0.15)',   seed: 55 },
  { key: 'mttrHrs',        label: 'MTTR (Incidents)',     value: PORTFOLIO.mttrHrs,           unit: ' hrs', delta: '↓0.8 hrs vs last month', up: true,  iconKey: 'zap',         color: '#0077C8', bg: 'rgba(0,119,200,0.15)',   seed: 66 },
  { key: 'maintDue30',     label: 'Maintenance Due 30D', value: PORTFOLIO.maintenanceDue30,  unit: '',     delta: '↑11 vs last month',      up: false, iconKey: 'droplets',    color: '#F59E0B', bg: 'rgba(245,158,11,0.15)',  seed: 77 },
];

// ─── date range presets (Operations Overview donuts) ────────────────────────
const OVERVIEW_RANGE_PRESETS = [
  { key: '7d',  label: '7 Days',  weeks: 1 },
  { key: '14d', label: '14 Days', weeks: 2 },
  { key: '30d', label: '30 Days', weeks: 5 },
];

// ─── trend granularity ───────────────────────────────────────────────────────
const TREND_GRANULARITIES = [
  { key: 'daily',   label: 'Daily' },
  { key: 'weekly',  label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
];

function bucketIncidentsTrend(granularity) {
  if (granularity === 'weekly') {
    const groups = [INCIDENTS_TREND.slice(0, 2), INCIDENTS_TREND.slice(2, 4), INCIDENTS_TREND.slice(4)].filter(g => g.length);
    return groups.map((g, i) => ({
      date: `Wk ${i + 1}`,
      critHigh: g.reduce((s, d) => s + d.critHigh, 0),
      medLow: g.reduce((s, d) => s + d.medLow, 0),
    }));
  }
  if (granularity === 'monthly') {
    return [{
      date: 'May 2025',
      critHigh: INCIDENTS_TREND.reduce((s, d) => s + d.critHigh, 0),
      medLow: INCIDENTS_TREND.reduce((s, d) => s + d.medLow, 0),
    }];
  }
  return INCIDENTS_TREND;
}

// ─── deterministic task synthesis (from OPERATIONAL_TASKS aggregate buckets) ──
const TASK_TEMPLATES = [
  'Review PM backlog', 'Update asset tags', 'Verify sensor calibration', 'Close aged tickets',
  'Audit spare parts inventory', 'Confirm technician schedules', 'Validate SLA exceptions',
  'Reconcile WO cost codes', 'Inspect safety equipment', 'Sync CMMS records',
];
function synthTasks() {
  let idx = 0;
  const tasks = [];
  OPERATIONAL_TASKS.data.forEach(bucket => {
    const n = Math.min(3, Math.max(1, Math.round(bucket.value / 20)));
    for (let i = 0; i < n; i++) {
      tasks.push({ id: `task-${idx}`, label: TASK_TEMPLATES[idx % TASK_TEMPLATES.length], status: bucket.name, color: bucket.color, done: bucket.name === 'Completed' });
      idx++;
    }
  });
  return tasks;
}

function seedAlerts() {
  return ACTIVE_ALERTS.map((a, i) => ({ ...a, id: `alert-${i}`, severity: a.ago.split(' ·')[0], acknowledged: false }));
}
function seedMaintenance() {
  return MAINTENANCE_CALENDAR.map((m, i) => ({ ...m, id: `maint-${i}` }));
}

let woSeq = 200;
function nextWoId() {
  woSeq += 1;
  return `WO-2505-${String(woSeq).padStart(5, '0')}`;
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
  const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#F4F6F9' });
  const imgData = canvas.toDataURL('image/png');
  const pxToMm = 0.264583 / 2;
  const w = canvas.width * pxToMm;
  const h = canvas.height * pxToMm;
  const doc = new jsPDF({ orientation: w > h ? 'landscape' : 'portrait', unit: 'mm', format: [w, h] });
  doc.addImage(imgData, 'PNG', 0, 0, w, h);
  doc.save(filename);
}

// ─── drawer <-> URL param encoding (content-viewing drawers only) ───────────
function drawerToParam(d) {
  if (!d) return undefined;
  switch (d.kind) {
    case 'kpi':              return `kpi:${d.kpi.key}`;
    case 'wo':                return `wo:${d.wo.woId}`;
    case 'alert-detail':      return `alert:${d.alert.id}`;
    case 'alerts-all':        return 'alerts-all';
    case 'maintenance-detail':return `maint:${d.item.id}`;
    case 'maintenance-all':   return 'maintenance-all';
    case 'sla':                return 'sla';
    case 'performance':       return 'performance';
    case 'asset-health':      return 'asset-health';
    case 'tasks':              return 'tasks';
    default: return undefined;
  }
}
function paramToDrawer(param) {
  if (!param) return null;
  if (['alerts-all', 'maintenance-all', 'sla', 'performance', 'asset-health', 'tasks'].includes(param)) return { kind: param };
  const sep = param.indexOf(':');
  if (sep === -1) return null;
  const kind = param.slice(0, sep);
  const id = decodeURIComponent(param.slice(sep + 1));
  switch (kind) {
    case 'kpi':   { const kpi = KPI_DATA.find(k => k.key === id); return kpi ? { kind: 'kpi', kpi } : null; }
    case 'wo':    { const wo = WORK_ORDERS.find(w => w.woId === id); return wo ? { kind: 'wo', wo } : null; }
    case 'alert': { const alert = seedAlerts().find(a => a.id === id); return alert ? { kind: 'alert-detail', alert } : null; }
    case 'maint': { const item = seedMaintenance().find(m => m.id === id); return item ? { kind: 'maintenance-detail', item } : null; }
    default: return null;
  }
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function DonutHalf({ title, data, centerLabel, centerSublabel }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{
        fontSize: 9, fontWeight: 700, color: '#6B7280',
        textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6,
      }}>
        {title}
      </p>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <div style={{ width: 96, flexShrink: 0 }}>
          <DonutChart
            data={data}
            centerLabel={centerLabel}
            centerSublabel={centerSublabel}
            height={96}
            innerRadius={27}
            outerRadius={42}
            showLegend={false}
          />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
          {data.map(item => (
            <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: item.color, flexShrink: 0, display: 'inline-block' }} />
                <span style={{ fontSize: 8, color: '#6B7280', whiteSpace: 'nowrap' }}>{item.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: '#1A1F36', fontFamily: 'monospace' }}>{item.value}</span>
                <span style={{ fontSize: 7, color: '#9CA3AF' }}>({item.pct}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IncidentsTrendChart({ data, height = 165, hideCritHigh, hideMedLow }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
        {[
          { key: 'critHigh', label: 'Critical / High', color: '#EF4444', hidden: hideCritHigh },
          { key: 'medLow',   label: 'Medium / Low',    color: '#0077C8', hidden: hideMedLow },
        ].filter(s => !s.hidden).map(s => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: '#6B7280' }}>
            <span style={{ width: 14, height: 2, background: s.color, display: 'inline-block', borderRadius: 1, flexShrink: 0 }} />
            {s.label}
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 8, fill: '#6B7280' }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 8, fill: '#6B7280' }}
            axisLine={false} tickLine={false}
            width={24} domain={[0, 'auto']}
          />
          <Tooltip
            contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 10, color: '#1A1F36', boxShadow: '0 2px 8px rgba(16,24,40,0.08)' }}
            labelStyle={{ color: '#6B7280' }}
          />
          {!hideCritHigh && <Line type="monotone" dataKey="critHigh" name="Critical / High" stroke="#EF4444" strokeWidth={2} dot={{ r: 3.5, fill: '#EF4444', strokeWidth: 0 }} activeDot={{ r: 5 }} />}
          {!hideMedLow && <Line type="monotone" dataKey="medLow"   name="Medium / Low"    stroke="#0077C8" strokeWidth={2} dot={{ r: 3.5, fill: '#0077C8', strokeWidth: 0 }} activeDot={{ r: 5 }} />}
        </LineChart>
      </ResponsiveContainer>
    </div>
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

// ─── drawer-body forms ────────────────────────────────────────────────────────
function CreateWorkOrderForm({ onSubmit, locations, teams, defaultAsset }) {
  const [title, setTitle] = useState('');
  const [asset, setAsset] = useState(defaultAsset ?? '');
  const [location, setLocation] = useState(locations[0] ?? '');
  const [priority, setPriority] = useState('Medium');
  const [assignedTo, setAssignedTo] = useState(teams[0] ?? '');
  const [dueDate, setDueDate] = useState('');
  const valid = title.trim() && asset.trim() && dueDate;

  function submit() {
    if (!valid) return;
    onSubmit({ title: title.trim(), asset: asset.trim(), location, priority, assignedTo, dueDate: new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Field label="Title"><input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Replace failed fan" style={INPUT_STYLE} /></Field>
      <Field label="Asset"><input value={asset} onChange={e => setAsset(e.target.value)} placeholder="e.g. CRAC-12" style={INPUT_STYLE} /></Field>
      <Field label="Location">
        <select value={location} onChange={e => setLocation(e.target.value)} style={INPUT_STYLE}>{locations.map(l => <option key={l} value={l}>{l}</option>)}</select>
      </Field>
      <Field label="Priority">
        <select value={priority} onChange={e => setPriority(e.target.value)} style={INPUT_STYLE}>{Object.keys(PRIORITY_STYLE).map(p => <option key={p} value={p}>{p}</option>)}</select>
      </Field>
      <Field label="Assignee">
        <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} style={INPUT_STYLE}>{teams.map(t => <option key={t} value={t}>{t}</option>)}</select>
      </Field>
      <Field label="Due Date"><input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={INPUT_STYLE} /></Field>
      <button type="button" onClick={submit} disabled={!valid} className="eai-focusable" style={{ padding: '9px 0', borderRadius: 8, border: 'none', fontSize: 11, fontWeight: 700, cursor: valid ? 'pointer' : 'default', background: valid ? '#0077C8' : '#E2E8F0', color: valid ? '#fff' : '#9CA3AF' }}>Create Work Order</button>
    </div>
  );
}

function ReportIncidentForm({ onSubmit, locations }) {
  const [severity, setSeverity] = useState('High');
  const [facility, setFacility] = useState(locations[0] ?? '');
  const [description, setDescription] = useState('');
  const valid = description.trim().length > 0;

  function submit() {
    if (!valid) return;
    onSubmit({ severity, facility, description: description.trim() });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Field label="Severity">
        <select value={severity} onChange={e => setSeverity(e.target.value)} style={INPUT_STYLE}>{INCIDENTS_BY_SEVERITY.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}</select>
      </Field>
      <Field label="Facility">
        <select value={facility} onChange={e => setFacility(e.target.value)} style={INPUT_STYLE}>{locations.map(l => <option key={l} value={l}>{l}</option>)}</select>
      </Field>
      <Field label="Description"><textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} style={{ ...INPUT_STYLE, resize: 'vertical' }} /></Field>
      <button type="button" onClick={submit} disabled={!valid} className="eai-focusable" style={{ padding: '9px 0', borderRadius: 8, border: 'none', fontSize: 11, fontWeight: 700, cursor: valid ? 'pointer' : 'default', background: valid ? '#EF4444' : '#E2E8F0', color: valid ? '#fff' : '#9CA3AF' }}>Report Incident</button>
    </div>
  );
}

function ScheduleMaintenanceForm({ onSubmit, locations }) {
  const [asset, setAsset] = useState('');
  const [location, setLocation] = useState(locations[0] ?? '');
  const [date, setDate] = useState('');
  const [type, setType] = useState('PM');
  const valid = asset.trim() && date;

  function submit() {
    if (!valid) return;
    onSubmit({ asset: asset.trim(), location, date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), type });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Field label="Asset"><input value={asset} onChange={e => setAsset(e.target.value)} placeholder="e.g. CRAC-12 Preventive Maintenance" style={INPUT_STYLE} /></Field>
      <Field label="Location">
        <select value={location} onChange={e => setLocation(e.target.value)} style={INPUT_STYLE}>{locations.map(l => <option key={l} value={l}>{l}</option>)}</select>
      </Field>
      <Field label="Window"><input type="date" value={date} onChange={e => setDate(e.target.value)} style={INPUT_STYLE} /></Field>
      <Field label="Type">
        <select value={type} onChange={e => setType(e.target.value)} style={INPUT_STYLE}>
          <option value="PM">PM</option>
          <option value="Standard">Standard</option>
        </select>
      </Field>
      <button type="button" onClick={submit} disabled={!valid} className="eai-focusable" style={{ padding: '9px 0', borderRadius: 8, border: 'none', fontSize: 11, fontWeight: 700, cursor: valid ? 'pointer' : 'default', background: valid ? '#7C3AED' : '#E2E8F0', color: valid ? '#fff' : '#9CA3AF' }}>Schedule Maintenance</button>
    </div>
  );
}

function AssignTechnicianForm({ onSubmit, teams, workOrders }) {
  const [woId, setWoId] = useState(workOrders[0]?.woId ?? '');
  const [tech, setTech] = useState(teams[0] ?? '');

  function submit() {
    if (!tech) return;
    onSubmit({ woId, tech });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Field label="Work Order">
        <select value={woId} onChange={e => setWoId(e.target.value)} style={INPUT_STYLE}>{workOrders.slice(0, 40).map(w => <option key={w.woId} value={w.woId}>{w.woId} — {w.title}</option>)}</select>
      </Field>
      <Field label="Technician / Team">
        <select value={tech} onChange={e => setTech(e.target.value)} style={INPUT_STYLE}>{teams.map(t => <option key={t} value={t}>{t}</option>)}</select>
      </Field>
      <button type="button" onClick={submit} disabled={!tech} className="eai-focusable" style={{ padding: '9px 0', borderRadius: 8, border: 'none', fontSize: 11, fontWeight: 700, cursor: tech ? 'pointer' : 'default', background: tech ? '#0077C8' : '#E2E8F0', color: tech ? '#fff' : '#9CA3AF' }}>Assign</button>
    </div>
  );
}

// ─── page (inner — uses useSearchParams, must be wrapped in Suspense) ────────
function OperationsHubInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { showToast, ToastHost } = useToast();
  const dashboardRef = useRef(null);

  const [woTab,  setWoTabState]  = useState(() => searchParams.get('woTab') || 'all');
  const [woPage, setWoPage] = useState(1);
  const [woSort, setWoSort] = useState(null);
  const [selectedWoId, setSelectedWoId] = useState(null);

  const [workOrders, setWorkOrders] = useState(WORK_ORDERS);
  const [alerts, setAlerts] = useState(seedAlerts);
  const [maintenanceItems, setMaintenanceItems] = useState(seedMaintenance);
  const [tasks, setTasks] = useState(synthTasks);

  const [filters, setFilters] = useState({ facility: [], severity: [], status: [], assignee: [] });
  const [dateRangeFilter, setDateRangeFilter] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [woExportOpen, setWoExportOpen] = useState(false);

  const [overviewRange, setOverviewRange] = useState('30d');
  const [overviewRangeOpen, setOverviewRangeOpen] = useState(false);
  const [trendGranularity, setTrendGranularity] = useState('daily');
  const [trendMenuOpen, setTrendMenuOpen] = useState(false);

  const [drawer, setDrawerState] = useState(() => {
    const fromParam = paramToDrawer(searchParams.get('drawer'));
    if (fromParam) return fromParam;
    const node = searchParams.get('node');
    if (node) return { kind: 'wo-create', prefillAsset: node };
    return null;
  });

  const updateURL = useCallback((patch) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') params.delete(k);
      else params.set(k, v);
    });
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  function setWoTab(tab) { setWoTabState(tab); setWoPage(1); updateURL({ woTab: tab === 'all' ? undefined : tab }); }
  function openDrawer(kind, payload) { const d = { kind, ...payload }; setDrawerState(d); updateURL({ drawer: drawerToParam(d) }); }
  function closeDrawer() { setDrawerState(null); updateURL({ drawer: undefined, node: undefined }); }

  // ─── derived option lists ────────────────────────────────────────────────
  const LOCATIONS = useMemo(() => [...new Set(workOrders.map(w => w.location))].sort(), [workOrders]);
  const TEAMS = useMemo(() => [...new Set(workOrders.map(w => w.assignedTo))].sort(), [workOrders]);

  // ─── Filters ──────────────────────────────────────────────────────────────
  const FILTER_GROUPS = useMemo(() => [
    { key: 'facility', label: 'Facility / Location',  options: LOCATIONS },
    { key: 'severity',  label: 'Severity',             options: INCIDENTS_BY_SEVERITY.map(s => s.name) },
    { key: 'status',    label: 'Work Order Status',    options: WORK_ORDERS_BY_STATUS.map(s => s.name) },
    { key: 'assignee',  label: 'Assignee',              options: TEAMS },
    { key: 'dateRange', label: 'Due Date',              options: ['Overdue', 'Next 7 Days', 'Next 30 Days'], single: true },
  ], [LOCATIONS, TEAMS]);
  const DATE_RANGE_KEY = { Overdue: 'overdue', 'Next 7 Days': 'next7', 'Next 30 Days': 'next30' };
  const DATE_RANGE_LABEL = { overdue: 'Overdue', next7: 'Next 7 Days', next30: 'Next 30 Days' };

  const filterSelected = {
    facility: filters.facility, severity: filters.severity, status: filters.status, assignee: filters.assignee,
    dateRange: dateRangeFilter ? [DATE_RANGE_LABEL[dateRangeFilter]] : [],
  };
  const filtersActive = filters.facility.length > 0 || filters.severity.length > 0 || filters.status.length > 0 || filters.assignee.length > 0 || !!dateRangeFilter;
  const activeFilterCount = filters.facility.length + filters.severity.length + filters.status.length + filters.assignee.length + (dateRangeFilter ? 1 : 0);

  function toggleFilter(groupKey, value) {
    if (groupKey === 'dateRange') {
      const key = DATE_RANGE_KEY[value];
      setDateRangeFilter(prev => (prev === key ? '' : key));
      return;
    }
    setFilters(prev => {
      const cur = prev[groupKey];
      const next = cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value];
      return { ...prev, [groupKey]: next };
    });
  }
  function clearAllFilters() {
    setFilters({ facility: [], severity: [], status: [], assignee: [] });
    setDateRangeFilter('');
    showToast('Filters cleared', 'info');
  }

  const TODAY = new Date('2025-05-19');
  function matchesDateRange(w) {
    if (!dateRangeFilter) return true;
    if (dateRangeFilter === 'overdue') return w.overdue;
    const d = new Date(w.dueDate);
    const diffDays = (d - TODAY) / (1000 * 60 * 60 * 24);
    if (dateRangeFilter === 'next7') return diffDays >= 0 && diffDays <= 7;
    if (dateRangeFilter === 'next30') return diffDays >= 0 && diffDays <= 30;
    return true;
  }

  const filteredWorkOrders = useMemo(() => {
    if (!filtersActive) return workOrders;
    return workOrders.filter(w =>
      (!filters.facility.length || filters.facility.includes(w.location)) &&
      (!filters.severity.length || filters.severity.includes(w.priority)) &&
      (!filters.status.length || filters.status.includes(w.status)) &&
      (!filters.assignee.length || filters.assignee.includes(w.assignedTo)) &&
      matchesDateRange(w)
    );
  }, [workOrders, filters, dateRangeFilter, filtersActive]);

  // ─── KPI strip ────────────────────────────────────────────────────────────
  const filteredSeverityData = useMemo(() => {
    if (!filters.severity.length) return INCIDENTS_BY_SEVERITY;
    const base = INCIDENTS_BY_SEVERITY.filter(s => filters.severity.includes(s.name));
    const total = base.reduce((s, x) => s + x.value, 0) || 1;
    return base.map(s => ({ ...s, pct: +((s.value / total) * 100).toFixed(1) }));
  }, [filters.severity]);

  const displayKpis = useMemo(() => {
    if (!filtersActive) return KPI_DATA;
    const openWO = filteredWorkOrders.length;
    const overdueWO = filteredWorkOrders.filter(w => w.overdue).length;
    return KPI_DATA.map(k => {
      if (k.key === 'openWO')    return { ...k, value: openWO, delta: '(filtered)' };
      if (k.key === 'overdueWO') return { ...k, value: overdueWO, delta: '(filtered)' };
      if (k.key === 'openIncidents' && filters.severity.length) return { ...k, value: filteredSeverityData.reduce((s, x) => s + x.value, 0), delta: '(filtered)' };
      return k;
    });
  }, [filtersActive, filteredWorkOrders, filters.severity, filteredSeverityData]);

  // ─── Operations Overview donuts (date range + filters) ──────────────────
  const overviewScale = useMemo(() => {
    const weeks = OVERVIEW_RANGE_PRESETS.find(p => p.key === overviewRange)?.weeks ?? 5;
    const slice = INCIDENTS_TREND.slice(-weeks);
    const sliceSum = slice.reduce((s, d) => s + d.critHigh + d.medLow, 0);
    const fullSum = INCIDENTS_TREND.reduce((s, d) => s + d.critHigh + d.medLow, 0);
    return fullSum ? sliceSum / fullSum : 1;
  }, [overviewRange]);

  const severityDonutData = useMemo(() => {
    let base = filteredSeverityData;
    if (overviewScale !== 1) {
      const scaled = base.map(s => ({ ...s, value: Math.max(0, Math.round(s.value * overviewScale)) }));
      const total = scaled.reduce((s, x) => s + x.value, 0) || 1;
      base = scaled.map(s => ({ ...s, pct: +((s.value / total) * 100).toFixed(1) }));
    }
    return base;
  }, [filteredSeverityData, overviewScale]);

  const statusDonutData = useMemo(() => {
    if (filtersActive) {
      const groups = {};
      filteredWorkOrders.forEach(w => { groups[w.status] = (groups[w.status] ?? 0) + 1; });
      const total = filteredWorkOrders.length || 1;
      return WORK_ORDERS_BY_STATUS.filter(s => groups[s.name]).map(s => ({ ...s, value: groups[s.name] ?? 0, pct: +(((groups[s.name] ?? 0) / total) * 100).toFixed(1) }));
    }
    if (overviewScale !== 1) {
      const scaled = WORK_ORDERS_BY_STATUS.map(s => ({ ...s, value: Math.max(0, Math.round(s.value * overviewScale)) }));
      const total = scaled.reduce((s, x) => s + x.value, 0) || 1;
      return scaled.map(s => ({ ...s, pct: +((s.value / total) * 100).toFixed(1) }));
    }
    return WORK_ORDERS_BY_STATUS;
  }, [filtersActive, filteredWorkOrders, overviewScale]);

  const severityTotal = severityDonutData.reduce((s, x) => s + x.value, 0);
  const statusTotal = statusDonutData.reduce((s, x) => s + x.value, 0);

  // ─── Incidents trend ──────────────────────────────────────────────────────
  const trendData = useMemo(() => bucketIncidentsTrend(trendGranularity), [trendGranularity]);
  const hideCritHigh = filters.severity.length > 0 && !filters.severity.some(s => ['Critical', 'High'].includes(s));
  const hideMedLow = filters.severity.length > 0 && !filters.severity.some(s => ['Medium', 'Low', 'Info'].includes(s));

  // ─── Work Orders table: filter (by tab) → sort ───────────────────────────
  function filterWOsByTab(tab, list) {
    if (tab === 'in-progress') return list.filter(w => w.status === 'In Progress' && !w.overdue);
    if (tab === 'planned')     return list.filter(w => w.status === 'Planned' && !w.overdue);
    if (tab === 'on-hold')     return list.filter(w => w.status === 'On Hold');
    if (tab === 'overdue')     return list.filter(w => w.overdue);
    return list;
  }

  function compareWO(a, b, key, dir) {
    const mult = dir === 'asc' ? 1 : -1;
    if (key === 'priority') return (PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]) * mult;
    if (key === 'dueDate')  return (new Date(a.dueDate) - new Date(b.dueDate)) * mult;
    if (key === 'slaPct')   return (a.slaPct - b.slaPct) * mult;
    return String(a[key]).localeCompare(String(b[key])) * mult;
  }

  const visibleWOs = useMemo(() => {
    let list = filterWOsByTab(woTab, filteredWorkOrders);
    if (woSort) list = [...list].sort((a, b) => compareWO(a, b, woSort.key, woSort.dir));
    return list;
  }, [woTab, filteredWorkOrders, woSort]);

  function handleWoSort(key) {
    setWoSort(prev => (prev && prev.key === key) ? (prev.dir === 'asc' ? { key, dir: 'desc' } : null) : { key, dir: 'asc' });
  }

  // ─── Create / report / schedule / assign handlers ────────────────────────
  function handleCreateWorkOrder(data) {
    const wo = { woId: nextWoId(), type: 'Standard', priority: data.priority, status: 'Planned', slaPct: 100, overdue: false, ...data };
    setWorkOrders(prev => [wo, ...prev]);
    const tabMap = { 'In Progress': 'in-progress', 'Planned': 'planned', 'On Hold': 'on-hold' };
    setWoTab(tabMap[wo.status] ?? 'all');
    showToast(`${wo.woId} created and assigned to ${wo.assignedTo}`, 'success');
    closeDrawer();
  }

  function handleReportIncident(data) {
    const sevMeta = INCIDENTS_BY_SEVERITY.find(s => s.name === data.severity);
    const alert = {
      id: `alert-new-${Date.now()}`, color: sevMeta?.color ?? '#6B7280',
      title: data.description.slice(0, 60), sub: data.facility,
      ago: `${data.severity} · just now`, severity: data.severity, acknowledged: false,
    };
    setAlerts(prev => [alert, ...prev]);
    showToast('Incident reported and added to Active Alerts', 'success');
    closeDrawer();
  }

  function handleScheduleMaintenance(data) {
    const item = { id: `maint-new-${Date.now()}`, date: data.date, title: `${data.asset}`, location: data.location, tag: data.type };
    setMaintenanceItems(prev => [...prev, item]);
    showToast('Maintenance scheduled', 'success');
    closeDrawer();
  }

  function handleAssignTechnician(data) {
    setWorkOrders(prev => prev.map(w => w.woId === data.woId ? { ...w, assignedTo: data.tech } : w));
    showToast(`Assigned ${data.tech} to ${data.woId}`, 'success');
    closeDrawer();
  }

  function handleAcknowledgeAlert(alertId) {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
    showToast('Alert acknowledged', 'success');
  }

  function handleToggleTask(taskId) {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, done: !t.done } : t));
  }

  function handleCloseWo(woId) {
    setWorkOrders(prev => prev.map(w => w.woId === woId ? { ...w, status: 'Completed', overdue: false, slaPct: 100 } : w));
    showToast(`${woId} closed`, 'success');
    closeDrawer();
  }

  // ─── Export ──────────────────────────────────────────────────────────────
  async function handleHeaderExport(kind) {
    setExportOpen(false);
    const dateStr = new Date().toISOString().slice(0, 10);
    try {
      if (kind === 'pdf') {
        if (!dashboardRef.current) return;
        await exportPanelPdf(dashboardRef.current, `ops-summary-${dateStr}.pdf`);
        showToast('Ops summary exported as PDF', 'success');
        return;
      }
      if (kind === 'wo') {
        const rows = visibleWOs.map(w => ({
          'WO ID': w.woId, Title: w.title, Type: w.type, Asset: w.asset, Location: w.location,
          Priority: w.priority, Status: w.status, 'Assigned To': w.assignedTo, 'Due Date': w.dueDate, 'SLA %': w.slaPct,
        }));
        await exportWorkbook([{ name: 'Work Orders', rows }], `work-orders-${dateStr}.xlsx`);
        showToast(`Exported ${rows.length} work orders`, 'success');
        return;
      }
      if (kind === 'incidents') {
        const rows = filteredSeverityData.map(s => ({ Severity: s.name, Count: s.value, 'Pct of Total': `${s.pct}%` }));
        await exportCsv(rows, `incidents-${dateStr}.csv`);
        showToast('Incidents exported', 'success');
      }
    } catch {
      showToast('Export failed — please try again', 'error');
    }
  }

  async function handleWoExport() {
    setWoExportOpen(false);
    const dateStr = new Date().toISOString().slice(0, 10);
    try {
      const rows = visibleWOs.map(w => ({
        'WO ID': w.woId, Title: w.title, Type: w.type, Asset: w.asset, Location: w.location,
        Priority: w.priority, Status: w.status, 'Assigned To': w.assignedTo, 'Due Date': w.dueDate, 'SLA %': w.slaPct,
      }));
      await exportWorkbook([{ name: 'Work Orders', rows }], `work-orders-${woTab}-${dateStr}.xlsx`);
      showToast(`Exported ${rows.length} work orders`, 'success');
    } catch {
      showToast('Export failed — please try again', 'error');
    }
  }

  // ─── SLA by-facility breakdown (derived from real WO slaPct + location) ──
  const slaByFacility = useMemo(() => {
    const groups = {};
    workOrders.forEach(w => {
      if (!groups[w.location]) groups[w.location] = { location: w.location, sum: 0, n: 0 };
      groups[w.location].sum += w.slaPct; groups[w.location].n += 1;
    });
    return Object.values(groups).map(g => ({ location: g.location, avgSla: Math.round(g.sum / g.n) })).sort((a, b) => a.avgSla - b.avgSla);
  }, [workOrders]);

  const filterExtra = null;

  // ─── drawer renderer ──────────────────────────────────────────────────────
  function renderDrawer() {
    if (!drawer) return <DetailDrawer open={false} onClose={closeDrawer} />;

    if (drawer.kind === 'kpi') {
      const kpi = drawer.kpi;
      const Icon = KPI_ICONS[kpi.iconKey] ?? Activity;
      let body = <DrawerStatRow items={[{ label: kpi.label, value: `${kpi.value}${kpi.unit}` }, { label: 'Trend', value: kpi.delta }]} />;
      if (kpi.key === 'openIncidents') body = <><DrawerStatRow items={[{ label: 'Total', value: PORTFOLIO.openIncidents }]} /><DrawerTable columns={[{ key: 'name', label: 'Severity' }, { key: 'value', label: 'Count', align: 'right' }]} rows={INCIDENTS_BY_SEVERITY} keyField="name" /></>;
      if (kpi.key === 'openWO' || kpi.key === 'overdueWO') body = <DrawerTable columns={[{ key: 'name', label: 'Status' }, { key: 'value', label: 'Count', align: 'right' }]} rows={WORK_ORDERS_BY_STATUS} keyField="name" />;
      if (kpi.key === 'slaPct') body = <DrawerTable columns={[{ key: 'name', label: 'SLA Bucket' }, { key: 'value', label: 'Count', align: 'right' }]} rows={SLA_COMPLIANCE.data} keyField="name" />;
      if (kpi.key === 'mttrHrs') body = <DrawerTable columns={[{ key: 'month', label: 'Month' }, { key: 'mttrHrs', label: 'MTTR (hrs)', align: 'right' }]} rows={MTTR_TREND} keyField="month" />;
      if (kpi.key === 'assetsDown') body = <DrawerTable columns={[{ key: 'name', label: 'Status' }, { key: 'value', label: 'Count', align: 'right' }]} rows={ASSETS_HEALTH.data} keyField="name" />;
      if (kpi.key === 'maintDue30') body = <DrawerTable columns={[{ key: 'title', label: 'Item' }, { key: 'date', label: 'Date', align: 'right' }]} rows={maintenanceItems} keyField="id" />;
      return <DetailDrawer open title={kpi.label} subtitle={kpi.delta} icon={<Icon size={16} color={kpi.color} />} accentColor={kpi.color} onClose={closeDrawer}>{body}</DetailDrawer>;
    }

    if (drawer.kind === 'wo') {
      const wo = drawer.wo;
      const pColor = PRIORITY_STYLE[wo.priority]?.color ?? '#6B7280';
      return (
        <DetailDrawer
          open title={wo.title} subtitle={`${wo.woId} · ${wo.asset}`} icon={<Wrench size={16} color={pColor} />} accentColor={pColor} onClose={closeDrawer}
          footer={
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => openDrawer('assign-technician', { woId: wo.woId })} className="eai-focusable" style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#1A1F36', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Reassign</button>
              <button onClick={() => handleCloseWo(wo.woId)} className="eai-focusable" style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', background: '#0077C8', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Close WO</button>
            </div>
          }
        >
          <DrawerStatRow items={[
            { label: 'Priority', value: wo.priority, color: pColor },
            { label: 'Status', value: wo.status, color: STATUS_STYLE[wo.status]?.color },
            { label: 'SLA', value: `${wo.slaPct}%`, color: wo.slaPct >= 80 ? '#10B981' : wo.slaPct >= 50 ? '#F59E0B' : '#EF4444' },
          ]} />
          <p style={{ fontSize: 10, fontWeight: 700, color: '#1A1F36', marginBottom: 8 }}>Details</p>
          <DrawerTable columns={[{ key: 'field', label: 'Field' }, { key: 'val', label: 'Value', align: 'right' }]} rows={[
            { field: 'Type', val: wo.type },
            { field: 'Location', val: wo.location },
            { field: 'Assigned To', val: wo.assignedTo },
            { field: 'Due Date', val: wo.dueDate },
            { field: wo.overdue ? 'SLA Countdown' : 'SLA Status', val: wo.overdue ? 'Past due' : `${wo.slaPct}% of window elapsed` },
          ]} keyField="field" />
        </DetailDrawer>
      );
    }

    if (drawer.kind === 'wo-create') {
      return (
        <DetailDrawer open title="Create Work Order" subtitle="Operations Hub" icon={<Plus size={16} color="#0077C8" />} accentColor="#0077C8" onClose={closeDrawer}>
          <CreateWorkOrderForm onSubmit={handleCreateWorkOrder} locations={LOCATIONS} teams={TEAMS} defaultAsset={drawer.prefillAsset} />
        </DetailDrawer>
      );
    }

    if (drawer.kind === 'incident-create') {
      return (
        <DetailDrawer open title="Report an Incident" subtitle="Operations Hub" icon={<AlertOctagon size={16} color="#EF4444" />} accentColor="#EF4444" onClose={closeDrawer}>
          <ReportIncidentForm onSubmit={handleReportIncident} locations={LOCATIONS} />
        </DetailDrawer>
      );
    }

    if (drawer.kind === 'maintenance-create') {
      return (
        <DetailDrawer open title="Schedule Maintenance" subtitle="Operations Hub" icon={<CalendarDays size={16} color="#7C3AED" />} accentColor="#7C3AED" onClose={closeDrawer}>
          <ScheduleMaintenanceForm onSubmit={handleScheduleMaintenance} locations={LOCATIONS} />
        </DetailDrawer>
      );
    }

    if (drawer.kind === 'assign-technician') {
      return (
        <DetailDrawer open title="Assign Technician" subtitle="Operations Hub" icon={<Users size={16} color="#0077C8" />} accentColor="#0077C8" onClose={closeDrawer}>
          <AssignTechnicianForm
            onSubmit={handleAssignTechnician}
            teams={TEAMS} workOrders={drawer.woId ? workOrders.filter(w => w.woId === drawer.woId) : workOrders}
          />
        </DetailDrawer>
      );
    }

    if (drawer.kind === 'alert-detail') {
      const a = drawer.alert;
      return (
        <DetailDrawer
          open title={a.title} subtitle={a.sub} icon={<ShieldAlert size={16} color={a.color} />} accentColor={a.color} onClose={closeDrawer}
          footer={
            <button
              onClick={() => handleAcknowledgeAlert(a.id)} disabled={a.acknowledged} className="eai-focusable"
              style={{ width: '100%', padding: '9px 0', borderRadius: 8, border: 'none', background: a.acknowledged ? '#E2E8F0' : '#0077C8', color: a.acknowledged ? '#9CA3AF' : '#fff', fontSize: 11, fontWeight: 700, cursor: a.acknowledged ? 'default' : 'pointer' }}
            >{a.acknowledged ? 'Acknowledged' : 'Acknowledge'}</button>
          }
        >
          <DrawerStatRow items={[
            { label: 'Facility', value: a.sub },
            { label: 'Severity', value: a.severity, color: a.color },
            { label: 'Time', value: a.ago },
          ]} />
          {a.acknowledged && <DrawerPill label="Acknowledged" color="#10B981" />}
        </DetailDrawer>
      );
    }

    if (drawer.kind === 'alerts-all') {
      return (
        <DetailDrawer open title="Active Alerts" subtitle={`${alerts.length} alerts`} icon={<ShieldAlert size={16} color="#EF4444" />} accentColor="#EF4444" onClose={closeDrawer}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {alerts.map(a => (
              <button key={a.id} type="button" onClick={() => openDrawer('alert-detail', { alert: a })} className="eai-focusable"
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', padding: '8px 10px', border: '1px solid #E2E8F0', background: a.acknowledged ? '#F8FAFC' : '#fff', borderRadius: 8, cursor: 'pointer', opacity: a.acknowledged ? 0.6 : 1 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: a.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#1A1F36', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</p>
                  <p style={{ fontSize: 9, color: '#6B7280' }}>{a.sub}</p>
                </div>
                <span style={{ fontSize: 9, color: '#9CA3AF', flexShrink: 0 }}>{a.ago}</span>
              </button>
            ))}
          </div>
        </DetailDrawer>
      );
    }

    if (drawer.kind === 'maintenance-detail') {
      const m = drawer.item;
      return (
        <DetailDrawer open title={m.title} subtitle={`${m.location} · ${m.date}`} icon={<CalendarDays size={16} color="#7C3AED" />} accentColor="#7C3AED" onClose={closeDrawer}>
          <DrawerStatRow items={[{ label: 'Type', value: m.tag }, { label: 'Location', value: m.location }, { label: 'Date', value: m.date }]} />
        </DetailDrawer>
      );
    }

    if (drawer.kind === 'maintenance-all') {
      return (
        <DetailDrawer open title="Maintenance Calendar" subtitle={`${maintenanceItems.length} scheduled items`} icon={<CalendarDays size={16} color="#7C3AED" />} accentColor="#7C3AED" onClose={closeDrawer}>
          <DrawerTable columns={[
            { key: 'date', label: 'Date' },
            { key: 'title', label: 'Item' },
            { key: 'location', label: 'Location' },
            { key: 'tag', label: 'Type', align: 'right', render: r => <DrawerPill label={r.tag} color={r.tag === 'PM' ? '#7C3AED' : '#10B981'} /> },
          ]} rows={maintenanceItems.map(m => ({ ...m, __onClick: () => openDrawer('maintenance-detail', { item: m }) }))} keyField="id" />
        </DetailDrawer>
      );
    }

    if (drawer.kind === 'sla') {
      return (
        <DetailDrawer open title="SLA Dashboard" subtitle={`${SLA_COMPLIANCE.pct}% overall compliance`} icon={<Activity size={16} color="#00A36C" />} accentColor="#00A36C" onClose={closeDrawer}>
          <DrawerTable columns={[{ key: 'name', label: 'Category' }, { key: 'value', label: 'Count', align: 'right' }, { key: 'pct', label: 'Share', align: 'right', render: r => `${r.pct}%` }]} rows={SLA_COMPLIANCE.data} keyField="name" />
          <p style={{ fontSize: 10, fontWeight: 700, color: '#1A1F36', margin: '16px 0 8px' }}>By Facility (avg SLA %)</p>
          <DrawerTable columns={[{ key: 'location', label: 'Facility' }, { key: 'avgSla', label: 'Avg SLA', align: 'right', render: r => `${r.avgSla}%` }]} rows={slaByFacility} keyField="location" />
        </DetailDrawer>
      );
    }

    if (drawer.kind === 'performance') {
      return (
        <DetailDrawer open title="Performance Analytics" subtitle="MTTR trend detail" icon={<Timer size={16} color="#0077C8" />} accentColor="#0077C8" onClose={closeDrawer}>
          <DrawerTable columns={[{ key: 'month', label: 'Month' }, { key: 'mttrHrs', label: 'MTTR (hrs)', align: 'right' }]} rows={MTTR_TREND} keyField="month" />
        </DetailDrawer>
      );
    }

    if (drawer.kind === 'asset-health') {
      return (
        <DetailDrawer open title="Asset Health Dashboard" subtitle={`${ASSETS_HEALTH.total.toLocaleString()} total assets`} icon={<Building2 size={16} color="#10B981" />} accentColor="#10B981" onClose={closeDrawer}>
          <DrawerTable
            columns={[
              { key: 'name', label: 'Status', render: r => <DrawerPill label={r.name} color={r.color} /> },
              { key: 'value', label: 'Assets', align: 'right', render: r => r.value.toLocaleString() },
              { key: 'pct', label: 'Share', align: 'right', render: r => `${r.pct}%` },
            ]}
            rows={ASSETS_HEALTH.data.map(r => ({ ...r, __onClick: () => showToast(`${r.value.toLocaleString()} assets are ${r.name} — dispatch work orders from the table below.`, 'info') }))}
            keyField="name"
          />
        </DetailDrawer>
      );
    }

    if (drawer.kind === 'tasks') {
      return (
        <DetailDrawer open title="Task Management" subtitle={`${tasks.filter(t => !t.done).length} open of ${tasks.length}`} icon={<CheckCircle2 size={16} color="#0077C8" />} accentColor="#0077C8" onClose={closeDrawer}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tasks.map(t => (
              <button key={t.id} type="button" onClick={() => { handleToggleTask(t.id); showToast(t.done ? `"${t.label}" marked incomplete` : `"${t.label}" completed`, 'success'); }} className="eai-focusable"
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', padding: '8px 10px', border: '1px solid #E2E8F0', background: '#fff', borderRadius: 8, cursor: 'pointer' }}>
                {t.done ? <CheckCircle2 size={15} color="#10B981" /> : <Circle size={15} color="#CBD5E1" />}
                <span style={{ flex: 1, fontSize: 11, color: t.done ? '#9CA3AF' : '#1A1F36', textDecoration: t.done ? 'line-through' : 'none' }}>{t.label}</span>
                <DrawerPill label={t.status} color={t.color} />
              </button>
            ))}
          </div>
        </DetailDrawer>
      );
    }

    return <DetailDrawer open={false} onClose={closeDrawer} />;
  }

  const overviewRangeDef = OVERVIEW_RANGE_PRESETS.find(p => p.key === overviewRange);
  const trendGranularityDef = TREND_GRANULARITIES.find(g => g.key === trendGranularity);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
      <style>{`
        .eai-focusable:focus-visible { outline: 2px solid #0077C8; outline-offset: 2px; border-radius: 4px; }
      `}</style>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Sub-header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 20px',
          borderBottom: '1px solid #E2E8F0',
          flexShrink: 0,
        }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 16, fontWeight: 800, color: '#1A1F36', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Operations Hub
            </h1>
            <p style={{ fontSize: 10, color: '#6B7280', marginTop: 1 }}>
              Real-time operations, work orders & incident management
            </p>
          </div>
          <span style={{ fontSize: 10, color: '#9CA3AF', flexShrink: 0 }}>May 19, 2025</span>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { setFiltersOpen(o => !o); setExportOpen(false); }}
              className="eai-focusable"
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 10, fontWeight: 600, color: filtersActive ? '#0077C8' : '#6B7280',
                background: filtersActive ? 'rgba(0,119,200,0.08)' : '#F8FAFC',
                border: `1px solid ${filtersActive ? 'rgba(0,119,200,0.30)' : '#E2E8F0'}`,
                borderRadius: 7, padding: '5px 12px', cursor: 'pointer',
              }}
            >
              <Filter size={11} /> Filters
              {activeFilterCount > 0 && (
                <span style={{ width: 15, height: 15, borderRadius: '50%', background: '#0077C8', color: '#fff', fontSize: 8, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{activeFilterCount}</span>
              )}
            </button>
            <FilterPopover open={filtersOpen} onClose={() => setFiltersOpen(false)} groups={FILTER_GROUPS} selected={filterSelected} onToggle={toggleFilter} onClear={clearAllFilters} extra={filterExtra} width={230} />
          </div>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { setExportOpen(o => !o); setFiltersOpen(false); }}
              className="eai-focusable"
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 10, fontWeight: 600, color: '#6B7280',
                background: '#F8FAFC', border: '1px solid #E2E8F0',
                borderRadius: 7, padding: '5px 12px', cursor: 'pointer',
              }}
            >
              <Download size={11} /> Export
            </button>
            {exportOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 400, width: 220, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, boxShadow: '0 8px 24px rgba(16,24,40,0.12)', overflow: 'hidden' }}>
                {[
                  { key: 'pdf',       label: 'Ops summary (PDF)',    Icon: FileText },
                  { key: 'wo',        label: 'Work orders (XLSX)',   Icon: FileSpreadsheet },
                  { key: 'incidents', label: 'Incidents (CSV)',      Icon: FileDown },
                ].map(({ key, label, Icon }) => (
                  <button key={key} type="button" onClick={() => handleHeaderExport(key)} className="eai-focusable"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 12px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#374151', fontSize: 11 }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <Icon size={12} style={{ color: '#0077C8' }} /> {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <QuickActionsMenu items={[
            { iconKey: 'Plus',         label: 'Create Work Order',    onClick: () => openDrawer('wo-create', {}) },
            { iconKey: 'AlertOctagon', label: 'Report an Incident',   onClick: () => openDrawer('incident-create', {}) },
            { iconKey: 'CalendarDays', label: 'Schedule Maintenance', onClick: () => openDrawer('maintenance-create', {}) },
            { iconKey: 'Users',        label: 'Assign Technician',    onClick: () => openDrawer('assign-technician', {}) },
            { iconKey: 'Download',     label: 'Export Report',        onClick: () => setExportOpen(true) },
          ]} />
        </div>

        {/* Scrollable content */}
        <div ref={dashboardRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* KPI row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
            {displayKpis.map(k => {
              const { key, ...cardProps } = k;
              return <KpiCard key={key} {...cardProps} onClick={() => openDrawer('kpi', { kpi: k })} />;
            })}
          </div>

          {/* Row 1: Operations Overview | Incidents Trend | Right Rail */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 0.88fr', gap: 12, alignItems: 'start' }}>

            {/* Operations Overview */}
            <div style={CARD}>
              <div style={CARD_HDR}>
                <span style={CARD_TITLE}>Operations Overview</span>
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setOverviewRangeOpen(o => !o)} className="eai-focusable" style={DROPDOWN_BTN}>Last {overviewRangeDef.label} <ChevronDown size={9} /></button>
                  {overviewRangeOpen && (
                    <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 400, width: 140, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, boxShadow: '0 8px 24px rgba(16,24,40,0.12)', overflow: 'hidden' }}>
                      {OVERVIEW_RANGE_PRESETS.map(p => (
                        <button key={p.key} type="button" onClick={() => { setOverviewRange(p.key); setOverviewRangeOpen(false); }} className="eai-focusable"
                          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 10px', border: 'none', background: p.key === overviewRange ? 'rgba(0,119,200,0.08)' : 'transparent', color: p.key === overviewRange ? '#0077C8' : '#374151', fontSize: 10, fontWeight: p.key === overviewRange ? 700 : 400, cursor: 'pointer' }}>
                          Last {p.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ padding: '12px 14px', display: 'flex', gap: 10 }}>
                <DonutHalf
                  title="Incidents by Severity"
                  data={severityDonutData}
                  centerLabel={String(severityTotal)}
                  centerSublabel="Total"
                />
                <div style={{ width: 1, background: '#E2E8F0', flexShrink: 0 }} />
                <DonutHalf
                  title="Work Orders by Status"
                  data={statusDonutData}
                  centerLabel={String(statusTotal)}
                  centerSublabel="Total"
                />
              </div>
            </div>

            {/* Incidents Trend */}
            <div style={CARD}>
              <div style={CARD_HDR}>
                <span style={CARD_TITLE}>Incidents Trend</span>
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setTrendMenuOpen(o => !o)} className="eai-focusable" style={DROPDOWN_BTN}>{trendGranularityDef.label} <ChevronDown size={9} /></button>
                  {trendMenuOpen && (
                    <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 400, width: 120, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, boxShadow: '0 8px 24px rgba(16,24,40,0.12)', overflow: 'hidden' }}>
                      {TREND_GRANULARITIES.map(g => (
                        <button key={g.key} type="button" onClick={() => { setTrendGranularity(g.key); setTrendMenuOpen(false); }} className="eai-focusable"
                          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 10px', border: 'none', background: g.key === trendGranularity ? 'rgba(0,119,200,0.08)' : 'transparent', color: g.key === trendGranularity ? '#0077C8' : '#374151', fontSize: 10, fontWeight: g.key === trendGranularity ? 700 : 400, cursor: 'pointer' }}>
                          {g.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ padding: '10px 14px 14px' }}>
                <IncidentsTrendChart data={trendData} height={158} hideCritHigh={hideCritHigh} hideMedLow={hideMedLow} />
              </div>
            </div>

            {/* Right Rail */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <ListCard
                title="Active Alerts"
                variant="alerts"
                items={alerts}
                onViewAll={() => openDrawer('alerts-all', {})}
                onItemClick={item => openDrawer('alert-detail', { alert: item })}
              />
              <CalendarListCard
                title="Maintenance Calendar"
                items={maintenanceItems}
                onViewAll={() => openDrawer('maintenance-all', {})}
                onViewFull={() => openDrawer('maintenance-all', {})}
                onItemClick={item => openDrawer('maintenance-detail', { item })}
              />
            </div>
          </div>

          {/* Work Orders DataTable */}
          <div style={CARD}>
            <div style={CARD_HDR}>
              <span style={CARD_TITLE}>Open Work Orders</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setWoExportOpen(o => !o)} className="eai-focusable" style={DROPDOWN_BTN}><Download size={9} /> Export</button>
                  {woExportOpen && (
                    <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 400, width: 180, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, boxShadow: '0 8px 24px rgba(16,24,40,0.12)', overflow: 'hidden' }}>
                      <button type="button" onClick={handleWoExport} className="eai-focusable" style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#374151', fontSize: 11 }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <FileSpreadsheet size={12} style={{ color: '#0077C8' }} /> Export current tab (XLSX)
                      </button>
                    </div>
                  )}
                </div>
                <button onClick={() => openDrawer('wo-create', {})} className="eai-focusable" style={{
                  ...DROPDOWN_BTN,
                  color: '#0077C8',
                  border: '1px solid rgba(0,119,200,0.35)',
                  background: 'rgba(0,119,200,0.12)',
                }}>
                  + Create Work Order
                </button>
              </div>
            </div>
            <DataTable
              tabs={WO_TABS}
              activeTab={woTab}
              onTabChange={setWoTab}
              columns={WO_COLUMNS}
              data={visibleWOs}
              keyField="woId"
              selectedKey={selectedWoId}
              onRowClick={row => setSelectedWoId(row.woId)}
              onRowDoubleClick={row => openDrawer('wo', { wo: row })}
              sortState={woSort}
              onSort={handleWoSort}
              pagination={{ page: woPage, perPage: 10, total: getWoTabTotal(woTab), onChange: setWoPage }}
            />
          </div>

          {/* Bottom 4-card row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>

            {/* SLA Compliance */}
            <div style={CARD}>
              <div style={CARD_HDR}><span style={CARD_TITLE}>SLA Compliance</span></div>
              <button onClick={() => openDrawer('sla', {})} className="eai-focusable" style={{ padding: '10px 14px 8px', border: 'none', background: 'transparent', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                <DonutChart
                  data={SLA_COMPLIANCE.data}
                  centerLabel={`${SLA_COMPLIANCE.pct}%`}
                  centerSublabel="Compliance"
                  height={148}
                  innerRadius={42}
                  outerRadius={62}
                />
              </button>
              <div style={{ padding: '0 14px 10px' }}>
                <button onClick={() => openDrawer('sla', {})} className="eai-focusable" style={LINK_BTN_STYLE}>View SLA Dashboard →</button>
              </div>
            </div>

            {/* MTTR Trend */}
            <div style={CARD}>
              <div style={CARD_HDR}><span style={CARD_TITLE}>MTTR Trend</span></div>
              <button onClick={() => openDrawer('performance', {})} className="eai-focusable" style={{ padding: '10px 14px 8px', border: 'none', background: 'transparent', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                <p style={{ fontSize: 9, color: '#9CA3AF', marginBottom: 6 }}>Mean Time To Resolve (hrs)</p>
                <TrendChart
                  data={MTTR_TREND}
                  type="line"
                  dataKey="mttrHrs"
                  xKey="month"
                  color="#0077C8"
                  unit=" hrs"
                  height={110}
                />
              </button>
              <div style={{ padding: '0 14px 10px' }}>
                <button onClick={() => openDrawer('performance', {})} className="eai-focusable" style={LINK_BTN_STYLE}>View Performance Analytics →</button>
              </div>
            </div>

            {/* Assets Health */}
            <div style={CARD}>
              <div style={CARD_HDR}><span style={CARD_TITLE}>Assets Health</span></div>
              <button onClick={() => openDrawer('asset-health', {})} className="eai-focusable" style={{ padding: '10px 14px 8px', border: 'none', background: 'transparent', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                <DonutChart
                  data={ASSETS_HEALTH.data}
                  centerLabel={ASSETS_HEALTH.total.toLocaleString()}
                  centerSublabel="Total Assets"
                  height={148}
                  innerRadius={42}
                  outerRadius={62}
                />
              </button>
              <div style={{ padding: '0 14px 10px' }}>
                <button onClick={() => openDrawer('asset-health', {})} className="eai-focusable" style={LINK_BTN_STYLE}>View Asset Health Dashboard →</button>
              </div>
            </div>

            {/* Operational Tasks */}
            <div style={CARD}>
              <div style={CARD_HDR}><span style={CARD_TITLE}>Operational Tasks</span></div>
              <button onClick={() => openDrawer('tasks', {})} className="eai-focusable" style={{ padding: '10px 14px 8px', border: 'none', background: 'transparent', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                <DonutChart
                  data={OPERATIONAL_TASKS.data}
                  centerLabel={OPERATIONAL_TASKS.total.toString()}
                  centerSublabel="Tasks"
                  height={148}
                  innerRadius={42}
                  outerRadius={62}
                />
              </button>
              <div style={{ padding: '0 14px 10px' }}>
                <button onClick={() => openDrawer('tasks', {})} className="eai-focusable" style={LINK_BTN_STYLE}>View Task Management →</button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {renderDrawer()}
      <ToastHost />
    </div>
  );
}

export default function OperationsHubPage() {
  return (
    <Suspense fallback={
      <div style={{ height: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F6F9', color: '#9CA3AF', fontSize: 12 }}>
        Loading…
      </div>
    }>
      <OperationsHubInner />
    </Suspense>
  );
}

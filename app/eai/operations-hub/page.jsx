'use client';
import { useState } from 'react';
import { Filter, Download, ChevronDown } from 'lucide-react';
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
import OperationsSidePanel from '@/components/eai/operations-hub/OperationsSidePanel';

import {
  PORTFOLIO,
  INCIDENTS_BY_SEVERITY, WORK_ORDERS_BY_STATUS,
  INCIDENTS_TREND, ACTIVE_ALERTS, MAINTENANCE_CALENDAR,
  SLA_COMPLIANCE, MTTR_TREND, ASSETS_HEALTH, OPERATIONAL_TASKS,
  WORK_ORDERS, getWoTabTotal,
} from '@/data/eaiOperationsMock';

// ─── Shared card styles ────────────────────────────────────────────────────────
const CARD = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 12,
  overflow: 'hidden',
};
const CARD_HDR = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '10px 14px',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
};
const CARD_TITLE = { fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' };
const LINK_STYLE = { fontSize: 9, color: '#0077C8', textDecoration: 'none', fontWeight: 600 };
const DROPDOWN_BTN = {
  display: 'flex', alignItems: 'center', gap: 3,
  fontSize: 9, color: 'rgba(255,255,255,0.55)',
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 6, padding: '3px 8px', cursor: 'pointer',
};

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
  { key: 'woId',      label: 'WO ID',           width: 96 },
  { key: 'title',     label: 'Title' },
  { key: 'type',      label: 'Type',             width: 80,
    render: v => <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)' }}>{v}</span> },
  { key: 'asset',     label: 'Asset / Location', width: 136,
    render: (v, row) => (
      <div>
        <p style={{ fontSize: 10, fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>{v}</p>
        <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{row.location}</p>
      </div>
    ) },
  { key: 'priority',  label: 'Priority',         width: 72,
    render: v => <StatusPill v={v} map={PRIORITY_STYLE} /> },
  { key: 'status',    label: 'Status',           width: 92,
    render: v => <StatusPill v={v} map={STATUS_STYLE} /> },
  { key: 'assignedTo', label: 'Assigned To',     width: 108,
    render: v => <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)' }}>{v}</span> },
  { key: 'dueDate',   label: 'Due Date',         width: 92,
    render: v => <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)' }}>{v}</span> },
  { key: 'slaPct',    label: 'SLA',              width: 82,
    render: v => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{
            width: `${v}%`, height: '100%', borderRadius: 2,
            background: v >= 80 ? '#10B981' : v >= 50 ? '#F59E0B' : '#EF4444',
          }} />
        </div>
        <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', width: 26, textAlign: 'right', flexShrink: 0 }}>{v}%</span>
      </div>
    ) },
  { key: '_act',      label: '',                 width: 36, align: 'center',
    render: () => <span style={{ color: 'rgba(255,255,255,0.30)', fontSize: 14, cursor: 'pointer' }}>···</span> },
];

const WO_TABS = [
  { key: 'all',         label: 'All',         count: PORTFOLIO.openWorkOrders },
  { key: 'in-progress', label: 'In Progress', count: PORTFOLIO.inProgressWOs  },
  { key: 'planned',     label: 'Planned',     count: PORTFOLIO.plannedWOs     },
  { key: 'on-hold',     label: 'On Hold',     count: PORTFOLIO.onHoldWOs      },
  { key: 'overdue',     label: 'Overdue',     count: PORTFOLIO.overdueWOs     },
];

const KPI_DATA = [
  { label: 'Open Incidents',      value: PORTFOLIO.openIncidents,     unit: '',     delta: '↑14 vs last month',      up: false, iconKey: 'shieldAlert', color: '#EF4444', bg: 'rgba(239,68,68,0.15)',   seed: 11 },
  { label: 'Open Work Orders',    value: PORTFOLIO.openWorkOrders,    unit: '',     delta: '↑9% vs last month',      up: false, iconKey: 'layers',      color: '#0077C8', bg: 'rgba(0,119,200,0.15)',   seed: 22 },
  { label: 'Overdue Work Orders', value: PORTFOLIO.overdueWorkOrders, unit: '',     delta: '↑5 vs last month',       up: false, iconKey: 'timer',       color: '#EF4444', bg: 'rgba(239,68,68,0.15)',   seed: 33 },
  { label: 'Assets Down',         value: PORTFOLIO.assetsDown,        unit: '',     delta: '↑6 vs last month',       up: false, iconKey: 'building',    color: '#F59E0B', bg: 'rgba(245,158,11,0.15)',  seed: 44 },
  { label: 'SLA Compliance',      value: PORTFOLIO.slaPct,            unit: '%',    delta: '↓3.6% vs last month',    up: false, iconKey: 'activity',    color: '#00A36C', bg: 'rgba(0,163,108,0.15)',   seed: 55 },
  { label: 'MTTR (Incidents)',     value: PORTFOLIO.mttrHrs,           unit: ' hrs', delta: '↓0.8 hrs vs last month', up: true,  iconKey: 'zap',         color: '#0077C8', bg: 'rgba(0,119,200,0.15)',   seed: 66 },
  { label: 'Maintenance Due 30D', value: PORTFOLIO.maintenanceDue30,  unit: '',     delta: '↑11 vs last month',      up: false, iconKey: 'droplets',    color: '#F59E0B', bg: 'rgba(245,158,11,0.15)',  seed: 77 },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function DonutHalf({ title, data, centerLabel, centerSublabel }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{
        fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.40)',
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
                <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap' }}>{item.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>{item.value}</span>
                <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.25)' }}>({item.pct}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IncidentsTrendChart({ data, height = 165 }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
        {[
          { key: 'critHigh', label: 'Critical / High', color: '#EF4444' },
          { key: 'medLow',   label: 'Medium / Low',    color: '#0077C8' },
        ].map(s => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: 'rgba(255,255,255,0.55)' }}>
            <span style={{ width: 14, height: 2, background: s.color, display: 'inline-block', borderRadius: 1, flexShrink: 0 }} />
            {s.label}
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.35)' }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.35)' }}
            axisLine={false} tickLine={false}
            width={24} domain={[0, 80]} ticks={[0, 20, 40, 60, 80]}
          />
          <Tooltip
            contentStyle={{ background: '#1C2340', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, fontSize: 10, color: '#fff' }}
            labelStyle={{ color: 'rgba(255,255,255,0.55)' }}
          />
          <Line type="monotone" dataKey="critHigh" name="Critical / High" stroke="#EF4444" strokeWidth={2} dot={{ r: 3.5, fill: '#EF4444', strokeWidth: 0 }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="medLow"   name="Medium / Low"    stroke="#0077C8" strokeWidth={2} dot={{ r: 3.5, fill: '#0077C8', strokeWidth: 0 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function filterWOs(tab) {
  if (tab === 'in-progress') return WORK_ORDERS.filter(w => w.status === 'In Progress' && !w.overdue);
  if (tab === 'planned')     return WORK_ORDERS.filter(w => w.status === 'Planned' && !w.overdue);
  if (tab === 'on-hold')     return WORK_ORDERS.filter(w => w.status === 'On Hold');
  if (tab === 'overdue')     return WORK_ORDERS.filter(w => w.overdue);
  return WORK_ORDERS;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OperationsHubPage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [woTab,  setWoTab]  = useState('all');
  const [woPage, setWoPage] = useState(1);

  const visibleWOs = filterWOs(woTab);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
      <OperationsSidePanel activeSection={activeSection} onSelect={setActiveSection} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Sub-header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Operations Hub
            </h1>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.40)', marginTop: 1 }}>
              Real-time operations, work orders & incident management
            </p>
          </div>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.30)', flexShrink: 0 }}>May 19, 2025</span>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.70)',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 7, padding: '5px 12px', cursor: 'pointer',
          }}>
            <Filter size={11} /> Filters
          </button>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.70)',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 7, padding: '5px 12px', cursor: 'pointer',
          }}>
            <Download size={11} /> Export
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* KPI row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
            {KPI_DATA.map(k => <KpiCard key={k.label} {...k} />)}
          </div>

          {/* Row 1: Operations Overview | Incidents Trend | Right Rail */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 0.88fr', gap: 12 }}>

            {/* Operations Overview */}
            <div style={CARD}>
              <div style={CARD_HDR}>
                <span style={CARD_TITLE}>Operations Overview</span>
                <button style={DROPDOWN_BTN}>Last 30 Days <ChevronDown size={9} /></button>
              </div>
              <div style={{ padding: '12px 14px', display: 'flex', gap: 10 }}>
                <DonutHalf
                  title="Incidents by Severity"
                  data={INCIDENTS_BY_SEVERITY}
                  centerLabel="48"
                  centerSublabel="Total"
                />
                <div style={{ width: 1, background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />
                <DonutHalf
                  title="Work Orders by Status"
                  data={WORK_ORDERS_BY_STATUS}
                  centerLabel="356"
                  centerSublabel="Total"
                />
              </div>
            </div>

            {/* Incidents Trend */}
            <div style={CARD}>
              <div style={CARD_HDR}>
                <span style={CARD_TITLE}>Incidents Trend</span>
                <button style={DROPDOWN_BTN}>Daily <ChevronDown size={9} /></button>
              </div>
              <div style={{ padding: '10px 14px 14px' }}>
                <IncidentsTrendChart data={INCIDENTS_TREND} height={158} />
              </div>
            </div>

            {/* Right Rail */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <ListCard
                title="Active Alerts"
                variant="alerts"
                items={ACTIVE_ALERTS}
                viewAllHref="#"
              />
              <CalendarListCard
                title="Maintenance Calendar"
                items={MAINTENANCE_CALENDAR}
                viewAllHref="#"
                viewFullHref="#"
              />
            </div>
          </div>

          {/* Work Orders DataTable */}
          <div style={CARD}>
            <div style={CARD_HDR}>
              <span style={CARD_TITLE}>Open Work Orders</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={DROPDOWN_BTN}><Download size={9} /> Export</button>
                <button style={{
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
              onTabChange={tab => { setWoTab(tab); setWoPage(1); }}
              columns={WO_COLUMNS}
              data={visibleWOs}
              pagination={{ page: woPage, perPage: 10, total: getWoTabTotal(woTab), onChange: setWoPage }}
            />
          </div>

          {/* Bottom 4-card row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>

            {/* SLA Compliance */}
            <div style={CARD}>
              <div style={CARD_HDR}><span style={CARD_TITLE}>SLA Compliance</span></div>
              <div style={{ padding: '10px 14px 8px' }}>
                <DonutChart
                  data={SLA_COMPLIANCE.data}
                  centerLabel={`${SLA_COMPLIANCE.pct}%`}
                  centerSublabel="Compliance"
                  height={148}
                  innerRadius={42}
                  outerRadius={62}
                />
              </div>
              <div style={{ padding: '0 14px 10px' }}>
                <a href="#" style={LINK_STYLE}>View SLA Dashboard →</a>
              </div>
            </div>

            {/* MTTR Trend */}
            <div style={CARD}>
              <div style={CARD_HDR}><span style={CARD_TITLE}>MTTR Trend</span></div>
              <div style={{ padding: '10px 14px 8px' }}>
                <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.30)', marginBottom: 6 }}>Mean Time To Resolve (hrs)</p>
                <TrendChart
                  data={MTTR_TREND}
                  type="line"
                  dataKey="mttrHrs"
                  xKey="month"
                  color="#0077C8"
                  unit=" hrs"
                  height={110}
                />
              </div>
              <div style={{ padding: '0 14px 10px' }}>
                <a href="#" style={LINK_STYLE}>View Performance Analytics →</a>
              </div>
            </div>

            {/* Assets Health */}
            <div style={CARD}>
              <div style={CARD_HDR}><span style={CARD_TITLE}>Assets Health</span></div>
              <div style={{ padding: '10px 14px 8px' }}>
                <DonutChart
                  data={ASSETS_HEALTH.data}
                  centerLabel={ASSETS_HEALTH.total.toLocaleString()}
                  centerSublabel="Total Assets"
                  height={148}
                  innerRadius={42}
                  outerRadius={62}
                />
              </div>
              <div style={{ padding: '0 14px 10px' }}>
                <a href="#" style={LINK_STYLE}>View Asset Health Dashboard →</a>
              </div>
            </div>

            {/* Operational Tasks */}
            <div style={CARD}>
              <div style={CARD_HDR}><span style={CARD_TITLE}>Operational Tasks</span></div>
              <div style={{ padding: '10px 14px 8px' }}>
                <DonutChart
                  data={OPERATIONAL_TASKS.data}
                  centerLabel={OPERATIONAL_TASKS.total.toString()}
                  centerSublabel="Tasks"
                  height={148}
                  innerRadius={42}
                  outerRadius={62}
                />
              </div>
              <div style={{ padding: '0 14px 10px' }}>
                <a href="#" style={LINK_STYLE}>View Task Management →</a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

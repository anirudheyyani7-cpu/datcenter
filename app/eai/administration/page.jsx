'use client';
import { useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

import KpiCard            from '@/components/eai/widgets/KpiCard';
import DonutChart         from '@/components/eai/widgets/DonutChart';
import DataTable          from '@/components/eai/widgets/DataTable';
import ListCard           from '@/components/eai/widgets/ListCard';
import HorizontalBarList  from '@/components/eai/widgets/HorizontalBarList';
import StatRowList        from '@/components/eai/widgets/StatRowList';
import QuickActionsMenu from '@/components/eai/widgets/QuickActionsMenu';

import {
  KPIS, USER_ACTIVITY, USERS_BY_ROLE,
  SYSTEM_HEALTH, RECENT_ACTIVITY, RECENT_USERS,
  SYSTEM_RESOURCE_USAGE, SECURITY_OVERVIEW,
  AUDIT_LOGS, STORAGE_OVERVIEW,
  SUPPORT_TICKETS, LICENSES_USAGE,
} from '@/data/eaiAdminMock';

// ─── Shared card styles ────────────────────────────────────────────────────────
const CARD = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 12, overflow: 'hidden',
};
const CARD_HDR = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)',
};
const CARD_TITLE = { fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' };
const LINK_STYLE = { fontSize: 9, color: '#0077C8', textDecoration: 'none', fontWeight: 600 };
const VIEW_ALL   = { fontSize: 9, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' };
const DROPDOWN_BTN = {
  display: 'flex', alignItems: 'center', gap: 3,
  fontSize: 9, color: 'rgba(255,255,255,0.55)',
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 6, padding: '3px 8px', cursor: 'pointer',
};
const GAP = 10;

// ─── User Activity dual-series chart ──────────────────────────────────────────
function UserActivityChart({ data, height = 155 }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 14, marginBottom: 6 }}>
        {[['#0077C8', 'Active Users'], ['#00A36C', 'New Users']].map(([c, l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 14, height: 2.5, borderRadius: 2, background: c, display: 'inline-block' }} />
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.50)' }}>{l}</span>
          </div>
        ))}
      </div>
      <div style={{ width: '100%', overflow: 'hidden' }}>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" tick={{ fontSize: 7, fill: '#6B7280' }} axisLine={false} tickLine={false} />
            <YAxis
              tickFormatter={v => v >= 1000 ? (v / 1000).toFixed(1) + 'K' : v}
              tick={{ fontSize: 7, fill: '#6B7280' }} axisLine={false} tickLine={false}
              domain={[0, 1400]} ticks={[0, 300, 600, 900, 1200]}
            />
            <Tooltip
              contentStyle={{ background: '#1A1F36', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 8, fontSize: 11, color: '#fff' }}
              labelStyle={{ color: 'rgba(255,255,255,0.40)', fontSize: 9, marginBottom: 2 }}
            />
            <Line type="monotone" dataKey="activeUsers" name="Active Users" stroke="#0077C8" strokeWidth={2} dot={{ r: 3, fill: '#0077C8', strokeWidth: 0 }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="newUsers"    name="New Users"    stroke="#00A36C" strokeWidth={2} dot={{ r: 3, fill: '#00A36C', strokeWidth: 0 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── User status pill ──────────────────────────────────────────────────────────
const USER_STATUS = {
  Active:   { color: '#00A36C', bg: 'rgba(0,163,108,0.15)',  border: 'rgba(0,163,108,0.30)'  },
  Inactive: { color: '#6B7280', bg: 'rgba(107,114,128,0.15)', border: 'rgba(107,114,128,0.30)' },
};

// ─── Table column configs ──────────────────────────────────────────────────────
const USER_COLS = [
  { key: 'name',      label: 'User',       width: 110 },
  { key: 'email',     label: 'Email',      render: v => <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.40)' }}>{v}</span> },
  { key: 'role',      label: 'Role',       width: 132, render: v => <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)' }}>{v}</span> },
  { key: 'status',    label: 'Status',     width: 68, render: v => {
    const s = USER_STATUS[v] ?? USER_STATUS.Active;
    return <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 7px', borderRadius: 5, color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>{v}</span>;
  }},
  { key: 'lastLogin', label: 'Last Login', width: 148, render: v => <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>{v}</span> },
];

const AUDIT_COLS = [
  { key: 'time',      label: 'Time',       width: 140, render: v => <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)' }}>{v}</span> },
  { key: 'user',      label: 'User',       width: 116 },
  { key: 'action',    label: 'Action',     width: 110, render: v => <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)' }}>{v}</span> },
  { key: 'resource',  label: 'Resource',   render: v => <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)' }}>{v}</span> },
  { key: 'ipAddress', label: 'IP Address', width: 110, render: v => <span style={{ fontSize: 9, fontFamily: 'ui-monospace,monospace', color: 'rgba(255,255,255,0.35)' }}>{v}</span> },
];

// ─── Support Ticket icon keys by severity ─────────────────────────────────────
const TICKET_ICON_MAP = {
  Critical: { iconKey: 'AlertCircle',   iconColor: '#EF4444' },
  High:     { iconKey: 'AlertTriangle', iconColor: '#F59E0B' },
  Medium:   { iconKey: 'AlertCircle',   iconColor: '#F97316' },
  Low:      { iconKey: 'Info',          iconColor: '#3B82F6' },
};

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function AdministrationPage() {
  const [activeSection, setActiveSection] = useState('overview');

  // StatRowList item arrays built from mock data
  const healthItems = SYSTEM_HEALTH.map(h => ({
    label:      h.label,
    statusPill: h.status,
  }));

  const securityItems = SECURITY_OVERVIEW.map(s => ({
    label:    s.label,
    value:    s.value,
    delta:    s.delta,
    deltaUp:  s.deltaUp,
  }));

  const ticketItems = SUPPORT_TICKETS.map(t => ({
    ...TICKET_ICON_MAP[t.severity],
    label:   t.severity,
    value:   t.count,
    delta:   t.delta,
    deltaUp: t.deltaUp,
  }));

  const licenseItems = [
    { label: 'Total Licenses',     value: LICENSES_USAGE.totalLicenses.toLocaleString()                                      },
    { label: 'Used Licenses',      value: `${LICENSES_USAGE.usedLicenses.toLocaleString()} (${LICENSES_USAGE.usedPct}%)`     },
    { label: 'Available Licenses', value: `${LICENSES_USAGE.availableLicenses.toLocaleString()} (${LICENSES_USAGE.availablePct}%)` },
    { label: 'License Expiry',     value: LICENSES_USAGE.licenseExpiry, valueColor: '#EF4444'                                 },
    { label: 'Auto Renewal',       toggle: true, toggleInitial: LICENSES_USAGE.autoRenewal                                   },
  ];

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* ── Sub-header ─────────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0, background: '#0A0F1E',
        }}>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>Administration</h1>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Manage users, roles, system settings and platform governance</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {/* System Status pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'rgba(0,163,108,0.10)', border: '1px solid rgba(0,163,108,0.25)',
              borderRadius: 8, padding: '5px 10px',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00A36C', boxShadow: '0 0 5px #00A36C90', display: 'inline-block' }} />
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.60)' }}>System Status</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#00A36C' }}>Healthy</span>
            </div>
            {/* Timestamp */}
            <button style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
              color: 'rgba(255,255,255,0.60)', fontSize: 10,
            }}>
              May 31, 2025 10:30 AM <ChevronDown size={10} />
            </button>
            {/* Create button */}
            <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(0,119,200,0.50)' }}>
              <button style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'linear-gradient(135deg, #0077C8 0%, #005EA6 100%)',
                border: 'none', padding: '5px 12px', cursor: 'pointer',
                color: '#fff', fontSize: 10, fontWeight: 600,
              }}>
                <Plus size={11} /> Create
              </button>
              <button style={{
                background: 'rgba(0,119,200,0.25)', border: 'none',
                borderLeft: '1px solid rgba(0,119,200,0.50)',
                padding: '5px 7px', cursor: 'pointer', color: '#fff',
              }}>
                <ChevronDown size={10} />
              </button>
            </div>
            <QuickActionsMenu items={[
              { iconKey: 'UserPlus',        label: 'Add User'               },
              { iconKey: 'UserCog',         label: 'Create Role'            },
              { iconKey: 'SlidersHorizontal',label: 'System Settings'       },
              { iconKey: 'ClipboardList',   label: 'View Audit Logs'        },
              { iconKey: 'Ticket',          label: 'Create Support Ticket'  },
            ]} />
          </div>
        </div>

        {/* ── Scrollable body ────────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: GAP }}>

          {/* ── 7 KPI cards ─────────────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: GAP }}>
            {KPIS.map(k => <KpiCard key={k.label} {...k} />)}
          </div>

          {/* ── Row 1: User Activity | Users by Role | System Health | Recent Activity ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.78fr 0.9fr', gap: GAP, alignItems: 'start' }}>

            {/* User Activity */}
            <div style={CARD}>
              <div style={CARD_HDR}>
                <span style={CARD_TITLE}>User Activity (Last 7 Days)</span>
                <button style={DROPDOWN_BTN}>Last 7 Days <ChevronDown size={9} /></button>
              </div>
              <div style={{ padding: '10px 14px 8px' }}>
                <UserActivityChart data={USER_ACTIVITY} height={155} />
              </div>
              <div style={{ padding: '0 14px 10px' }}>
                <a href="#" style={LINK_STYLE}>View full analytics →</a>
              </div>
            </div>

            {/* Users by Role */}
            <div style={{ ...CARD, display: 'flex', flexDirection: 'column' }}>
              <div style={CARD_HDR}><span style={CARD_TITLE}>Users by Role</span></div>
              <div style={{ padding: '12px 14px 6px' }}>
                <DonutChart
                  data={USERS_BY_ROLE}
                  centerLabel="1,248"
                  centerSublabel="Total Users"
                  height={160}
                  innerRadius={48}
                  outerRadius={70}
                />
              </div>
              <div style={{ padding: '0 14px 10px' }}>
                <a href="#" style={LINK_STYLE}>Manage roles →</a>
              </div>
            </div>

            {/* System Health */}
            <div style={{ ...CARD, display: 'flex', flexDirection: 'column' }}>
              <div style={CARD_HDR}><span style={CARD_TITLE}>System Health</span></div>
              <div style={{ padding: '4px 0 4px' }}>
                <StatRowList items={healthItems} />
              </div>
              <div style={{ padding: '6px 14px 10px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <a href="#" style={LINK_STYLE}>View system status →</a>
              </div>
            </div>

            {/* Recent Activity */}
            <ListCard
              title="Recent Activity"
              viewAllHref="#"
              items={RECENT_ACTIVITY}
              variant="alerts"
            />
          </div>

          {/* ── Row 2: Recent Users | System Resource Usage | Security Overview ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 0.85fr 1fr', gap: GAP, alignItems: 'start' }}>

            {/* Recent Users */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <DataTable
                title="Recent Users"
                viewAllHref="#"
                viewAllLabel="View all"
                columns={USER_COLS}
                data={RECENT_USERS}
                keyField="id"
                compact
              />
              <a href="#" style={{ ...LINK_STYLE, paddingLeft: 2 }}>Manage users →</a>
            </div>

            {/* System Resource Usage */}
            <div style={CARD}>
              <div style={CARD_HDR}><span style={CARD_TITLE}>System Resource Usage</span></div>
              <div style={{ padding: '12px 14px 8px' }}>
                <HorizontalBarList
                  items={SYSTEM_RESOURCE_USAGE}
                  maxValue={100}
                  unit="%"
                  labelWidth={80}
                />
              </div>
              <div style={{ padding: '4px 14px 10px' }}>
                <a href="#" style={LINK_STYLE}>View details</a>
              </div>
            </div>

            {/* Security Overview */}
            <div style={{ ...CARD, display: 'flex', flexDirection: 'column' }}>
              <div style={CARD_HDR}>
                <span style={CARD_TITLE}>Security Overview</span>
                <a href="#" style={VIEW_ALL}>View report</a>
              </div>
              <div style={{ padding: '4px 0 4px' }}>
                <StatRowList items={securityItems} />
              </div>
            </div>
          </div>

          {/* ── Row 3: Audit Logs | Storage Overview | Support Tickets | Licenses ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.85fr 0.75fr 0.9fr', gap: GAP, alignItems: 'start', paddingBottom: 20 }}>

            {/* Audit Logs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <DataTable
                title="Audit Logs (Latest)"
                viewAllHref="#"
                viewAllLabel="View all"
                columns={AUDIT_COLS}
                data={AUDIT_LOGS}
                keyField="id"
                compact
              />
              <a href="#" style={{ ...LINK_STYLE, paddingLeft: 2 }}>View all audit logs →</a>
            </div>

            {/* Storage Overview */}
            <div style={{ ...CARD, display: 'flex', flexDirection: 'column' }}>
              <div style={CARD_HDR}>
                <span style={CARD_TITLE}>Storage Overview</span>
                <a href="#" style={VIEW_ALL}>View details</a>
              </div>
              <div style={{ padding: '12px 14px 8px' }}>
                <DonutChart
                  data={STORAGE_OVERVIEW.breakdown}
                  centerLabel={STORAGE_OVERVIEW.totalUsedTb}
                  centerUnit=" TB"
                  centerSublabel="Total Used"
                  height={155}
                  innerRadius={46}
                  outerRadius={66}
                />
              </div>
            </div>

            {/* Support Tickets */}
            <div style={{ ...CARD, display: 'flex', flexDirection: 'column' }}>
              <div style={CARD_HDR}><span style={CARD_TITLE}>Support Tickets</span></div>
              <div style={{ padding: '4px 0 4px' }}>
                <StatRowList items={ticketItems} />
              </div>
              <div style={{ padding: '6px 14px 10px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <a href="#" style={LINK_STYLE}>Create Ticket →</a>
              </div>
            </div>

            {/* Licenses & Usage */}
            <div style={{ ...CARD, display: 'flex', flexDirection: 'column' }}>
              <div style={CARD_HDR}>
                <span style={CARD_TITLE}>Licenses &amp; Usage</span>
                <a href="#" style={VIEW_ALL}>View details</a>
              </div>
              <div style={{ padding: '4px 0 4px' }}>
                <StatRowList items={licenseItems} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

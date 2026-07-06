// ─── KPI Cards (7) ────────────────────────────────────────────────────────────
export const KPIS = [
  { label: 'Total Users',    value: '1,248', unit: '',     delta: '↑5.2% vs last month',  up: true,  iconKey: 'activity',    color: '#0077C8', bg: 'rgba(0,119,200,0.15)',   seed: 81 },
  { label: 'Active Users',   value: 986,     unit: '',     delta: '↑8.7% vs last month',  up: true,  iconKey: 'building',    color: '#00A36C', bg: 'rgba(0,163,108,0.15)',   seed: 82 },
  { label: 'Roles',          value: 28,      unit: '',     delta: '↑2 vs last month',     up: true,  iconKey: 'layers',      color: '#7C3AED', bg: 'rgba(124,58,237,0.15)',  seed: 83 },
  { label: 'Organizations',  value: 42,      unit: '',     delta: '↑1 vs last month',     up: true,  iconKey: 'building',    color: '#06B6D4', bg: 'rgba(6,182,212,0.15)',   seed: 84 },
  { label: 'System Uptime',  value: '99.93', unit: '%',    delta: '↑0.15% vs last month', up: true,  iconKey: 'zap',         color: '#00A36C', bg: 'rgba(0,163,108,0.15)',   seed: 85 },
  { label: 'Open Tickets',   value: 23,      unit: '',     delta: '↓4 vs last month',     up: true,  iconKey: 'timer',       color: '#F59E0B', bg: 'rgba(245,158,11,0.15)',  seed: 86 },
  { label: 'Storage Used',   value: '4.68',  unit: ' TB',  delta: '↑6.3% vs last month',  up: false, iconKey: 'shieldAlert', color: '#7C3AED', bg: 'rgba(124,58,237,0.15)', seed: 87 },
];

// ─── User Activity — last 7 days (May 25–31) ──────────────────────────────────
export const USER_ACTIVITY = [
  { date: 'May 25', activeUsers: 894,  newUsers: 342 },
  { date: 'May 26', activeUsers: 848,  newUsers: 276 },
  { date: 'May 27', activeUsers: 952,  newUsers: 318 },
  { date: 'May 28', activeUsers: 1004, newUsers: 294 },
  { date: 'May 29', activeUsers: 1058, newUsers: 384 },
  { date: 'May 30', activeUsers: 1112, newUsers: 336 },
  { date: 'May 31', activeUsers: 1186, newUsers: 362 },
];

// ─── Users by Role (donut — 1,248 total) ──────────────────────────────────────
export const USERS_BY_ROLE = [
  { name: 'Platform Admin',      value: 28,  pct:  2.2, color: '#7C3AED' },
  { name: 'Asset Manager',       value: 320, pct: 25.6, color: '#0077C8' },
  { name: 'Operations Manager',  value: 245, pct: 19.6, color: '#00A36C' },
  { name: 'Data Analyst',        value: 210, pct: 16.8, color: '#F59E0B' },
  { name: 'Viewer',              value: 380, pct: 30.5, color: '#06B6D4' },
  { name: 'Others',              value: 65,  pct:  5.3, color: '#6B7280' },
];

// ─── System Health (~7 services) ──────────────────────────────────────────────
export const SYSTEM_HEALTH = [
  { label: 'Application Services', status: 'Healthy'  },
  { label: 'Database',             status: 'Healthy'  },
  { label: 'API Gateway',          status: 'Healthy'  },
  { label: 'Integration Services', status: 'Warning'  },
  { label: 'Background Jobs',      status: 'Healthy'  },
  { label: 'File Storage',         status: 'Healthy'  },
  { label: 'Backup Services',      status: 'Healthy'  },
];

// ─── Recent Activity (~5 items) ───────────────────────────────────────────────
export const RECENT_ACTIVITY = [
  { color: '#0077C8', title: 'User Anoushka Sharma created',         sub: 'New user John Doe',           ago: '10:15 AM'   },
  { color: '#7C3AED', title: "Role 'Asset Manager' updated",         sub: 'Permissions modified',        ago: '09:42 AM'   },
  { color: '#F59E0B', title: 'System setting updated',               sub: 'Session timeout changed',     ago: '09:30 AM'   },
  { color: '#00A36C', title: "Integration 'ServiceNow' connected",   sub: 'Connection established',      ago: 'Yesterday'  },
  { color: '#06B6D4', title: 'Backup completed successfully',        sub: 'Daily backup completed',      ago: 'Yesterday'  },
];

// ─── Recent Users (~5 records) ────────────────────────────────────────────────
export const RECENT_USERS = [
  { id: 1, name: 'John Doe',       email: 'john.doe@company.com',      role: 'Asset Manager',      status: 'Active',   lastLogin: 'May 31, 2025 09:15 AM' },
  { id: 2, name: 'Sarah Johnson',  email: 'sarah.j@company.com',       role: 'Operations Manager', status: 'Active',   lastLogin: 'May 31, 2025 08:42 AM' },
  { id: 3, name: 'Mike Chen',      email: 'mike.chen@company.com',     role: 'Data Analyst',       status: 'Active',   lastLogin: 'May 31, 2025 07:58 AM' },
  { id: 4, name: 'Priya Patel',    email: 'priya.patel@company.com',   role: 'Viewer',             status: 'Active',   lastLogin: 'May 31, 2025 07:30 AM' },
  { id: 5, name: 'Alex Rodriguez', email: 'alex.r@company.com',        role: 'Asset Manager',      status: 'Inactive', lastLogin: 'May 30, 2025 06:20 PM' },
];

// ─── System Resource Usage ────────────────────────────────────────────────────
export const SYSTEM_RESOURCE_USAGE = [
  { label: 'CPU Usage',     value: 42, color: '#00A36C' },
  { label: 'Memory Usage',  value: 61, color: '#F59E0B' },
  { label: 'Storage Usage', value: 68, color: '#F59E0B' },
  { label: 'Network I/O',   value: 35, color: '#0077C8' },
];

// ─── Security Overview ────────────────────────────────────────────────────────
export const SECURITY_OVERVIEW = [
  { label: 'Failed Login Attempts (7 days)', value: 128,   delta: '↓18%', deltaUp: true  },
  { label: 'MFA Enabled Users',              value: 892,   delta: '↑12%', deltaUp: true  },
  { label: 'Active Sessions',                value: 1145,  delta: '↑8%',  deltaUp: false },
  { label: 'Password Expiry (30 days)',       value: 67,    delta: '↓5%',  deltaUp: true  },
  { label: 'High Risk Users',                value: 3,     delta: 'No change', deltaUp: null },
];

// ─── Audit Logs (~5 records) ──────────────────────────────────────────────────
export const AUDIT_LOGS = [
  { id: 1, time: 'May 31, 2025 10:15 AM', user: 'Anoushka Sharma', action: 'Created User',   resource: 'User: john.doe@company.com', ipAddress: '192.168.1.45'  },
  { id: 2, time: 'May 31, 2025 09:42 AM', user: 'System',          action: 'Updated Role',   resource: 'Role: Asset Manager',        ipAddress: '192.168.1.10'  },
  { id: 3, time: 'May 31, 2025 09:30 AM', user: 'Anoushka Sharma', action: 'Updated Setting',resource: 'Session Timeout',            ipAddress: '192.168.1.45'  },
  { id: 4, time: 'May 31, 2025 09:25 AM', user: 'System',          action: 'Login Success',  resource: 'anoushka@company.com',       ipAddress: '192.168.1.45'  },
  { id: 5, time: 'May 31, 2025 09:10 AM', user: 'Mike Chen',       action: 'Export Data',    resource: 'Asset Report',               ipAddress: '192.168.1.178' },
];

// ─── Storage Overview ─────────────────────────────────────────────────────────
export const STORAGE_OVERVIEW = {
  totalUsedTb: '4.68',
  breakdown: [
    { name: 'Documents', value: 1.82, pct: 38.9, color: '#0077C8' },
    { name: 'Reports',   value: 1.25, pct: 26.7, color: '#7C3AED' },
    { name: 'Logs',      value: 0.78, pct: 16.7, color: '#F59E0B' },
    { name: 'Backups',   value: 0.61, pct: 13.0, color: '#06B6D4' },
    { name: 'Others',    value: 0.22, pct:  4.7, color: '#6B7280' },
  ],
};

// ─── Support Tickets ──────────────────────────────────────────────────────────
export const SUPPORT_TICKETS = [
  { severity: 'Critical', count: 4,  delta: '↑1 vs last week', deltaUp: false, color: '#EF4444' },
  { severity: 'High',     count: 8,  delta: 'No change',        deltaUp: null,  color: '#F59E0B' },
  { severity: 'Medium',   count: 7,  delta: '↓2 vs last week', deltaUp: true,  color: '#F97316' },
  { severity: 'Low',      count: 4,  delta: '↓1 vs last week', deltaUp: true,  color: '#3B82F6' },
];

// ─── Licenses & Usage ─────────────────────────────────────────────────────────
export const LICENSES_USAGE = {
  totalLicenses:      2000,
  usedLicenses:       1248,
  usedPct:            62.4,
  availableLicenses:  752,
  availablePct:       37.6,
  licenseExpiry:      'Dec 31, 2025',
  autoRenewal:        true,
};

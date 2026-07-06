// ─── KPI cards (6) ────────────────────────────────────────────────────────────
export const KPIS = [
  { label: 'Total Integrations',      value: 84,      unit: '',     sublabel: '',      delta: '↑6 vs last month',       up: true,  iconKey: 'layers',      color: '#0077C8', bg: 'rgba(0,119,200,0.15)',   seed: 11 },
  { label: 'Active Connections',      value: 76,      unit: '',     sublabel: '90.5%', delta: '↑12 vs last month',      up: true,  iconKey: 'activity',    color: '#00A36C', bg: 'rgba(0,163,108,0.15)',   seed: 22 },
  { label: 'Data Flows',              value: 132,     unit: '',     sublabel: '',      delta: '↑12 vs last month',      up: true,  iconKey: 'zap',         color: '#0077C8', bg: 'rgba(0,119,200,0.15)',   seed: 33 },
  { label: 'Successful Transactions', value: '98.7',  unit: '%',    sublabel: '',      delta: '↑1.8% vs last month',    up: true,  iconKey: 'leaf',        color: '#00A36C', bg: 'rgba(0,163,108,0.15)',   seed: 44 },
  { label: 'Failed Transactions',     value: '1.3',   unit: '%',    sublabel: '',      delta: '↓0.6% vs last month',    up: false, iconKey: 'shieldAlert', color: '#EF4444', bg: 'rgba(239,68,68,0.15)',   seed: 55 },
  { label: 'Avg Response Time',       value: 412,     unit: ' ms',  sublabel: '',      delta: '↓68 ms vs last month',   up: true,  iconKey: 'timer',       color: '#0077C8', bg: 'rgba(0,119,200,0.15)',   seed: 66 },
];

// ─── Integration Health donut ──────────────────────────────────────────────────
export const INTEGRATION_HEALTH = [
  { name: 'Healthy',  value: 62, pct: 73.8, color: '#00A36C' },
  { name: 'Warning',  value: 14, pct: 16.7, color: '#F59E0B' },
  { name: 'Critical', value: 5,  pct:  6.0, color: '#EF4444' },
  { name: 'Inactive', value: 3,  pct:  3.6, color: '#6B7280' },
];

// ─── Integrations by Category donut ───────────────────────────────────────────
export const INTEGRATIONS_BY_CATEGORY = [
  { name: 'IT Systems',      value: 28, pct: 33.3, color: '#0077C8' },
  { name: 'Cloud Services',  value: 20, pct: 23.8, color: '#7C3AED' },
  { name: 'Enterprise Apps', value: 18, pct: 21.4, color: '#06B6D4' },
  { name: 'Data Sources',    value: 10, pct: 11.9, color: '#F59E0B' },
  { name: 'Others',          value: 8,  pct:  9.6, color: '#6B7280' },
];

// ─── Transactions Trend (dual-series, May 25-31) ───────────────────────────────
export const TRANSACTIONS_TREND = [
  { date: 'May 25', successful: 68420, failed: 2140 },
  { date: 'May 26', successful: 72890, failed: 1860 },
  { date: 'May 27', successful: 71340, failed: 3200 },
  { date: 'May 28', successful: 79450, failed: 2890 },
  { date: 'May 29', successful: 82110, failed: 1540 },
  { date: 'May 30', successful: 88760, failed: 2310 },
  { date: 'May 31', successful: 91420, failed: 1980 },
];

// ─── Top Integrations (~8 records) ────────────────────────────────────────────
export const TOP_INTEGRATIONS = [
  { name: 'ServiceNow',    sublabel: 'ITSM',          logoIcon: 'ClipboardList', logoColor: '#00A36C', statusColor: '#00A36C', successRatePct: 99.2, responseTimeMs: 320 },
  { name: 'SAP S/4HANA',  sublabel: 'ERP',            logoIcon: 'Database',      logoColor: '#0077C8', statusColor: '#00A36C', successRatePct: 98.6, responseTimeMs: 450 },
  { name: 'Maximo',        sublabel: 'EAM',            logoIcon: 'Wrench',        logoColor: '#06B6D4', statusColor: '#00A36C', successRatePct: 97.8, responseTimeMs: 510 },
  { name: 'Azure IoT Hub', sublabel: 'IoT Platform',   logoIcon: 'Radio',         logoColor: '#0EA5E9', statusColor: '#00A36C', successRatePct: 99.5, responseTimeMs: 280 },
  { name: 'Power BI',      sublabel: 'Analytics',      logoIcon: 'BarChart2',     logoColor: '#F59E0B', statusColor: '#00A36C', successRatePct: 98.9, responseTimeMs: 210 },
  { name: 'Salesforce',    sublabel: 'CRM',            logoIcon: 'Users',         logoColor: '#7C3AED', statusColor: '#F59E0B', successRatePct: 96.4, responseTimeMs: 620 },
  { name: 'CMDB',          sublabel: 'Configuration',  logoIcon: 'Settings',      logoColor: '#6B7280', statusColor: '#F59E0B', successRatePct: 94.2, responseTimeMs: 380 },
  { name: 'AWS Cost Exp.', sublabel: 'Cloud Cost',     logoIcon: 'Cloud',         logoColor: '#F97316', statusColor: '#00A36C', successRatePct: 99.1, responseTimeMs: 340 },
];

// ─── Integration Map ───────────────────────────────────────────────────────────
// xPct/yPct = node center as % of the diagram container (600×240 SVG viewBox)
export const INTEGRATION_MAP_NODES = [
  { key: 'datasources',  label: 'Data Sources',     count: 12, health: 'Healthy', healthColor: '#00A36C', iconKey: 'Database', xPct: 14, yPct: 13 },
  { key: 'apis',         label: 'APIs & Endpoints',  count: 24, health: 'Healthy', healthColor: '#00A36C', iconKey: 'Link',     xPct: 72, yPct: 11 },
  { key: 'destinations', label: 'Destinations',      count: 10, health: 'Healthy', healthColor: '#00A36C', iconKey: 'Server',   xPct: 88, yPct: 44 },
  { key: 'ext',          label: 'External Systems',  count: 16, health: 'Warning', healthColor: '#F59E0B', iconKey: 'Globe',    xPct: 76, yPct: 78 },
  { key: 'enterprise',   label: 'Enterprise Apps',   count: 18, health: 'Healthy', healthColor: '#00A36C', iconKey: 'Boxes',    xPct: 26, yPct: 80 },
  { key: 'cloud',        label: 'Cloud Services',    count: 20, health: 'Healthy', healthColor: '#00A36C', iconKey: 'Cloud',    xPct: 10, yPct: 49 },
];

// ─── Integration Activity ─────────────────────────────────────────────────────
export const INTEGRATION_ACTIVITY = [
  { color: '#00A36C', title: 'Asset Master Sync completed successfully',       time: '2 min ago'  },
  { color: '#F59E0B', title: 'High error rate detected in Vendor Data Import', time: '15 min ago' },
  { color: '#0077C8', title: "New integration 'AWS Cost Explorer' added",       time: '1 hr ago'   },
  { color: '#7C3AED', title: "API endpoint '/assets' version updated to v2.1",  time: '2 hrs ago'  },
  { color: '#F59E0B', title: 'CMDB Sync flow paused by System',                time: '3 hrs ago'  },
];

// ─── Data Flows (~7 records) ───────────────────────────────────────────────────
export const DATA_FLOWS = [
  { id: 1,  flowName: 'Asset Master Sync',    source: 'Maximo',        destination: 'SAP S/4HANA', status: 'Success', lastRun: '2 min ago'  },
  { id: 2,  flowName: 'Work Order Updates',   source: 'ServiceNow',    destination: 'Maximo',      status: 'Success', lastRun: '5 min ago'  },
  { id: 3,  flowName: 'Financial Data Sync',  source: 'SAP S/4HANA',  destination: 'Power BI',    status: 'Success', lastRun: '10 min ago' },
  { id: 4,  flowName: 'IoT Telemetry Stream', source: 'Azure IoT Hub', destination: 'Data Lake',   status: 'Success', lastRun: '1 min ago'  },
  { id: 5,  flowName: 'CMDB Sync',            source: 'ServiceNow',    destination: 'CMDB',        status: 'Warning', lastRun: '15 min ago' },
  { id: 6,  flowName: 'Vendor Data Import',   source: 'External API',  destination: 'EAI Platform', status: 'Success', lastRun: '30 min ago' },
  { id: 7,  flowName: 'HR Data Feed',         source: 'Workday',       destination: 'SAP S/4HANA', status: 'Success', lastRun: '45 min ago' },
];

// ─── API Health (~5 records) ───────────────────────────────────────────────────
export const API_HEALTH = [
  { id: 1, apiName: 'Assets API',      statusColor: '#00A36C', availabilityPct: 99.8, avgResponseTimeMs: 210 },
  { id: 2, apiName: 'Work Orders API', statusColor: '#00A36C', availabilityPct: 99.6, avgResponseTimeMs: 325 },
  { id: 3, apiName: 'Locations API',   statusColor: '#00A36C', availabilityPct: 99.9, avgResponseTimeMs: 180 },
  { id: 4, apiName: 'Finance API',     statusColor: '#F59E0B', availabilityPct: 98.5, avgResponseTimeMs: 410 },
  { id: 5, apiName: 'Vendors API',     statusColor: '#00A36C', availabilityPct: 99.7, avgResponseTimeMs: 260 },
];

// ─── Error Analysis ────────────────────────────────────────────────────────────
export const ERROR_ANALYSIS = {
  totalErrors:    1248,
  deltaPct:       -18,
  criticalErrors: 124,
  warningErrors:  432,
  errorsByCategory: [
    { name: 'Data Validation', value: 474, pct: 38, color: '#0077C8' },
    { name: 'Authentication',  value: 299, pct: 24, color: '#F59E0B' },
    { name: 'Timeout',         value: 224, pct: 18, color: '#06B6D4' },
    { name: 'System',          value: 150, pct: 12, color: '#EF4444' },
    { name: 'Others',          value: 101, pct:  8, color: '#6B7280' },
  ],
};

// ─── Integration Uptime ───────────────────────────────────────────────────────
export const INTEGRATION_UPTIME = {
  overallPct: 99.3,
  services: [
    { name: 'ServiceNow',    uptimePct: 99.6 },
    { name: 'Maximo',        uptimePct: 99.2 },
    { name: 'SAP S/4HANA',  uptimePct: 98.9 },
    { name: 'Azure IoT Hub', uptimePct: 99.7 },
    { name: 'Power BI',      uptimePct: 99.5 },
  ],
};

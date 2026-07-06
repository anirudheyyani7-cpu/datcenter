// ── EAI Platform mock data ─────────────────────────────────────────────────
// Single source of truth for all numbers rendered in the EAI dashboard.
// Swap individual exports for real API calls when ready.

export const eaiKpis = [
  {
    key: 'facilities',
    label: 'Total Facilities',
    value: '29',
    sublabel: 'Across 14 countries',
    delta: '▲3 this month',
    up: true,
    iconKey: 'building',
    color: '#0077C8',
    bg: 'rgba(0,119,200,0.14)',
    seed: 11,
  },
  {
    key: 'assets',
    label: 'Total Assets',
    value: '21,342',
    sublabel: 'Across all facilities',
    delta: '▲482 this month',
    up: true,
    iconKey: 'layers',
    color: '#00A36C',
    bg: 'rgba(0,163,108,0.14)',
    seed: 22,
  },
  {
    key: 'capacity',
    label: 'Total Capacity',
    value: '2,134',
    unit: 'MW',
    sublabel: 'IT Power Capacity',
    delta: '▲4.2% vs last month',
    up: true,
    iconKey: 'zap',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.14)',
    seed: 33,
  },
  {
    key: 'utilization',
    label: 'Utilization',
    value: '72',
    unit: '%',
    sublabel: 'Average Utilization',
    delta: '▼1.8% vs last month',
    up: false,
    iconKey: 'timer',
    color: '#EAB308',
    bg: 'rgba(234,179,8,0.14)',
    seed: 44,
  },
  {
    key: 'health',
    label: 'Health Score',
    value: '89',
    unit: '/100',
    sublabel: 'Average Health',
    delta: '▲2.3 vs last month',
    up: true,
    iconKey: 'activity',
    color: '#00A36C',
    bg: 'rgba(0,163,108,0.14)',
    seed: 55,
  },
  {
    key: 'pue',
    label: 'PUE (Avg)',
    value: '1.32',
    sublabel: 'Power Usage Effectiveness',
    delta: '▼0.04 vs last month',
    up: true,
    iconKey: 'droplets',
    color: '#38BDF8',
    bg: 'rgba(56,189,248,0.14)',
    seed: 66,
  },
  {
    key: 'renewable',
    label: 'Renewable %',
    value: '76',
    unit: '%',
    sublabel: 'Renewable Energy',
    delta: '▲5% vs last month',
    up: true,
    iconKey: 'leaf',
    color: '#34D399',
    bg: 'rgba(52,211,153,0.14)',
    seed: 77,
  },
  {
    key: 'alerts',
    label: 'Active Alerts',
    value: '24',
    sublabel: 'Requires Attention',
    delta: '▲6 vs last month',
    up: false,
    iconKey: 'shieldAlert',
    color: '#DC2626',
    bg: 'rgba(220,38,38,0.14)',
    seed: 88,
  },
];

export const eaiCapacityByRegion = [
  { name: 'APAC',          mw: 714, pct: 33, color: '#7C3AED' },
  { name: 'EMEA',          mw: 612, pct: 29, color: '#0077C8' },
  { name: 'Americas',      mw: 498, pct: 23, color: '#00A36C' },
  { name: 'North America', mw: 210, pct: 10, color: '#D4A017' },
  { name: 'Latin America', mw: 60,  pct: 3,  color: '#DC2626' },
  { name: 'Middle East',   mw: 40,  pct: 2,  color: '#6B7280' },
];

export const eaiAiBriefing = {
  paragraphs: [
    'Overall portfolio health remains strong with 89/100 average score. Capacity utilization is optimal at 72%. Singapore and Hamina facilities are performing above average in sustainability metrics.',
    'Key risks identified in Mumbai DC due to high utilization (92%) and aging assets approaching EOL.',
    'Recommended actions available in Intelligence Center.',
  ],
  linkText: 'Intelligence Center',
  linkHref: '/eai/intelligence-center',
};

export const eaiUtilizationTrend = [
  { week: 'Apr 21', value: 70 },
  { week: 'Apr 28', value: 73 },
  { week: 'May 5',  value: 68 },
  { week: 'May 12', value: 75 },
  { week: 'May 19', value: 72 },
];

export const eaiPueTrend = [
  { week: 'Apr 21', value: 1.38 },
  { week: 'Apr 28', value: 1.35 },
  { week: 'May 5',  value: 1.36 },
  { week: 'May 12', value: 1.33 },
  { week: 'May 19', value: 1.32 },
];

export const eaiRenewableByRegion = [
  { name: 'APAC',    value: 68 },
  { name: 'EMEA',    value: 89 },
  { name: 'Americas',value: 72 },
  { name: 'North',   value: 55 },
  { name: 'LATAM',   value: 48 },
  { name: 'Middle',  value: 32 },
];

export const eaiAssetStatus = [
  { name: 'Operational', value: 17842, pct: 83, color: '#00A36C' },
  { name: 'Maintenance',  value: 1642,  pct: 8,  color: '#D4A017' },
  { name: 'Deployed',     value: 1128,  pct: 5,  color: '#0077C8' },
  { name: 'Retired',      value: 730,   pct: 3,  color: '#6B7280' },
  { name: 'Unknown',      value: 0,     pct: 0,  color: '#374151' },
];

export const eaiCriticalAlerts = [
  { title: 'High Power Usage',      sub: 'Mumbai DC · Building A',    color: '#DC2626', ago: '2 min ago'  },
  { title: 'Cooling Unit Failure',  sub: 'Singapore Campus · Bldg 3', color: '#F59E0B', ago: '15 min ago' },
  { title: 'Asset EOL Approaching', sub: 'Hamina DC · Rack R12',      color: '#D4A017', ago: '1 hr ago'   },
];

export const eaiRecentNews = [
  { title: 'Carbon announces new carbon-free DC in Finland', ago: '2 hrs ago',  cat: 'Sustainability' },
  { title: 'Expansion at Singapore Campus Building 4',       ago: '5 hrs ago',  cat: 'Infrastructure' },
  { title: 'New renewable energy agreement in Texas',        ago: '1 day ago',  cat: 'Energy'         },
];

export const eaiUpcomingMaintenance = [
  { asset: 'Cooling Tower CT-12', facility: 'Singapore DC', type: 'Preventive',  date: 'May 22, 2025', priority: 'Medium', pc: '#D4A017' },
  { asset: 'UPS System A',        facility: 'Mumbai DC',    type: 'Maintenance', date: 'May 23, 2025', priority: 'High',   pc: '#DC2626' },
  { asset: 'Generator G-03',      facility: 'Hamina DC',    type: 'Inspection',  date: 'May 25, 2025', priority: 'Medium', pc: '#D4A017' },
];

export const eaiDemandPlanning = [
  { label: 'Assets EOL Next 12 Months',   value: '342',    unit: '',    delta: '▲12 this month',      up: false, progress: null },
  { label: 'CapEx Required (Next 12 Mo)', value: '$24.8M', unit: '',    delta: '▲8.5% vs last month', up: true,  progress: null },
  { label: 'Lead Time Risk >16 weeks',    value: '17',     unit: 'Assets', delta: '▲3 this month',   up: false, progress: null },
  { label: 'Budget Utilization',          value: '68',     unit: '%',   delta: '▲4% vs last month',  up: true,  progress: 68  },
];

export const eaiEsgMetrics = [
  { label: 'Carbon Emissions', value: '12,842', unit: 'avg tCO₂e / month', delta: '▼6.2% vs Apr', up: false, iconKey: 'leaf',     color: '#DC2626' },
  { label: 'Water Usage',      value: '95,230', unit: 'kl / month',         delta: '▼3.1% vs Apr', up: false, iconKey: 'droplets', color: '#0077C8' },
  { label: 'Waste Recycled',   value: '67',     unit: '%',                  delta: '▲5% vs last month', up: true, iconKey: 'recycle', color: '#00A36C' },
];

// Map cluster markers (grouped by region for the placeholder map)
export const eaiMapClusters = [
  { id: 'americas',  lat: 37.7,  lon: -98.0,  count: 8, status: 'warning',  label: 'Americas'     },
  { id: 'europe',    lat: 51.2,  lon: 4.5,    count: 5, status: 'optimal',  label: 'Europe'       },
  { id: 'asia-east', lat: 25.1,  lon: 121.6,  count: 6, status: 'critical', label: 'East Asia'    },
  { id: 'asia-se',   lat: 1.3,   lon: 103.8,  count: 7, status: 'optimal',  label: 'SE Asia'      },
  { id: 'africa',    lat: -1.3,  lon: 36.8,   count: 2, status: 'warning',  label: 'Africa/ME'    },
  { id: 'australia', lat: -33.9, lon: 151.2,  count: 1, status: 'good',     label: 'Australia'    },
];

export const MAP_LEGEND = [
  { label: 'Optimal (80-100)', color: '#00A36C' },
  { label: 'Good (60-80)',     color: '#0077C8' },
  { label: 'Warning (40-60)', color: '#D4A017' },
  { label: 'Critical (0-40)', color: '#DC2626' },
  { label: 'Maintenance',      color: '#6B7280' },
];

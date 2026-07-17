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
  { name: 'APAC',          mw: 714, pct: 33, color: '#00338D' },
  { name: 'EMEA',          mw: 612, pct: 29, color: '#0091DA' },
  { name: 'Americas',      mw: 498, pct: 23, color: '#69B1E3' },
  { name: 'North America', mw: 210, pct: 10, color: '#00A36C' },
  { name: 'Latin America', mw: 60,  pct: 3,  color: '#6F2C91' },
  { name: 'Middle East',   mw: 40,  pct: 2,  color: '#D4A017' },
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
  {
    id: 'alert-1', title: 'High Power Usage', sub: 'Mumbai DC · Building A', color: '#DC2626', ago: '2 min ago',
    severity: 'Critical', assetId: 'PDU-MUM-014', detectedAt: 'May 20, 2025 · 09:42 AM',
    description: 'Power draw on PDU-MUM-014 has exceeded 94% of rated capacity for over 20 minutes, driven by elevated compute load during the Mumbai DC utilization peak.',
    recommendedAction: 'Rebalance load across adjacent PDUs and confirm cooling headroom before the next scheduled batch job.',
  },
  {
    id: 'alert-2', title: 'Cooling Unit Failure', sub: 'Singapore Campus · Bldg 3', color: '#F59E0B', ago: '15 min ago',
    severity: 'High', assetId: 'CRAC-SIN-B3-07', detectedAt: 'May 20, 2025 · 09:29 AM',
    description: 'CRAC unit CRAC-SIN-B3-07 has dropped offline; redundant units are compensating but N+1 cooling redundancy is currently degraded in Building 3.',
    recommendedAction: 'Dispatch facilities technician to inspect compressor fault code E-42 and restore redundancy within SLA window.',
  },
  {
    id: 'alert-3', title: 'Asset EOL Approaching', sub: 'Hamina DC · Rack R12', color: '#D4A017', ago: '1 hr ago',
    severity: 'Medium', assetId: 'RACK-HAM-R12', detectedAt: 'May 20, 2025 · 08:44 AM',
    description: '6 assets in Rack R12 are within 60 days of end-of-life per the lifecycle policy, including 2 storage arrays flagged for warranty expiration.',
    recommendedAction: 'Open a refresh work order in Asset Lifecycle and confirm replacement lead times with procurement.',
  },
];

export const eaiRecentNews = [
  {
    id: 'news-1', title: 'Carbon announces new carbon-free DC in Finland', ago: '2 hrs ago', cat: 'Sustainability',
    body: 'The Hamina campus will add a fourth building targeting 100% carbon-free energy matching, extending the site\'s existing seawater cooling infrastructure. Construction is expected to begin in Q3 with commissioning targeted for late next year.',
  },
  {
    id: 'news-2', title: 'Expansion at Singapore Campus Building 4', ago: '5 hrs ago', cat: 'Infrastructure',
    body: 'Building 4 has completed its power-on milestone, adding 38 MW of IT capacity to the Singapore Campus. The new building brings the campus total to 4 buildings and reinforces APAC capacity ahead of projected demand growth.',
  },
  {
    id: 'news-3', title: 'New renewable energy agreement in Texas', ago: '1 day ago', cat: 'Energy',
    body: 'A new 15-year power purchase agreement for 180 MW of wind capacity has been signed to support the Americas region, part of the broader push toward the portfolio\'s renewable energy targets.',
  },
];

export const eaiUpcomingMaintenance = [
  {
    id: 'maint-1', asset: 'Cooling Tower CT-12', facility: 'Singapore DC', type: 'Preventive', date: 'May 22, 2025', priority: 'Medium', pc: '#D4A017',
    workOrderId: 'WO-8821', technician: 'Priya Nair', durationHrs: 4,
    notes: 'Routine preventive maintenance — inspect fill media, verify fan bearings, and check water treatment chemistry.',
  },
  {
    id: 'maint-2', asset: 'UPS System A', facility: 'Mumbai DC', type: 'Maintenance', date: 'May 23, 2025', priority: 'High', pc: '#DC2626',
    workOrderId: 'WO-8834', technician: 'Rahul Mehta', durationHrs: 6,
    notes: 'Battery string replacement following degraded runtime test results from last quarterly inspection.',
  },
  {
    id: 'maint-3', asset: 'Generator G-03', facility: 'Hamina DC', type: 'Inspection', date: 'May 25, 2025', priority: 'Medium', pc: '#D4A017',
    workOrderId: 'WO-8840', technician: 'Elias Virtanen', durationHrs: 3,
    notes: 'Annual load-bank test and fuel system inspection ahead of winter readiness review.',
  },
];

export const eaiDemandPlanning = [
  {
    label: 'Assets EOL Next 12 Months', value: '342', unit: '', delta: '▲12 this month', up: false, progress: null,
    breakdown: [
      { label: 'IT Hardware',       value: 154 },
      { label: 'Storage',           value: 88  },
      { label: 'Network Equipment', value: 61  },
      { label: 'Power & Cooling',   value: 39  },
    ],
  },
  {
    label: 'CapEx Required (Next 12 Mo)', value: '$24.8M', unit: '', delta: '▲8.5% vs last month', up: true, progress: null,
    breakdown: [
      { label: 'Asset Refresh',      value: '$14.2M' },
      { label: 'Capacity Expansion', value: '$6.9M'  },
      { label: 'Facilities Upgrade', value: '$3.7M'  },
    ],
  },
  {
    label: 'Lead Time Risk >16 weeks', value: '17', unit: 'Assets', delta: '▲3 this month', up: false, progress: null,
    breakdown: [
      { label: 'GPU Servers',      value: 9 },
      { label: 'Network Switches', value: 5 },
      { label: 'UPS Modules',      value: 3 },
    ],
  },
  {
    label: 'Budget Utilization', value: '68', unit: '%', delta: '▲4% vs last month', up: true, progress: 68,
    breakdown: [
      { label: 'Committed',  value: '68%' },
      { label: 'Forecasted', value: '84%' },
      { label: 'Remaining',  value: '32%' },
    ],
  },
];

export const eaiEsgMetrics = [
  {
    label: 'Carbon Emissions', value: '12,842', unit: 'avg tCO₂e / month', delta: '▼6.2% vs Apr', up: false, iconKey: 'leaf', color: '#DC2626',
    breakdown: [
      { label: 'APAC',    value: '4,520 tCO₂e' },
      { label: 'EMEA',    value: '3,180 tCO₂e' },
      { label: 'Americas',value: '5,142 tCO₂e' },
    ],
  },
  {
    label: 'Water Usage', value: '95,230', unit: 'kl / month', delta: '▼3.1% vs Apr', up: false, iconKey: 'droplets', color: '#0077C8',
    breakdown: [
      { label: 'APAC',    value: '38,410 kl' },
      { label: 'EMEA',    value: '24,900 kl' },
      { label: 'Americas',value: '31,920 kl' },
    ],
  },
  {
    label: 'Waste Recycled', value: '67', unit: '%', delta: '▲5% vs last month', up: true, iconKey: 'recycle', color: '#00A36C',
    breakdown: [
      { label: 'E-Waste',     value: '82%' },
      { label: 'Packaging',   value: '61%' },
      { label: 'General',     value: '54%' },
    ],
  },
];

// Per-region average utilization — companion to eaiCapacityByRegion for the
// "Utilization" KPI drill-down.
export const eaiUtilizationByRegion = [
  { name: 'APAC',          value: 76 },
  { name: 'EMEA',          value: 71 },
  { name: 'Americas',      value: 69 },
  { name: 'North America', value: 74 },
  { name: 'Latin America', value: 58 },
  { name: 'Middle East',   value: 64 },
];

// ── Individual facilities (29 — matches Total Facilities KPI) ────────────────
// Each facility belongs to one map cluster (matches eaiMapClusters pins) and
// one capacity region (matches eaiCapacityByRegion / eaiUtilizationByRegion /
// eaiRenewableByRegion), so the map, the region donut, and the 3D globe can
// all cross-reference the same underlying list.
export const eaiFacilities = [
  // Americas cluster (8)
  { id: 'fac-ash', name: 'Ashburn DC',    city: 'Ashburn',    country: 'USA',    mapClusterId: 'americas', region: 'North America', status: 'warning', capacityMW: 142, utilizationPct: 78, healthScore: 74, lat: 39.04,  lon: -77.49  },
  { id: 'fac-dal', name: 'Dallas DC',     city: 'Dallas',     country: 'USA',    mapClusterId: 'americas', region: 'North America', status: 'warning', capacityMW: 96,  utilizationPct: 71, healthScore: 79, lat: 32.78,  lon: -96.80  },
  { id: 'fac-chi', name: 'Chicago DC',    city: 'Chicago',    country: 'USA',    mapClusterId: 'americas', region: 'North America', status: 'good',    capacityMW: 88,  utilizationPct: 66, healthScore: 84, lat: 41.88,  lon: -87.63  },
  { id: 'fac-tor', name: 'Toronto DC',    city: 'Toronto',    country: 'Canada', mapClusterId: 'americas', region: 'North America', status: 'good',    capacityMW: 64,  utilizationPct: 62, healthScore: 87, lat: 43.65,  lon: -79.38  },
  { id: 'fac-sao', name: 'São Paulo DC',  city: 'São Paulo',  country: 'Brazil', mapClusterId: 'americas', region: 'Latin America', status: 'warning', capacityMW: 38,  utilizationPct: 69, healthScore: 72, lat: -23.55, lon: -46.63  },
  { id: 'fac-san', name: 'Santiago DC',   city: 'Santiago',   country: 'Chile',  mapClusterId: 'americas', region: 'Latin America', status: 'good',    capacityMW: 22,  utilizationPct: 54, healthScore: 88, lat: -33.45, lon: -70.65  },
  { id: 'fac-den', name: 'Denver DC',     city: 'Denver',     country: 'USA',    mapClusterId: 'americas', region: 'Americas',      status: 'warning', capacityMW: 48,  utilizationPct: 73, healthScore: 76, lat: 39.74,  lon: -104.99 },
  { id: 'fac-qro', name: 'Querétaro DC',  city: 'Querétaro',  country: 'Mexico', mapClusterId: 'americas', region: 'Americas',      status: 'good',    capacityMW: 30,  utilizationPct: 60, healthScore: 85, lat: 20.59,  lon: -100.39 },

  // Europe cluster (5) — EMEA
  { id: 'fac-ams', name: 'Amsterdam DC',  city: 'Amsterdam',  country: 'Netherlands', mapClusterId: 'europe', region: 'EMEA', status: 'optimal', capacityMW: 118, utilizationPct: 80, healthScore: 93, lat: 52.37, lon: 4.90   },
  { id: 'fac-fra', name: 'Frankfurt DC',  city: 'Frankfurt',  country: 'Germany',     mapClusterId: 'europe', region: 'EMEA', status: 'optimal', capacityMW: 132, utilizationPct: 83, healthScore: 91, lat: 50.11, lon: 8.68   },
  { id: 'fac-lon', name: 'London DC',     city: 'London',     country: 'UK',          mapClusterId: 'europe', region: 'EMEA', status: 'optimal', capacityMW: 104, utilizationPct: 77, healthScore: 90, lat: 51.51, lon: -0.13  },
  { id: 'fac-ham', name: 'Hamina DC',     city: 'Hamina',     country: 'Finland',     mapClusterId: 'europe', region: 'EMEA', status: 'optimal', capacityMW: 96,  utilizationPct: 74, healthScore: 95, lat: 60.57, lon: 27.20  },
  { id: 'fac-sto', name: 'Stockholm DC',  city: 'Stockholm',  country: 'Sweden',      mapClusterId: 'europe', region: 'EMEA', status: 'good',    capacityMW: 62,  utilizationPct: 68, healthScore: 89, lat: 59.33, lon: 18.07  },

  // Asia East cluster (6) — APAC
  { id: 'fac-tyo', name: 'Tokyo DC',      city: 'Tokyo',      country: 'Japan',       mapClusterId: 'asia-east', region: 'APAC', status: 'critical', capacityMW: 128, utilizationPct: 91, healthScore: 61, lat: 35.68, lon: 139.65 },
  { id: 'fac-osa', name: 'Osaka DC',      city: 'Osaka',      country: 'Japan',       mapClusterId: 'asia-east', region: 'APAC', status: 'warning',  capacityMW: 74,  utilizationPct: 84, healthScore: 70, lat: 34.69, lon: 135.50 },
  { id: 'fac-sel', name: 'Seoul DC',      city: 'Seoul',      country: 'South Korea', mapClusterId: 'asia-east', region: 'APAC', status: 'critical', capacityMW: 90,  utilizationPct: 93, healthScore: 58, lat: 37.57, lon: 126.98 },
  { id: 'fac-hkg', name: 'Hong Kong DC',  city: 'Hong Kong',  country: 'Hong Kong',   mapClusterId: 'asia-east', region: 'APAC', status: 'warning',  capacityMW: 68,  utilizationPct: 87, healthScore: 68, lat: 22.32, lon: 114.17 },
  { id: 'fac-sha', name: 'Shanghai DC',   city: 'Shanghai',   country: 'China',       mapClusterId: 'asia-east', region: 'APAC', status: 'critical', capacityMW: 112, utilizationPct: 95, healthScore: 55, lat: 31.23, lon: 121.47 },
  { id: 'fac-bjs', name: 'Beijing DC',    city: 'Beijing',    country: 'China',       mapClusterId: 'asia-east', region: 'APAC', status: 'warning',  capacityMW: 84,  utilizationPct: 86, healthScore: 66, lat: 39.90, lon: 116.41 },

  // Asia SE cluster (7) — APAC
  { id: 'fac-sin1', name: 'Singapore Campus – Bldg 1', city: 'Singapore', country: 'Singapore',  mapClusterId: 'asia-se', region: 'APAC', status: 'optimal', capacityMW: 76, utilizationPct: 79, healthScore: 92, lat: 1.35,  lon: 103.82 },
  { id: 'fac-sin2', name: 'Singapore Campus – Bldg 2', city: 'Singapore', country: 'Singapore',  mapClusterId: 'asia-se', region: 'APAC', status: 'optimal', capacityMW: 82, utilizationPct: 81, healthScore: 90, lat: 1.34,  lon: 103.83 },
  { id: 'fac-sin3', name: 'Singapore Campus – Bldg 3', city: 'Singapore', country: 'Singapore',  mapClusterId: 'asia-se', region: 'APAC', status: 'good',    capacityMW: 79, utilizationPct: 77, healthScore: 88, lat: 1.36,  lon: 103.81 },
  { id: 'fac-sin4', name: 'Singapore Campus – Bldg 4', city: 'Singapore', country: 'Singapore',  mapClusterId: 'asia-se', region: 'APAC', status: 'optimal', capacityMW: 71, utilizationPct: 75, healthScore: 94, lat: 1.33,  lon: 103.84 },
  { id: 'fac-mum',  name: 'Mumbai DC',                  city: 'Mumbai',    country: 'India',      mapClusterId: 'asia-se', region: 'APAC', status: 'warning', capacityMW: 58, utilizationPct: 92, healthScore: 65, lat: 19.08, lon: 72.88  },
  { id: 'fac-jkt',  name: 'Jakarta DC',                 city: 'Jakarta',   country: 'Indonesia',  mapClusterId: 'asia-se', region: 'APAC', status: 'good',    capacityMW: 34, utilizationPct: 63, healthScore: 86, lat: -6.21, lon: 106.85 },
  { id: 'fac-bkk',  name: 'Bangkok DC',                 city: 'Bangkok',   country: 'Thailand',   mapClusterId: 'asia-se', region: 'APAC', status: 'good',    capacityMW: 29, utilizationPct: 61, healthScore: 87, lat: 13.75, lon: 100.50 },

  // Africa/ME cluster (2) — Middle East
  { id: 'fac-jnb', name: 'Johannesburg DC', city: 'Johannesburg', country: 'South Africa', mapClusterId: 'africa', region: 'Middle East', status: 'warning', capacityMW: 26, utilizationPct: 70, healthScore: 75, lat: -26.20, lon: 28.05 },
  { id: 'fac-dxb', name: 'Dubai DC',        city: 'Dubai',        country: 'UAE',           mapClusterId: 'africa', region: 'Middle East', status: 'warning', capacityMW: 34, utilizationPct: 72, healthScore: 73, lat: 25.20,  lon: 55.27 },

  // Australia cluster (1) — APAC
  { id: 'fac-syd', name: 'Sydney DC', city: 'Sydney', country: 'Australia', mapClusterId: 'australia', region: 'APAC', status: 'good', capacityMW: 52, utilizationPct: 65, healthScore: 89, lat: -33.87, lon: 151.21 },
];

// Distinct map cluster ids that contain at least one facility in the given
// capacity region — used to cross-highlight the matching map pin when a
// region is selected in the Capacity by Region legend.
export function eaiClusterIdsForRegion(regionName) {
  return [...new Set(eaiFacilities.filter(f => f.region === regionName).map(f => f.mapClusterId))];
}

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

// ─── KPIs ─────────────────────────────────────────────────────────────────────
export const IC_KPIS = [
  { key: 'activeInsights',    label: 'Active Insights',        value: '432',     delta: '↑18% vs last month',  up: true,  iconKey: 'activity',    color: '#0077C8', bg: 'rgba(0,119,200,0.15)',    seed: 11 },
  { key: 'criticalRecs',      label: 'Critical Recommendations',value: '27',      delta: '↑8 vs last month',    up: true,  iconKey: 'shieldAlert', color: '#EF4444', bg: 'rgba(239,68,68,0.15)',    seed: 22 },
  { key: 'potentialSavings',  label: 'Potential Savings (YTD)',  value: '$24.7M', delta: '↑12.6% vs last month', up: true,  iconKey: 'zap',        color: '#00A36C', bg: 'rgba(0,163,108,0.15)',    seed: 33 },
  { key: 'riskScore',         label: 'Risk Score (Overall)',     value: '68',     unit: '/100', sublabel: 'Medium Risk', delta: '', up: false, iconKey: 'shieldAlert', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', seed: 44 },
  { key: 'assetsAtRisk',      label: 'Assets at Risk',           value: '346',    delta: '↓5% vs last month',   up: false, iconKey: 'building',   color: '#EF4444', bg: 'rgba(239,68,68,0.15)',    seed: 55 },
  { key: 'modelsRunning',     label: 'Models Running',           value: '15',     delta: '↑2 vs last month',    up: true,  iconKey: 'layers',     color: '#7C3AED', bg: 'rgba(124,58,237,0.15)',   seed: 66 },
];

// ─── AI Insights ──────────────────────────────────────────────────────────────
export const INSIGHTS = [
  {
    id: 1, severity: 'Critical', category: 'Operations',
    title: 'Power capacity nearing limit in Mumbai DC',
    description: 'Mumbai DC IT load is projected to exceed safe capacity in 42 days based on current trend.',
    impact: 'High', affectedAssets: 1248, date: 'May 19, 2025',
  },
  {
    id: 2, severity: 'High', category: 'Assets',
    title: '23% of servers reaching EOL within 90 days',
    description: '456 servers across 3 data centers are nearing End of Life. Plan replacements to avoid outages.',
    impact: 'High', affectedAssets: 456, date: 'May 19, 2025',
  },
  {
    id: 3, severity: 'Medium', category: 'Operations',
    title: 'Cooling efficiency dropped 3.6% in Singapore DC',
    description: 'Increase in ambient temperature and chiller load impacting PUE.',
    impact: 'Medium', affectedAssets: null, date: 'May 19, 2025',
  },
  {
    id: 4, severity: 'Info', category: 'Sustainability',
    title: 'Renewable energy usage improved',
    description: 'Renewable energy usage increased by 5.2% compared to last month.',
    impact: 'Low', affectedAssets: null, date: 'May 19, 2025',
  },
  {
    id: 5, severity: 'Info', category: 'Risk & Compliance',
    title: 'Network anomaly detected in Tokyo DC',
    description: 'Unusual east-west traffic pattern detected in segment NX-TOK-02.',
    impact: 'Medium', affectedAssets: 32, date: 'May 19, 2025',
  },
  {
    id: 6, severity: 'High', category: 'Finance',
    title: 'Cooling cost increased 12% in Q2 due to higher PUE',
    description: 'Power & Cooling spend trending above budget in Singapore and Mumbai locations.',
    impact: 'High', affectedAssets: null, date: 'May 18, 2025',
  },
  {
    id: 7, severity: 'Medium', category: 'Supply Chain',
    title: 'Critical spare parts inventory below threshold',
    description: 'UPS battery stockout risk in 3 DCs; 2 vendors on backorder for PDU modules.',
    impact: 'Medium', affectedAssets: null, date: 'May 17, 2025',
  },
  {
    id: 8, severity: 'Medium', category: 'Assets',
    title: 'Battery backup life below 3-year threshold in 14 sites',
    description: 'UPS battery health degraded. Recommend proactive replacement before Q4 peak load.',
    impact: 'Medium', affectedAssets: 89, date: 'May 16, 2025',
  },
];

export const INSIGHT_CATEGORIES = [
  'All Insights', 'Assets', 'Operations', 'Finance', 'Sustainability', 'Risk & Compliance', 'Supply Chain',
];

// ─── Risk Heatmap (5×5) ───────────────────────────────────────────────────────
// rows top→bottom: Very High → Very Low (likelihood)
// cols left→right: Very Low → Very High (impact)
export const RISK_HEATMAP = {
  rows: [
    { label: 'Very High', cells: [0, 2, 4, 6, 3] },
    { label: 'High',      cells: [1, 3, 7, 8, 4] },
    { label: 'Medium',    cells: [3, 6, 9, 7, 2] },
    { label: 'Low',       cells: [2, 6, 8, 4, 1] },
    { label: 'Very Low',  cells: [4, 3, 2, 1, 0] },
  ],
  cols: ['Very Low', 'Low', 'Medium', 'High', 'Very High'],
};

// ─── Predictive Failures ──────────────────────────────────────────────────────
export const PREDICTIVE_FAILURES = [
  { asset: 'CRAC-12',    type: 'Cooling Unit', location: 'Singapore DC', failurePct: 85, impact: 'High'   },
  { asset: 'UPS-07',     type: 'UPS',          location: 'Mumbai DC',    failurePct: 72, impact: 'High'   },
  { asset: 'PDU-A03',    type: 'PDU',          location: 'Sydney DC',    failurePct: 68, impact: 'Medium' },
  { asset: 'Chiller-02', type: 'Chiller',      location: 'Tokyo DC',     failurePct: 55, impact: 'Medium' },
  { asset: 'FuelGen-01', type: 'Generator',    location: 'London DC',    failurePct: 48, impact: 'Low'    },
];

// ─── Capacity Forecast ────────────────────────────────────────────────────────
export const CAPACITY_FORECAST = {
  projectedExceedDate: 'Jul 28, 2025',
  capacityLimitMW: 175,
  data: [
    { month: "May '25", actual: 108, forecast: 108 },
    { month: "Jun '25", actual: null, forecast: 133 },
    { month: "Jul '25", actual: null, forecast: 169 },
    { month: "Aug '25", actual: null, forecast: 196 },
  ],
};

// ─── Cost Optimizations ───────────────────────────────────────────────────────
export const COST_OPTIMIZATIONS = [
  { opportunity: 'Rightsize idle servers',         potentialM: 6.4 },
  { opportunity: 'Optimize cooling setpoints',     potentialM: 4.1 },
  { opportunity: 'Renewable energy arbitrage',     potentialM: 3.2 },
  { opportunity: 'Storage tiering optimization',   potentialM: 2.6 },
  { opportunity: 'Network bandwidth optimization', potentialM: 1.8 },
];

// ─── Anomaly Detection ────────────────────────────────────────────────────────
export const ANOMALIES = [
  { category: 'Power Anomalies',       count: 14, delta: 4, up: true,  color: '#EF4444', iconKey: 'flame'       },
  { category: 'Temperature Anomalies', count: 9,  delta: 2, up: true,  color: '#F59E0B', iconKey: 'thermometer' },
  { category: 'Network Anomalies',     count: 6,  delta: 1, up: false, color: '#7C3AED', iconKey: 'wifi'        },
  { category: 'Configuration Drifts',  count: 11, delta: 3, up: true,  color: '#0077C8', iconKey: 'settings'    },
];

// ─── Knowledge Graph stats ────────────────────────────────────────────────────
export const KG_STATS = [
  { label: 'Data Centers', value: '24',     color: '#0077C8' },
  { label: 'Buildings',    value: '68',     color: '#F59E0B' },
  { label: 'Racks',        value: '1,248',  color: '#7C3AED' },
  { label: 'Assets',       value: '21,342', color: '#10B981' },
  { label: 'Vendors',      value: '320',    color: '#EF4444' },
  { label: 'Contracts',    value: '142',    color: '#6B7280' },
];

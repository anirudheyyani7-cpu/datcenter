// ─── KPI Cards (6) ────────────────────────────────────────────────────────────
export const KPIS = [
  { label: 'Total Assets',      value: '21,342', unit: '',     sublabel: '',         delta: '↑4.8% vs Apr \'25', up: true,  iconKey: 'layers',      color: '#7C3AED', bg: 'rgba(124,58,237,0.15)',  seed: 71 },
  { label: 'Total Locations',   value: 128,       unit: '',     sublabel: '',         delta: '↑2 vs Apr \'25',    up: true,  iconKey: 'building',    color: '#0077C8', bg: 'rgba(0,119,200,0.15)',   seed: 72 },
  { label: 'Total Value (USD)', value: '$2.46B',  unit: '',     sublabel: '',         delta: '↑6.2% vs Apr \'25', up: true,  iconKey: 'activity',    color: '#00A36C', bg: 'rgba(0,163,108,0.15)',   seed: 73 },
  { label: 'Utilization Rate',  value: '72.6',    unit: '%',    sublabel: '',         delta: '↑3.6% vs Apr \'25', up: true,  iconKey: 'timer',       color: '#F59E0B', bg: 'rgba(245,158,11,0.15)',  seed: 74 },
  { label: 'Availability',      value: '98.9',    unit: '%',    sublabel: '',         delta: '↑0.7% vs Apr \'25', up: true,  iconKey: 'zap',         color: '#00A36C', bg: 'rgba(0,163,108,0.15)',   seed: 75 },
  { label: 'MTTR Incidents',    value: '3.6',     unit: ' hrs', sublabel: '',         delta: '↓0.6 hrs vs Apr \'25', up: false, iconKey: 'shieldAlert', color: '#EF4444', bg: 'rgba(239,68,68,0.15)', seed: 76 },
];

// ─── Asset Distribution by Type (donut) ───────────────────────────────────────
export const ASSET_DISTRIBUTION = [
  { name: 'IT Hardware',      value: 8542,  pct: 40.0, color: '#00338D' },
  { name: 'Networking',       value: 4326,  pct: 20.3, color: '#00A36C' },
  { name: 'Power & Cooling',  value: 3256,  pct: 15.3, color: '#0091DA' },
  { name: 'Facilities',       value: 2841,  pct: 13.3, color: '#69B1E3' },
  { name: 'Storage',          value: 1842,  pct:  8.6, color: '#D4A017' },
  { name: 'Others',           value:  535,  pct:  2.5, color: '#94A3B8' },
];

// ─── Asset Value Trend (monthly USD billions, Dec'24 – May'25) ─────────────────
export const ASSET_VALUE_TREND = [
  { week: "Dec '24", value: 2.08 },
  { week: "Jan '25", value: 2.12 },
  { week: "Feb '25", value: 2.18 },
  { week: "Mar '25", value: 2.24 },
  { week: "Apr '25", value: 2.35 },
  { week: "May '25", value: 2.46 },
];

// ─── Utilization by Location ───────────────────────────────────────────────────
// lat/lon = Leaflet map center for each region badge
export const UTILIZATION_BY_LOCATION = [
  { key: 'north-america',       label: 'North America',       utilizationPct: 78.2, lat: 44,  lon: -100, color: '#00338D' },
  { key: 'europe',              label: 'Europe',              utilizationPct: 71.4, lat: 52,  lon:   15, color: '#0091DA' },
  { key: 'asia-pacific',        label: 'Asia Pacific',        utilizationPct: 74.8, lat: 25,  lon:  115, color: '#69B1E3' },
  { key: 'latin-america',       label: 'Latin America',       utilizationPct: 66.1, lat: -15, lon:  -60, color: '#00A36C' },
  { key: 'middle-east-africa',  label: 'Middle East & Africa', utilizationPct: 69.3, lat: 10,  lon:   35, color: '#6F2C91' },
];

// ─── Operational Performance (reuse Operations Hub PORTFOLIO figures) ──────────
export const OPERATIONAL_PERF = [
  { label: 'Open Incidents',       value: 48,     delta: '↑14 vs Apr \'25', up: false },
  { label: 'Open Work Orders',     value: 356,    delta: '↓9 vs Apr \'25',  up: true  },
  { label: 'Overdue Work Orders',  value: 27,     delta: '↓5 vs Apr \'25',  up: true  },
  { label: 'SLA Compliance',       value: '93.2', unit: '%', delta: '↑3.6% vs Apr \'25', up: true  },
];

// ─── SLA Compliance Trend (monthly %, Dec'24 – May'25) ────────────────────────
export const SLA_COMPLIANCE_TREND = [
  { week: "Dec '24", value: 88.0 },
  { week: "Jan '25", value: 89.0 },
  { week: "Feb '25", value: 90.5 },
  { week: "Mar '25", value: 89.5 },
  { week: "Apr '25", value: 91.2 },
  { week: "May '25", value: 93.2 },
];

// ─── Top 5 Locations by Asset Value (USD millions) ────────────────────────────
export const TOP_LOCATIONS_BY_VALUE = [
  { label: 'Singapore DC',  value: 412.3, color: '#0077C8' },
  { label: 'Mumbai DC',     value: 356.7, color: '#0077C8' },
  { label: 'Frankfurt DC',  value: 298.4, color: '#0077C8' },
  { label: 'Ashburn DC',    value: 245.6, color: '#0077C8' },
  { label: 'Sydney DC',     value: 198.2, color: '#0077C8' },
];

// ─── Cost Overview (USD) ───────────────────────────────────────────────────────
export const COST_OVERVIEW = {
  totalCostYtd: '$45.28M',
  deltaPct: '+8.4%',
  deltaLabel: 'vs YTD Apr \'25',
  deltaUp: false,
  categoryBreakdown: [
    { name: 'Power & Cooling', value: 17.62, pct: 38.9, color: '#0091DA' },
    { name: 'IT Hardware',     value: 12.45, pct: 27.5, color: '#00338D' },
    { name: 'Facilities',      value:  6.78, pct: 15.0, color: '#69B1E3' },
    { name: 'Networking',      value:  5.31, pct: 11.7, color: '#00A36C' },
    { name: 'Others',          value:  3.12, pct:  6.9, color: '#94A3B8' },
  ],
};

// ─── Cost per kW Monthly ──────────────────────────────────────────────────────
export const COST_PER_KW = {
  value: '$2.38',
  delta: '↓4.8% vs Apr \'25',
  deltaUp: true,
  trend: [
    { week: "Dec '24", value: 2.72 },
    { week: "Jan '25", value: 2.65 },
    { week: "Feb '25", value: 2.58 },
    { week: "Mar '25", value: 2.49 },
    { week: "Apr '25", value: 2.50 },
    { week: "May '25", value: 2.38 },
  ],
};

// ─── Recent Reports (~10 records) ─────────────────────────────────────────────
export const RECENT_REPORTS = [
  { id: 1,  reportName: 'Asset Summary Report',        category: 'Asset Reports',        generatedOn: 'May 31, 2025 09:30 AM', generatedBy: 'Anoushka', format: 'PDF'   },
  { id: 2,  reportName: 'Monthly Operations Report',   category: 'Operational Reports',  generatedOn: 'May 31, 2025 09:15 AM', generatedBy: 'System',   format: 'PDF'   },
  { id: 3,  reportName: 'Cost Analysis Report',        category: 'Financial Reports',    generatedOn: 'May 31, 2025 09:00 AM', generatedBy: 'Anoushka', format: 'Excel' },
  { id: 4,  reportName: 'SLA Performance Report',      category: 'SLA Reports',          generatedOn: 'May 31, 2025 08:45 AM', generatedBy: 'System',   format: 'PDF'   },
  { id: 5,  reportName: 'ESG Summary Report',          category: 'ESG Reports',          generatedOn: 'May 30, 2025 06:20 PM', generatedBy: 'Anoushka', format: 'PDF'   },
  { id: 6,  reportName: 'Capacity Planning Report',    category: 'Operational Reports',  generatedOn: 'May 30, 2025 02:00 PM', generatedBy: 'System',   format: 'PDF'   },
  { id: 7,  reportName: 'Network Utilization Report',  category: 'Asset Reports',        generatedOn: 'May 29, 2025 11:30 AM', generatedBy: 'Anoushka', format: 'Excel' },
  { id: 8,  reportName: 'Energy Efficiency Report',    category: 'ESG Reports',          generatedOn: 'May 29, 2025 09:00 AM', generatedBy: 'System',   format: 'PDF'   },
  { id: 9,  reportName: 'Budget vs Actual Report',     category: 'Financial Reports',    generatedOn: 'May 28, 2025 05:00 PM', generatedBy: 'Anoushka', format: 'Excel' },
  { id: 10, reportName: 'Incident Summary Report',     category: 'Operational Reports',  generatedOn: 'May 28, 2025 10:00 AM', generatedBy: 'System',   format: 'PDF'   },
];

// ─── Reports by Category (donut) ──────────────────────────────────────────────
export const REPORTS_BY_CATEGORY = [
  { name: 'Operational Reports', value: 48, pct: 30.8, color: '#00338D' },
  { name: 'Asset Reports',       value: 36, pct: 23.1, color: '#0091DA' },
  { name: 'Financial Reports',   value: 28, pct: 17.9, color: '#69B1E3' },
  { name: 'ESG Reports',         value: 20, pct: 12.8, color: '#00A36C' },
  { name: 'SLA Reports',         value: 14, pct:  9.0, color: '#6F2C91' },
  { name: 'Others',              value: 10, pct:  6.4, color: '#94A3B8' },
];

// ─── Scheduled Reports ────────────────────────────────────────────────────────
export const SCHEDULED_REPORTS = [
  { name: 'Monthly Operations Summary', scheduleText: 'Every month on 1st at 09:00 AM',    enabled: true,  iconKey: 'BarChart2'   },
  { name: 'Cost Analysis Report',       scheduleText: 'Every month on 5th at 08:30 AM',    enabled: true,  iconKey: 'DollarSign'  },
  { name: 'SLA Performance Report',     scheduleText: 'Every week on Monday at 09:00 AM',  enabled: true,  iconKey: 'Activity'    },
  { name: 'ESG Dashboard Report',       scheduleText: 'Every quarter on 1st at 10:00 AM',  enabled: false, iconKey: 'Leaf'        },
  { name: 'Capacity Planning Report',   scheduleText: 'Every month on 15th at 09:00 AM',   enabled: true,  iconKey: 'Server'      },
];

// ─── Insights ─────────────────────────────────────────────────────────────────
export const INSIGHTS = [
  { color: '#00A36C', message: 'Power consumption increased by 8.7% in Singapore DC compared to last month.',    linkLabel: 'View Analysis',      href: '#' },
  { color: '#F59E0B', message: '23% of servers in Mumbai DC are reaching End of Life in next 90 days.',          linkLabel: 'View Assets',         href: '#' },
  { color: '#0077C8', message: 'Cooling efficiency improved by 3.6% in Singapore DC.',                            linkLabel: 'View Details',        href: '#' },
  { color: '#00A36C', message: 'Renewable energy usage reached 32% this month.',                                  linkLabel: 'View ESG Report',     href: '#' },
  { color: '#F59E0B', message: 'Storage utilization is above 80% in Frankfurt DC.',                               linkLabel: 'View Storage Report', href: '#' },
];

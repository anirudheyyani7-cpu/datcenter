// ─── FinOps ────────────────────────────────────────────────────────────────

export const FINOPS_KPIS = {
  totalCostM:        12.64,
  totalCostDelta:    { pct: -6.7, label: "vs Apr '25" },
  capexYtdM:         45.28,
  capexDelta:        { pct: +8.4, label: "vs YTD Apr '25" },
  opexMonthlyM:      8.91,
  opexDelta:         { pct: -5.1, label: "vs Apr '25" },
  costPerKw:         2.38,
  costPerKwDelta:    { pct: -4.8, label: "vs Apr '25" },
  budgetVariancePct: -7.2,
  budgetStatus:      'Under Budget',
  forecastFY2025M:   156.2,
  forecastDelta:     { pct: +6.3, label: 'vs FY 2024' },
};

export const COST_TREND = [
  { month: "Dec '24", totalCost: 13.2, capex: 8.1, opex: 5.1 },
  { month: "Jan '25", totalCost: 14.1, capex: 8.8, opex: 5.3 },
  { month: "Feb '25", totalCost: 13.6, capex: 8.3, opex: 5.3 },
  { month: "Mar '25", totalCost: 13.0, capex: 7.8, opex: 5.2 },
  { month: "Apr '25", totalCost: 13.5, capex: 8.5, opex: 5.0 },
  { month: "May '25", totalCost: 12.64, capex: 7.73, opex: 4.91 },
];

export const COST_BY_CATEGORY = [
  { name: 'IT Hardware',    value: 5.12, pct: 40.5, color: '#0077C8' },
  { name: 'Power & Cooling',value: 3.21, pct: 25.4, color: '#7C3AED' },
  { name: 'Facilities',     value: 1.98, pct: 15.7, color: '#F59E0B' },
  { name: 'Network',        value: 1.23, pct:  9.7, color: '#10B981' },
  { name: 'Security',       value: 0.62, pct:  4.9, color: '#EF4444' },
  { name: 'Others',         value: 0.28, pct:  2.2, color: '#6B7280' },
];

export const COST_BY_LOCATION = [
  { label: 'Singapore DC',  value: 2.89 },
  { label: 'Tokyo DC',      value: 1.76 },
  { label: 'Mumbai DC',     value: 1.42 },
  { label: 'Sydney DC',     value: 1.28 },
  { label: 'Oregon DC',     value: 1.10 },
  { label: 'Frankfurt DC',  value: 0.97 },
  { label: 'Dallas DC',     value: 0.86 },
  { label: 'São Paulo DC',  value: 0.65 },
  { label: 'London DC',     value: 0.45 },
  { label: 'Others',        value: 1.26 },
];

export const TOP_COST_DRIVERS = [
  { driver: 'Power Consumption',  category: 'Power & Cooling', impactM: 2.76, trendPct: +7.2, up: true  },
  { driver: 'Cooling Systems',    category: 'Power & Cooling', impactM: 1.45, trendPct: +6.1, up: true  },
  { driver: 'Compute Servers',    category: 'IT Hardware',     impactM: 1.28, trendPct: -3.4, up: false },
  { driver: 'Storage Systems',    category: 'IT Hardware',     impactM: 0.98, trendPct: -1.2, up: false },
  { driver: 'Network Equipment',  category: 'Network',         impactM: 0.74, trendPct: +2.8, up: true  },
];

export const BUDGET_VS_ACTUAL = [
  { category: 'IT Hardware',    budgetM: 6.20, actualM: 5.12, variancePct: -17.4 },
  { category: 'Power & Cooling',budgetM: 3.30, actualM: 3.21, variancePct:  -2.7 },
  { category: 'Facilities',     budgetM: 2.20, actualM: 1.98, variancePct: -10.0 },
  { category: 'Network',        budgetM: 1.40, actualM: 1.23, variancePct: -12.1 },
  { category: 'Security',       budgetM: 0.82, actualM: 0.62, variancePct: -24.4 },
  { category: 'Others',         budgetM: 0.44, actualM: 0.28, variancePct: -36.4 },
];

export const UNIT_ECONOMICS = [
  { metric: 'Cost / kW',        value: '$2.38', deltaPct: -4.8 },
  { metric: 'Cost / Rack',      value: '$312',  deltaPct: -5.2 },
  { metric: 'Cost / Server',    value: '$142',  deltaPct: -3.6 },
  { metric: 'Cost / TB Storage',value: '$27.6', deltaPct: -6.1 },
  { metric: 'PUE (Avg)',        value: '1.31',  deltaPct: -2.9 },
];

export const FINOPS_INSIGHTS = [
  { text: "Power & Cooling cost increased by 9.3%. Higher cooling load and energy prices in Mumbai DC.",  color: '#F59E0B' },
  { text: "Singapore DC is 18% more cost efficient compared to portfolio average.",                        color: '#00A36C' },
  { text: "Storage assets contribute to 22% of OpEx; optimization opportunities exist.",                  color: '#0077C8' },
];

export const ALERTS = [
  { title: 'Budget threshold exceeded for Power & Cooling in Mumbai DC', ago: '10 min ago', color: '#EF4444' },
  { title: 'Forecasted cost for Q3 is 8% higher than previous forecast', ago: '1 hr ago',  color: '#F59E0B' },
  { title: 'High CapEx planned for Storage refresh in Q4',                ago: '3 hr ago',  color: '#F59E0B' },
  { title: 'Idle capacity detected in Oregon DC',                         ago: '5 hr ago',  color: '#0077C8' },
];

// ─── ESG ────────────────────────────────────────────────────────────────────

export const ESG_SCORECARD = {
  overall:       78,
  delta:         "+6 pts vs Apr '25",
  environmental: 76,
  social:        82,
  governance:    77,
};

export const CARBON_TREND = [
  { month: "Dec '24", tCO2e: 14200 },
  { month: "Jan '25", tCO2e: 13800 },
  { month: "Feb '25", tCO2e: 13400 },
  { month: "Mar '25", tCO2e: 13100 },
  { month: "Apr '25", tCO2e: 13700 },
  { month: "May '25", tCO2e: 12842 },
];

export const ENERGY_WATER = {
  consumptionGWh:   98.6,
  consumptionDelta: -4.1,
  consumptionTrend: [102.8, 101.4, 100.2, 99.8, 102.8, 98.6],
  waterUsageKL:     95.2,
  waterDelta:       -3.3,
  waterTrend:       [98.4, 97.6, 96.8, 96.2, 98.4, 95.2],
};

export const RENEWABLE_ENERGY = {
  renewablePct:    76,
  nonRenewablePct: 24,
};

export const EMISSIONS_BY_SCOPE = [
  { name: 'Scope 1', value: 1842,  pct: 14, color: '#0077C8' },
  { name: 'Scope 2', value: 8104,  pct: 63, color: '#7C3AED' },
  { name: 'Scope 3', value: 2896,  pct: 23, color: '#F59E0B' },
];

export const EMISSIONS_BY_LOCATION = [
  { label: 'Mumbai DC',   value: 2864 },
  { label: 'Singapore',   value: 2452 },
  { label: 'Tokyo DC',    value: 2128 },
  { label: 'Oregon DC',   value: 1842 },
  { label: 'Frankfurt DC',value: 1256 },
  { label: 'Sydney DC',   value: 1186 },
  { label: 'Dallas DC',   value:  974 },
  { label: 'London DC',   value:  740 },
];

export const ESG_INITIATIVES = [
  { label: '100% Renewable Energy in Singapore DC', status: 'On Track'    },
  { label: 'Water Recycling Expansion',             status: 'On Track'    },
  { label: 'E-Waste Recycling Program',             status: 'Completed'   },
  { label: 'SBTi Emissions Reduction Target',       status: 'On Track'    },
];

export const COMPLIANCE_REPORTING = [
  { label: 'GRI Reporting',           status: 'In Progress' },
  { label: 'TCFD Reporting',          status: 'Completed'   },
  { label: 'CDP Disclosure',          status: 'Submitted'   },
  { label: 'ISO 14001 Certification', status: 'Certified'   },
];

export const ESG_INSIGHTS = [
  { text: "Carbon emissions decreased by 6.2% driven by higher renewable energy usage in May.",  color: '#00A36C' },
  { text: "3 locations are at risk of not meeting 2025 emission targets — review Mumbai DC.",     color: '#F59E0B' },
  { text: "Water usage efficiency improved 3.3% month-over-month across all APAC facilities.",   color: '#0077C8' },
];

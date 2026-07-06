// Portfolio-level KPI constants (enterprise-scale aggregates)
export const PORTFOLIO = {
  openIncidents:      48,
  openWorkOrders:     356,
  overdueWorkOrders:  27,
  assetsDown:         18,
  slaPct:             93.2,
  mttrHrs:            3.6,
  maintenanceDue30:   124,
  inProgressWOs:      142,
  plannedWOs:         98,
  onHoldWOs:          56,
  overdueWOs:         27,
};

export function getKpiValues() {
  return {
    openIncidents:     PORTFOLIO.openIncidents,
    openWorkOrders:    PORTFOLIO.openWorkOrders,
    overdueWorkOrders: PORTFOLIO.overdueWorkOrders,
    assetsDown:        PORTFOLIO.assetsDown,
    slaPct:            PORTFOLIO.slaPct,
    mttrHrs:           PORTFOLIO.mttrHrs,
    maintenanceDue30:  PORTFOLIO.maintenanceDue30,
  };
}

export const INCIDENTS_BY_SEVERITY = [
  { name: 'Critical', value: 8,  pct: 16.7, color: '#EF4444' },
  { name: 'High',     value: 14, pct: 29.2, color: '#F59E0B' },
  { name: 'Medium',   value: 16, pct: 33.3, color: '#0077C8' },
  { name: 'Low',      value: 6,  pct: 12.5, color: '#10B981' },
  { name: 'Info',     value: 4,  pct:  8.3, color: '#6B7280' },
];

export const WORK_ORDERS_BY_STATUS = [
  { name: 'In Progress', value: 142, pct: 39.9, color: '#0077C8' },
  { name: 'Planned',     value: 98,  pct: 27.5, color: '#10B981' },
  { name: 'On Hold',     value: 56,  pct: 15.7, color: '#F59E0B' },
  { name: 'Completed',   value: 48,  pct: 13.5, color: '#6B7280' },
  { name: 'Cancelled',   value: 12,  pct:  3.4, color: '#EF4444' },
];

export const INCIDENTS_TREND = [
  { date: 'May 1',  critHigh: 42, medLow: 18 },
  { date: 'May 8',  critHigh: 58, medLow: 23 },
  { date: 'May 15', critHigh: 45, medLow: 16 },
  { date: 'May 22', critHigh: 64, medLow: 25 },
  { date: 'May 31', critHigh: 51, medLow: 20 },
];

export const ACTIVE_ALERTS = [
  { color: '#EF4444', title: 'UPS-07 in Mumbai DC',                          sub: 'Battery failure detected',                          ago: 'Critical · 5 min ago'  },
  { color: '#F59E0B', title: 'High temperature in Cooling Unit – CRAC-12',   sub: 'Threshold exceeded by 4°C',                         ago: 'High · 12 min ago'     },
  { color: '#F59E0B', title: 'Power capacity threshold exceeded',             sub: 'Singapore DC – Zone A',                             ago: 'High · 27 min ago'     },
  { color: '#0077C8', title: 'Network latency high – Core Switch 01',        sub: 'Tokyo DC',                                          ago: 'Info · 45 min ago'     },
  { color: '#0077C8', title: 'Generator maintenance due in 3 days',          sub: 'London DC',                                         ago: 'Info · 1 hr ago'       },
];

export const MAINTENANCE_CALENDAR = [
  { date: 'May 20', title: 'CRAC-12 Preventive Maintenance',       location: 'Singapore DC', tag: 'PM'       },
  { date: 'May 21', title: 'UPS-07 Battery Test',                  location: 'Mumbai DC',    tag: 'PM'       },
  { date: 'May 22', title: 'Generator Load Test',                   location: 'London DC',    tag: 'PM'       },
  { date: 'May 23', title: 'Fire Suppression System Check',         location: 'Sydney DC',    tag: 'PM'       },
  { date: 'May 24', title: 'Network Switch Firmware Update',        location: 'Tokyo DC',     tag: 'Standard' },
];

export const SLA_COMPLIANCE = {
  pct: 93.2,
  data: [
    { name: 'Met',      value: 142, pct: 73.2, color: '#10B981' },
    { name: 'Breached', value: 42,  pct: 21.6, color: '#EF4444' },
    { name: 'At Risk',  value: 10,  pct:  5.2, color: '#F59E0B' },
  ],
};

export const MTTR_TREND = [
  { month: "Dec '24", mttrHrs: 6.2 },
  { month: "Jan '25", mttrHrs: 5.1 },
  { month: "Feb '25", mttrHrs: 4.6 },
  { month: "Mar '25", mttrHrs: 4.2 },
  { month: "Apr '25", mttrHrs: 3.6 },
  { month: "May '25", mttrHrs: 3.6 },
];

export const ASSETS_HEALTH = {
  total: 12842,
  data: [
    { name: 'Healthy',  value: 10214, pct: 79.6, color: '#10B981' },
    { name: 'Warning',  value: 1842,  pct: 14.3, color: '#F59E0B' },
    { name: 'Critical', value: 436,   pct:  3.4, color: '#EF4444' },
    { name: 'Unknown',  value: 350,   pct:  2.7, color: '#6B7280' },
  ],
};

export const OPERATIONAL_TASKS = {
  total: 189,
  data: [
    { name: 'To Do',       value: 76, pct: 40.2, color: '#0077C8' },
    { name: 'In Progress', value: 68, pct: 36.0, color: '#F59E0B' },
    { name: 'Completed',   value: 39, pct: 20.6, color: '#10B981' },
    { name: 'Overdue',     value: 6,  pct:  3.2, color: '#EF4444' },
  ],
};

const LOCS  = ['Singapore DC', 'Mumbai DC', 'Tokyo DC', 'Sydney DC', 'London DC', 'Oregon DC', 'Frankfurt DC'];
const TEAMS = ['TechOps Team A', 'TechOps Team B', 'Infra Team', 'Facility Team', 'Network Team'];

export const WORK_ORDERS = [
  // In Progress
  { woId: 'WO-2505-00156', title: 'Replace failed fan in CRAC-12',         type: 'Corrective',  asset: 'CRAC-12',        location: LOCS[0], priority: 'High',     status: 'In Progress', assignedTo: TEAMS[0], dueDate: 'May 20, 2025', slaPct: 85, overdue: false },
  { woId: 'WO-2505-00155', title: 'UPS battery replacement',                type: 'Preventive',  asset: 'UPS-07',         location: LOCS[1], priority: 'Critical', status: 'In Progress', assignedTo: TEAMS[1], dueDate: 'May 19, 2025', slaPct: 60, overdue: false },
  { woId: 'WO-2505-00150', title: 'Cooling coil deep clean',                type: 'Preventive',  asset: 'Chiller-02',     location: LOCS[2], priority: 'Medium',   status: 'In Progress', assignedTo: TEAMS[3], dueDate: 'May 22, 2025', slaPct: 75, overdue: false },
  { woId: 'WO-2505-00149', title: 'Network core switch firmware upgrade',   type: 'Standard',    asset: 'Switch-Core-01', location: LOCS[3], priority: 'High',     status: 'In Progress', assignedTo: TEAMS[4], dueDate: 'May 23, 2025', slaPct: 90, overdue: false },
  { woId: 'WO-2505-00148', title: 'Generator quarterly load test',          type: 'Preventive',  asset: 'Generator-01',   location: LOCS[4], priority: 'High',     status: 'In Progress', assignedTo: TEAMS[3], dueDate: 'May 21, 2025', slaPct: 80, overdue: false },
  { woId: 'WO-2505-00147', title: 'PDU phase balancing inspection',         type: 'Corrective',  asset: 'PDU-A03',        location: LOCS[5], priority: 'Medium',   status: 'In Progress', assignedTo: TEAMS[2], dueDate: 'May 24, 2025', slaPct: 70, overdue: false },
  { woId: 'WO-2505-00146', title: 'Hot-aisle containment seal repair',      type: 'Corrective',  asset: 'CRAC-08',        location: LOCS[6], priority: 'High',     status: 'In Progress', assignedTo: TEAMS[0], dueDate: 'May 25, 2025', slaPct: 78, overdue: false },
  { woId: 'WO-2505-00145', title: 'Fire suppression system inspection',     type: 'Preventive',  asset: 'FSS-Zone-A',     location: LOCS[0], priority: 'Critical', status: 'In Progress', assignedTo: TEAMS[3], dueDate: 'May 20, 2025', slaPct: 55, overdue: false },
  { woId: 'WO-2505-00144', title: 'Server rack grounding check',            type: 'Standard',    asset: 'Rack-Row-04',    location: LOCS[1], priority: 'Low',      status: 'In Progress', assignedTo: TEAMS[2], dueDate: 'May 26, 2025', slaPct: 95, overdue: false },
  { woId: 'WO-2505-00143', title: 'UPS-12 bypass maintenance',              type: 'Preventive',  asset: 'UPS-12',         location: LOCS[2], priority: 'High',     status: 'In Progress', assignedTo: TEAMS[1], dueDate: 'May 22, 2025', slaPct: 72, overdue: false },
  { woId: 'WO-2505-00142', title: 'Water leak detection sensor calibration',type: 'Standard',    asset: 'WLD-Floor-01',   location: LOCS[3], priority: 'Medium',   status: 'In Progress', assignedTo: TEAMS[3], dueDate: 'May 27, 2025', slaPct: 88, overdue: false },
  { woId: 'WO-2505-00141', title: 'Chiller-03 compressor vibration check',  type: 'Corrective',  asset: 'Chiller-03',     location: LOCS[4], priority: 'Medium',   status: 'In Progress', assignedTo: TEAMS[0], dueDate: 'May 28, 2025', slaPct: 65, overdue: false },

  // Planned
  { woId: 'WO-2505-00154', title: 'Rack PDU firmware update',               type: 'Standard',    asset: 'PDU-A03',        location: LOCS[3], priority: 'Medium',   status: 'Planned', assignedTo: TEAMS[2],  dueDate: 'May 21, 2025', slaPct: 100, overdue: false },
  { woId: 'WO-2505-00153', title: 'Cooling coil cleaning',                  type: 'Preventive',  asset: 'Chiller-02',     location: LOCS[2], priority: 'Medium',   status: 'Planned', assignedTo: TEAMS[3],  dueDate: 'May 22, 2025', slaPct: 100, overdue: false },
  { woId: 'WO-2505-00140', title: 'Rooftop HVAC filter replacement',        type: 'Preventive',  asset: 'HVAC-Roof-01',   location: LOCS[5], priority: 'Low',      status: 'Planned', assignedTo: TEAMS[3],  dueDate: 'May 29, 2025', slaPct: 100, overdue: false },
  { woId: 'WO-2505-00139', title: 'Security camera firmware update',        type: 'Standard',    asset: 'CAM-NVR-01',     location: LOCS[6], priority: 'Low',      status: 'Planned', assignedTo: TEAMS[4],  dueDate: 'May 30, 2025', slaPct: 100, overdue: false },
  { woId: 'WO-2505-00138', title: 'Electrical panel thermography',          type: 'Preventive',  asset: 'Panel-MDB-A',    location: LOCS[0], priority: 'Medium',   status: 'Planned', assignedTo: TEAMS[2],  dueDate: 'Jun 2, 2025',  slaPct: 100, overdue: false },
  { woId: 'WO-2505-00137', title: 'Diesel fuel quality testing',            type: 'Standard',    asset: 'Generator-02',   location: LOCS[1], priority: 'Low',      status: 'Planned', assignedTo: TEAMS[3],  dueDate: 'Jun 3, 2025',  slaPct: 100, overdue: false },
  { woId: 'WO-2505-00136', title: 'Access control battery backup check',    type: 'Preventive',  asset: 'ACS-Controller', location: LOCS[4], priority: 'Low',      status: 'Planned', assignedTo: TEAMS[4],  dueDate: 'Jun 4, 2025',  slaPct: 100, overdue: false },
  { woId: 'WO-2505-00135', title: 'Fiber optic cable continuity test',      type: 'Standard',    asset: 'MDA-Patch-01',   location: LOCS[2], priority: 'Medium',   status: 'Planned', assignedTo: TEAMS[4],  dueDate: 'Jun 5, 2025',  slaPct: 100, overdue: false },

  // On Hold
  { woId: 'WO-2505-00152', title: 'Replace failed HDD in Server-312',       type: 'Corrective',  asset: 'Server-312',     location: LOCS[0], priority: 'High',     status: 'On Hold', assignedTo: TEAMS[0],  dueDate: 'May 18, 2025', slaPct: 30,  overdue: false },
  { woId: 'WO-2505-00151', title: 'PDU-B01 overload remediation',           type: 'Corrective',  asset: 'PDU-B01',        location: LOCS[1], priority: 'Critical', status: 'On Hold', assignedTo: TEAMS[2],  dueDate: 'May 17, 2025', slaPct: 25,  overdue: false },
  { woId: 'WO-2505-00134', title: 'Replace aging UPS modules',              type: 'Preventive',  asset: 'UPS-03',         location: LOCS[4], priority: 'High',     status: 'On Hold', assignedTo: TEAMS[1],  dueDate: 'May 19, 2025', slaPct: 40,  overdue: false },
  { woId: 'WO-2505-00133', title: 'Firewall rule audit and cleanup',        type: 'Standard',    asset: 'Firewall-01',    location: LOCS[5], priority: 'Medium',   status: 'On Hold', assignedTo: TEAMS[4],  dueDate: 'May 23, 2025', slaPct: 50,  overdue: false },
  { woId: 'WO-2505-00132', title: 'CRAC-15 refrigerant recharge',           type: 'Corrective',  asset: 'CRAC-15',        location: LOCS[6], priority: 'High',     status: 'On Hold', assignedTo: TEAMS[0],  dueDate: 'May 21, 2025', slaPct: 35,  overdue: false },

  // Overdue
  { woId: 'WO-2505-00131', title: 'Generator annual inspection',            type: 'Preventive',  asset: 'Generator-02',   location: LOCS[3], priority: 'Critical', status: 'In Progress', assignedTo: TEAMS[3], dueDate: 'May 10, 2025', slaPct: 15, overdue: true  },
  { woId: 'WO-2505-00130', title: 'Emergency lighting battery replacement', type: 'Corrective',  asset: 'EL-Zone-C',      location: LOCS[0], priority: 'High',     status: 'In Progress', assignedTo: TEAMS[0], dueDate: 'May 12, 2025', slaPct: 20, overdue: true  },
  { woId: 'WO-2505-00129', title: 'Chiller water treatment chemical dosing',type: 'Preventive',  asset: 'Chiller-02',     location: LOCS[1], priority: 'Medium',   status: 'Planned',     assignedTo: TEAMS[3], dueDate: 'May 8, 2025',  slaPct: 10, overdue: true  },
  { woId: 'WO-2505-00128', title: 'Network router IOS update',              type: 'Standard',    asset: 'Router-01',      location: LOCS[2], priority: 'High',     status: 'Planned',     assignedTo: TEAMS[4], dueDate: 'May 9, 2025',  slaPct: 5,  overdue: true  },

  // Completed
  { woId: 'WO-2505-00127', title: 'UPS-07 quarterly PM completed',          type: 'Preventive',  asset: 'UPS-07',         location: LOCS[5], priority: 'Medium',   status: 'Completed', assignedTo: TEAMS[1],  dueDate: 'May 15, 2025', slaPct: 100, overdue: false },
  { woId: 'WO-2505-00126', title: 'CMOS battery swap – Server-450',         type: 'Corrective',  asset: 'Server-450',     location: LOCS[6], priority: 'Low',      status: 'Completed', assignedTo: TEAMS[2],  dueDate: 'May 14, 2025', slaPct: 100, overdue: false },
];

export function getWoTabTotal(tabKey) {
  const map = {
    all:         PORTFOLIO.openWorkOrders,
    'in-progress': PORTFOLIO.inProgressWOs,
    planned:     PORTFOLIO.plannedWOs,
    'on-hold':   PORTFOLIO.onHoldWOs,
    overdue:     PORTFOLIO.overdueWOs,
  };
  return map[tabKey] ?? PORTFOLIO.openWorkOrders;
}

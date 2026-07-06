// Supply Chain mock data — aggregate functions derive from arrays (no hardcoded KPIs).

// ─── Purchase Orders (30 records) ─────────────────────────────────────────────
function po(n, vendor, category, orderDate, expectedDate, valueMM, status, progressPct) {
  return {
    poNumber: `PO-2505-${String(n).padStart(4, '0')}`,
    vendor, category, orderDate, expectedDate,
    value: valueMM,
    valueFmt: `$${valueMM}M`,
    status, progressPct,
  };
}

export const PURCHASE_ORDERS = [
  po(1,  'Dell Technologies',  'Server',        'May 15, 2025','Jun 05, 2025', 8.45,  'In Transit',   60),
  po(2,  'NVIDIA',             'GPU',            'May 14, 2025','Jun 10, 2025',12.60,  'In Transit',   45),
  po(3,  'Vertiv',             'Power & Cooling','May 12, 2025','May 28, 2025', 4.32,  'At Warehouse', 90),
  po(4,  'Cisco Systems',      'Networking',     'May 10, 2025','May 25, 2025', 6.80,  'Delivered',   100),
  po(5,  'Schneider Electric', 'Power',          'May 09, 2025','Jun 02, 2025', 5.10,  'Confirmed',    30),
  po(6,  'Supermicro',         'Server',         'May 08, 2025','Jun 07, 2025', 9.20,  'Open',         10),
  po(7,  'Seagate',            'Storage',        'May 07, 2025','May 27, 2025', 3.75,  'Delivered',   100),
  po(8,  'Arista Networks',    'Networking',     'May 06, 2025','Jun 01, 2025', 7.40,  'In Transit',   55),
  po(9,  'Palo Alto Networks', 'Security',       'May 05, 2025','May 30, 2025', 2.90,  'At Warehouse', 88),
  po(10, 'NetApp',             'Storage',        'May 04, 2025','May 29, 2025', 5.60,  'Delivered',   100),
  po(11, 'HPE',                'Server',         'May 03, 2025','Jun 12, 2025',11.30,  'In Transit',   40),
  po(12, 'APC by Schneider',   'Power',          'May 02, 2025','May 26, 2025', 1.85,  'Delivered',   100),
  po(13, 'Juniper Networks',   'Networking',     'May 01, 2025','Jun 03, 2025', 4.75,  'In Transit',   50),
  po(14, 'Pure Storage',       'Storage',        'Apr 30, 2025','Jun 08, 2025', 8.90,  'Confirmed',    25),
  po(15, 'NVIDIA',             'GPU',            'Apr 29, 2025','Jun 15, 2025',15.20,  'In Transit',   35),
  po(16, 'Dell Technologies',  'Server',         'Apr 28, 2025','Jun 04, 2025', 6.10,  'Open',         10),
  po(17, 'Stulz',              'Cooling',        'Apr 27, 2025','May 22, 2025', 3.40,  'Delivered',   100),
  po(18, 'Fortinet',           'Security',       'Apr 26, 2025','May 28, 2025', 2.15,  'In Transit',   65),
  po(19, 'Eaton',              'Power',          'Apr 25, 2025','May 31, 2025', 4.60,  'Confirmed',    30),
  po(20, 'Supermicro',         'Server',         'Apr 24, 2025','Jun 06, 2025', 7.80,  'Open',         10),
  po(21, 'Cisco Systems',      'Networking',     'Apr 23, 2025','May 20, 2025', 5.30,  'Delivered',   100),
  po(22, 'IBM',                'Storage',        'Apr 22, 2025','May 28, 2025', 6.70,  'At Warehouse', 85),
  po(23, 'Vertiv',             'Power & Cooling','Apr 21, 2025','May 25, 2025', 3.90,  'Delivered',   100),
  po(24, 'F5 Networks',        'Networking',     'Apr 20, 2025','May 30, 2025', 2.60,  'In Transit',   70),
  po(25, 'HPE',                'Server',         'Apr 19, 2025','Jun 10, 2025', 9.50,  'Confirmed',    20),
  po(26, 'Dell Technologies',  'Storage',        'Apr 18, 2025','May 24, 2025', 4.20,  'Delivered',   100),
  po(27, 'Schneider Electric', 'Power',          'Apr 17, 2025','May 22, 2025', 3.10,  'Cancelled',    45),
  po(28, 'Seagate',            'Storage',        'Apr 16, 2025','May 21, 2025', 2.80,  'Open',          5),
  po(29, 'Arista Networks',    'Networking',     'Apr 15, 2025','May 19, 2025', 5.95,  'At Warehouse', 92),
  po(30, 'Palo Alto Networks', 'Security',       'Apr 14, 2025','May 18, 2025', 1.70,  'Cancelled',    30),
];

// ─── Shipments (10 records with coordinates) ─────────────────────────────────
export const SHIPMENTS = [
  { shipmentId:'SHP-2505-001', origin:'Shenzhen, CN', destination:'Singapore', originCoords:[22.54,114.06], destinationCoords:[1.35,103.82], eta:'May 22, 2025', status:'In Transit', trackingUrl:'#' },
  { shipmentId:'SHP-2505-002', origin:'Austin, US',   destination:'Singapore', originCoords:[30.27,-97.74], destinationCoords:[1.35,103.82], eta:'May 24, 2025', status:'In Transit', trackingUrl:'#' },
  { shipmentId:'SHP-2505-003', origin:'Taipei, TW',   destination:'Singapore', originCoords:[25.03,121.57], destinationCoords:[1.35,103.82], eta:'May 23, 2025', status:'In Transit', trackingUrl:'#' },
  { shipmentId:'SHP-2505-004', origin:'Frankfurt, DE',destination:'Singapore', originCoords:[50.11,8.68],   destinationCoords:[1.35,103.82], eta:'May 26, 2025', status:'In Transit', trackingUrl:'#' },
  { shipmentId:'SHP-2505-005', origin:'Tokyo, JP',    destination:'Singapore', originCoords:[35.68,139.65], destinationCoords:[1.35,103.82], eta:'May 25, 2025', status:'In Transit', trackingUrl:'#' },
  { shipmentId:'SHP-2505-006', origin:'Seoul, KR',    destination:'Tokyo, JP', originCoords:[37.57,126.98], destinationCoords:[35.68,139.65], eta:'May 20, 2025', status:'Delivered', trackingUrl:'#' },
  { shipmentId:'SHP-2505-007', origin:'Mumbai, IN',   destination:'Singapore', originCoords:[19.08,72.88],  destinationCoords:[1.35,103.82], eta:'May 21, 2025', status:'In Transit', trackingUrl:'#' },
  { shipmentId:'SHP-2505-008', origin:'Sydney, AU',   destination:'Singapore', originCoords:[-33.87,151.21],destinationCoords:[1.35,103.82], eta:'May 19, 2025', status:'Delivered', trackingUrl:'#' },
  { shipmentId:'SHP-2505-009', origin:'London, UK',   destination:'Frankfurt, DE', originCoords:[51.51,-0.13], destinationCoords:[50.11,8.68], eta:'May 18, 2025', status:'Delivered', trackingUrl:'#' },
  { shipmentId:'SHP-2505-010', origin:'Dallas, US',   destination:'Singapore', originCoords:[32.78,-96.80], destinationCoords:[1.35,103.82], eta:'May 27, 2025', status:'In Transit', trackingUrl:'#' },
];

// ─── Vendors (8 records) ─────────────────────────────────────────────────────
export const VENDORS = [
  { name:'Dell Technologies',   spendYtd:56.8, onTimeDeliveryPct:94.2, qualityScore:88 },
  { name:'NVIDIA',              spendYtd:42.3, onTimeDeliveryPct:91.1, qualityScore:90 },
  { name:'Cisco Systems',       spendYtd:28.6, onTimeDeliveryPct:93.5, qualityScore:87 },
  { name:'Vertiv',              spendYtd:24.5, onTimeDeliveryPct:89.3, qualityScore:83 },
  { name:'Schneider Electric',  spendYtd:18.9, onTimeDeliveryPct:92.7, qualityScore:85 },
  { name:'Supermicro',          spendYtd:14.7, onTimeDeliveryPct:87.4, qualityScore:80 },
  { name:'Seagate',             spendYtd: 9.8, onTimeDeliveryPct:95.1, qualityScore:92 },
  { name:'APC by Schneider',    spendYtd: 7.2, onTimeDeliveryPct:90.0, qualityScore:82 },
];

// ─── Inventory by location ────────────────────────────────────────────────────
export const INVENTORY_BY_LOCATION = [
  { location:'Singapore DC - WH1', onHandValue:28.4, onHandQty:12842, utilizationPct:78 },
  { location:'Tokyo DC - WH1',     onHandValue:18.6, onHandQty: 8126, utilizationPct:64 },
  { location:'Sydney DC - WH2',    onHandValue:15.2, onHandQty: 6732, utilizationPct:58 },
  { location:'Dallas DC - WH1',    onHandValue:13.8, onHandQty: 5911, utilizationPct:52 },
  { location:'Frankfurt DC - WH1', onHandValue:11.2, onHandQty: 4980, utilizationPct:46 },
  { location:'Mumbai DC - WH1',    onHandValue: 9.7, onHandQty: 4123, utilizationPct:41 },
];

// ─── Spend by category ────────────────────────────────────────────────────────
export const SPEND_BY_CATEGORY = [
  { name:'IT Hardware',    color:'#0077C8', pct:45.2, amountM:112.4 },
  { name:'Networking',     color:'#7C3AED', pct:18.8, amountM: 46.8 },
  { name:'Power & Cooling',color:'#F59E0B', pct:15.5, amountM: 38.6 },
  { name:'Facilities',     color:'#10B981', pct: 8.7, amountM: 21.7 },
  { name:'Security',       color:'#EF4444', pct: 5.7, amountM: 14.2 },
  { name:'Others',         color:'#6B7280', pct: 6.1, amountM: 15.0 },
];

// ─── Lead-time trend (6 months) ───────────────────────────────────────────────
export const LEAD_TIME_TREND = [
  { month:"Dec '24", average:28.2, target:15 },
  { month:"Jan '25", average:25.1, target:15 },
  { month:"Feb '25", average:23.8, target:14 },
  { month:"Mar '25", average:21.4, target:14 },
  { month:"Apr '25", average:19.7, target:14 },
  { month:"May '25", average:18.6, target:14 },
];

// ─── Supply chain flow stages (portfolio scale) ───────────────────────────────
export const FLOW_STAGES = [
  { key:'ordered',    label:'Ordered',      color:'#10B981', count:302, valueMM:104.6, deltaPct:14 },
  { key:'confirmed',  label:'Confirmed',    color:'#0077C8', count:278, valueMM: 96.1, deltaPct:11 },
  { key:'intransit',  label:'In Transit',   color:'#7C3AED', count: 84, valueMM: 31.8, deltaPct: 5 },
  { key:'warehouse',  label:'At Warehouse', color:'#F59E0B', count: 67, valueMM: 21.4, deltaPct: 8 },
  { key:'delivered',  label:'Delivered',    color:'#06B6D4', count:212, valueMM: 45.6, deltaPct:16 },
];

// ─── Demand planning ──────────────────────────────────────────────────────────
export const DEMAND_PLANNING = {
  assetsReachingEol:    342,
  eolDelta:            '+12%',
  forecastedDemandM:   126.4,
  forecastDelta:       '+8.7%',
  budgetUsedM:          98.6,
  budgetTotalM:        126.4,
  quarterlyForecast: [
    { quarter:"Q2 '25", itHardware:18, networking:9, powerCooling:8, others:6 },
    { quarter:"Q3 '25", itHardware:22, networking:11, powerCooling:9, others:7 },
    { quarter:"Q4 '25", itHardware:20, networking:10, powerCooling:8, others:6 },
    { quarter:"Q1 '26", itHardware:25, networking:13, powerCooling:10, others:8 },
  ],
};

// ─── Aggregate functions (derive from arrays) ─────────────────────────────────
export function getPOStats() {
  const total = PURCHASE_ORDERS.reduce((s, p) => s + p.value, 0);
  const open  = PURCHASE_ORDERS.filter(p => p.status === 'Open');
  const transit = PURCHASE_ORDERS.filter(p => p.status === 'In Transit');
  const delivered = PURCHASE_ORDERS.filter(p => p.status === 'Delivered');
  return {
    totalValueM: Math.round(total * 10) / 10,
    openCount: open.length,
    openValueM: Math.round(open.reduce((s, p) => s + p.value, 0) * 10) / 10,
    inTransitCount: transit.length,
    inTransitValueM: Math.round(transit.reduce((s, p) => s + p.value, 0) * 10) / 10,
    receivedCount: delivered.length,
    receivedValueM: Math.round(delivered.reduce((s, p) => s + p.value, 0) * 10) / 10,
  };
}

export function getInventoryTotal() {
  return {
    totalM: Math.round(INVENTORY_BY_LOCATION.reduce((s, l) => s + l.onHandValue, 0) * 10) / 10,
    totalQty: INVENTORY_BY_LOCATION.reduce((s, l) => s + l.onHandQty, 0),
  };
}

export function getVendorKPIs() {
  const weighted = VENDORS.reduce((s, v) => s + v.onTimeDeliveryPct * v.spendYtd, 0);
  const totalSpend = VENDORS.reduce((s, v) => s + v.spendYtd, 0);
  const avgQuality = Math.round(VENDORS.reduce((s, v) => s + v.qualityScore, 0) / VENDORS.length);
  return {
    onTimeDeliveryPct: Math.round((weighted / totalSpend) * 10) / 10,
    avgQualityScore: avgQuality,
  };
}

export const STATUS_COLORS = {
  'Open':         { color:'#10B981', bg:'rgba(16,185,129,0.15)'  },
  'Confirmed':    { color:'#0077C8', bg:'rgba(0,119,200,0.15)'   },
  'In Transit':   { color:'#0077C8', bg:'rgba(0,119,200,0.15)'   },
  'At Warehouse': { color:'#F59E0B', bg:'rgba(245,158,11,0.15)'  },
  'Delivered':    { color:'#00A36C', bg:'rgba(0,163,108,0.15)'   },
  'Cancelled':    { color:'#6B7280', bg:'rgba(107,114,128,0.15)' },
};

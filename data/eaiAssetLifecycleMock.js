// Individual IT asset records — canonical field names anticipate the future
// IT_ASSET_FIELDS schema for Excel upload / data/assetPortfolioSchema.js.
// All aggregate functions derive from the ASSETS array so this is a
// drop-in replacement target: swap ASSETS for a real API response and
// every chart + table updates automatically.

// ─── Meta ────────────────────────────────────────────────────────────────────
export const CATEGORIES = ['Server', 'Storage', 'Network', 'Power', 'Cooling', 'Security'];

export const LIFECYCLE_STAGES = [
  'In Use', 'Maintenance', 'Repair',
  'Ready for Deployment', 'End of Life', 'Retired', 'Discover',
];

export const STATUSES = ['Operational', 'Maintenance', 'Repair', 'EOL', 'Ready'];

export const AGE_BUCKETS = ['0-1 Year', '1-3 Years', '3-5 Years', '5-7 Years', '7-10 Years', '10+ Years'];

export const STAGE_META = {
  'In Use':                 { color: '#0077C8', bg: 'rgba(0,119,200,0.15)',   icon: '▶' },
  'Maintenance':            { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)',  icon: '🔧' },
  'Repair':                 { color: '#DC2626', bg: 'rgba(220,38,38,0.15)',   icon: '🛠' },
  'Ready for Deployment':   { color: '#7C3AED', bg: 'rgba(124,58,237,0.15)', icon: '✓' },
  'End of Life':            { color: '#EF4444', bg: 'rgba(239,68,68,0.15)',   icon: '⛔' },
  'Retired':                { color: '#6B7280', bg: 'rgba(107,114,128,0.15)', icon: '📦' },
  'Discover':               { color: '#10B981', bg: 'rgba(16,185,129,0.15)', icon: '🔍' },
};

export const STATUS_META = {
  'Operational':  { color: '#00A36C', bg: 'rgba(0,163,108,0.18)'   },
  'Maintenance':  { color: '#F59E0B', bg: 'rgba(245,158,11,0.18)'  },
  'Repair':       { color: '#DC2626', bg: 'rgba(220,38,38,0.18)'   },
  'EOL':          { color: '#6B7280', bg: 'rgba(107,114,128,0.18)' },
  'Ready':        { color: '#7C3AED', bg: 'rgba(124,58,237,0.18)'  },
};

// ─── Portfolio-scale numbers (enterprise dataset) ─────────────────────────────
// In production these would be derived from the full database query.
// Used for pipeline strip display so numbers look realistic.
export const PORTFOLIO = {
  total:     21342,
  byStage: {
    'In Use':               17842,
    'Maintenance':           1642,
    'Repair':                 438,
    'Ready for Deployment':   632,
    'End of Life':            788,
    'Retired':                730,
    'Discover':             21342,
  },
  byCategory: {
    Server:   7532,
    Storage:  3862,
    Network:  3124,
    Power:    2843,
    Cooling:  2126,
    Security: 1245,
    Others:    610,
  },
};

// ─── Asset records ────────────────────────────────────────────────────────────
// Field names follow the planned IT_ASSET_FIELDS canonical schema:
// assetId, assetName, category, vendor, model, serialNumber,
// location, status, lifecycleStage, ageYears, nextMilestone, riskScore.

function mk(assetId, assetName, category, vendor, model, location, status, lifecycleStage, ageYears, milestoneLabel, milestoneDate, riskScore, serialNumber) {
  return { assetId, assetName, category, vendor, model, location, status, lifecycleStage, ageYears, nextMilestone: { label: milestoneLabel, date: milestoneDate }, riskScore, serialNumber };
}

export const ASSETS = [
  // ── Singapore Bldg A — visible in screenshot ──────────────────────────────
  mk('AST-0001245','GPU-Server-01','Server','NVIDIA','DGX H100',
    'Singapore / Bldg A / Fl 2 / Rack A05','Operational','In Use',
    1.2,'Warranty Expiry','Nov 12, 2025',32,'NV-H100-78291'),
  mk('AST-0001246','Storage-Array-01','Storage','NetApp','AFF A250',
    'Singapore / Bldg A / Fl 2 / Room 03','Operational','In Use',
    3.4,'Firmware Update','May 28, 2025',41,'NA-AFF-62341'),
  mk('AST-0001247','Switch-Core-01','Network','Cisco','Nexus 93180YC',
    'Singapore / Bldg A / Fl 2 / Rack B02','Operational','In Use',
    5.6,'EOS in 18 Months','Dec 10, 2025',68,'CS-NX93-55219'),
  mk('AST-0001248','UPS-01','Power','Vertiv','Liebert EXL S1',
    'Singapore / Bldg A / Electrical Room','Maintenance','Maintenance',
    7.1,'Maintenance Due','May 25, 2025',74,'VT-EXLS-12834'),
  mk('AST-0001249','CRAC-Unit-05','Cooling','Stulz','CyberAir 3PRO',
    'Singapore / Bldg A / Fl 3 / Room 07','Operational','In Use',
    8.3,'Filter Replacement','May 21, 2025',82,'ST-CA3P-99012'),
  mk('AST-0001250','PDU-A05-1','Power','APC','Rack PDU G5',
    'Singapore / Bldg A / Fl 2 / Rack A05','Repair','Repair',
    6.8,'Repair Completion','May 22, 2025',76,'APC-PDU-44451'),
  mk('AST-0001251','Server-Old-12','Server','Dell','PowerEdge R740',
    'Singapore / Bldg A / Fl 1 / Rack C12','EOL','End of Life',
    9.2,'Retirement Plan','Jun 05, 2025',91,'DL-R740-30019'),
  mk('AST-0001252','Firewall-01','Security','Palo Alto','PA-5220',
    'Singapore / Bldg A / Network Room','Ready','Ready for Deployment',
    0.2,'Deployment','May 23, 2025',18,'PA-522-00883'),

  // ── Singapore Bldg A — additional servers ────────────────────────────────
  mk('AST-0001253','Server-HPE-01','Server','HPE','ProLiant DL380 Gen10',
    'Singapore / Bldg A / Fl 2 / Rack A05','Operational','In Use',
    2.8,'Firmware Update','Mar 14, 2026',38,'HP-DL38-48271'),
  mk('AST-0001254','Server-HPE-02','Server','HPE','ProLiant DL380 Gen10',
    'Singapore / Bldg A / Fl 2 / Rack B02','Operational','In Use',
    2.8,'Firmware Update','Mar 14, 2026',37,'HP-DL38-48272'),
  mk('AST-0001255','Server-Dell-01','Server','Dell','PowerEdge R750',
    'Singapore / Bldg A / Fl 1 / Rack C12','Operational','In Use',
    1.5,'Warranty Expiry','Dec 20, 2026',28,'DL-R750-71023'),
  mk('AST-0001256','Server-Lenovo-01','Server','Lenovo','ThinkSystem SR650',
    'Singapore / Bldg A / Fl 2 / Rack A05','Operational','In Use',
    3.1,'Maintenance Due','Jun 10, 2025',45,'LN-SR65-20041'),
  mk('AST-0001257','Storage-Pure-01','Storage','Pure Storage','FlashArray//C60',
    'Singapore / Bldg A / Fl 2 / Room 03','Operational','In Use',
    2.2,'Firmware Update','Sep 09, 2025',33,'PS-FAC6-87156'),
  mk('AST-0001258','Storage-HPE-01','Storage','HPE','Nimble HF40',
    'Singapore / Bldg A / Fl 2 / Room 03','Maintenance','Maintenance',
    5.8,'Maintenance Due','Aug 17, 2025',61,'HP-NHF4-33891'),
  mk('AST-0001259','Switch-Arista-01','Network','Arista','7280CR3',
    'Singapore / Bldg A / Fl 2 / Rack B02','Operational','In Use',
    1.8,'Firmware Update','Oct 30, 2025',22,'AR-728C-11043'),
  mk('AST-0001260','Switch-Juniper-01','Network','Juniper','QFX5100',
    'Singapore / Bldg A / Fl 2 / Rack B02','Operational','In Use',
    4.2,'EOS Alert','Jan 15, 2026',52,'JN-QFX5-67234'),
  mk('AST-0001261','UPS-Eaton-01','Power','Eaton','9PX 20kVA',
    'Singapore / Bldg A / Electrical Room','Operational','In Use',
    3.6,'Battery Test','Jul 08, 2025',47,'ET-9PX2-22901'),
  mk('AST-0001262','UPS-Schneider-01','Power','Schneider Electric','Galaxy VX',
    'Singapore / Bldg A / Electrical Room','Operational','In Use',
    2.4,'Firmware Update','Nov 25, 2025',31,'SE-GALX-54321'),
  mk('AST-0001263','CRAC-Liebert-01','Cooling','Vertiv','Liebert DS',
    'Singapore / Bldg A / Fl 3 / Room 07','Operational','In Use',
    4.1,'Filter Replacement','Jul 19, 2025',55,'VT-LBDS-78430'),
  mk('AST-0001264','IDS-Cisco-01','Security','Cisco','ISE 3300',
    'Singapore / Bldg A / Network Room','Operational','In Use',
    1.6,'License Renewal','Feb 14, 2026',25,'CS-ISE3-90123'),

  // ── Tokyo Bldg B ──────────────────────────────────────────────────────────
  mk('AST-0001265','Tokyo-Server-01','Server','NVIDIA','DGX A100',
    'Tokyo / Bldg B / Fl 1 / Rack T01','Operational','In Use',
    2.5,'Warranty Expiry','Nov 05, 2025',35,'NV-A100-39021'),
  mk('AST-0001266','Tokyo-Server-02','Server','Dell','PowerEdge R750',
    'Tokyo / Bldg B / Fl 1 / Rack T01','Operational','In Use',
    0.8,'Warranty Expiry','Dec 18, 2026',15,'DL-R750-71041'),
  mk('AST-0001267','Tokyo-Switch-01','Network','Cisco','Catalyst 9500',
    'Tokyo / Bldg B / Fl 2 / Rack T03','Operational','In Use',
    3.3,'Firmware Update','Dec 01, 2025',43,'CS-C950-44219'),
  mk('AST-0001268','Tokyo-Storage-01','Storage','NetApp','AFF C400',
    'Tokyo / Bldg B / Fl 1 / Rack T01','Operational','In Use',
    1.1,'Firmware Update','Jun 30, 2025',21,'NA-AFC4-17293'),
  mk('AST-0001269','Tokyo-UPS-01','Power','Vertiv','Liebert EXL S1',
    'Tokyo / Bldg B / Electrical Room','Operational','In Use',
    5.2,'Battery Test','Sep 22, 2025',58,'VT-EXLS-88821'),
  mk('AST-0001270','Tokyo-CRAC-01','Cooling','Stulz','CyberAir 3PRO',
    'Tokyo / Bldg B / Fl 2 / Room 05','Operational','In Use',
    6.7,'Major Service','Oct 15, 2025',71,'ST-CA3P-66127'),
  mk('AST-0001271','Tokyo-FW-01','Security','Fortinet','FortiGate 600E',
    'Tokyo / Bldg B / Network Room','Operational','In Use',
    2.0,'Firmware Update','May 28, 2025',28,'FT-FG6E-22341'),
  mk('AST-0001272','Tokyo-PDU-01','Power','APC','Rack PDU G5',
    'Tokyo / Bldg B / Fl 1 / Rack T01','EOL','Retired',
    12.1,'Decommission','Aug 01, 2025',96,'APC-PDU-00118'),

  // ── Sydney Bldg A ─────────────────────────────────────────────────────────
  mk('AST-0001273','Sydney-Server-01','Server','HPE','ProLiant DL560 Gen10',
    'Sydney / Bldg A / Fl 1 / Rack S02','Operational','In Use',
    4.5,'Warranty Renewal','May 10, 2026',54,'HP-DL56-30041'),
  mk('AST-0001274','Sydney-Storage-01','Storage','Dell EMC','Unity XT 380',
    'Sydney / Bldg A / Fl 1 / Rack S02','Operational','In Use',
    3.0,'Firmware Update','Oct 07, 2025',39,'DE-UXT3-58173'),
  mk('AST-0001275','Sydney-Network-01','Network','Arista','7280CR3',
    'Sydney / Bldg A / Fl 1 / Rack S02','Operational','In Use',
    2.3,'Firmware Update','Jan 22, 2026',31,'AR-728C-94028'),
  mk('AST-0001276','Sydney-UPS-01','Power','Eaton','9PX 10kVA',
    'Sydney / Bldg A / Electrical Room','Maintenance','Maintenance',
    8.0,'Battery Replacement','Jun 12, 2025',79,'ET-9PX1-11834'),
  mk('AST-0001277','Sydney-CRAC-01','Cooling','Airedale','SL Series',
    'Sydney / Bldg A / Fl 1 / Room 03','Operational','In Use',
    7.5,'Major Service','Nov 14, 2025',75,'AI-SLS-77023'),
  mk('AST-0001278','Sydney-Server-Old','Server','HP','ProLiant DL380 G7',
    'Sydney / Bldg A / Fl 1 / Rack S02','EOL','End of Life',
    11.2,'Decommission','Jul 31, 2025',95,'HP-DL38-00871'),
  mk('AST-0001279','Sydney-FW-01','Security','Palo Alto','PA-5260',
    'Sydney / Bldg A / Network Room','Operational','In Use',
    1.4,'Firmware Update','Aug 09, 2025',21,'PA-526-01492'),

  // ── Mumbai Bldg C ─────────────────────────────────────────────────────────
  mk('AST-0001280','Mumbai-Server-01','Server','Cisco','UCS C240 M6',
    'Mumbai / Bldg C / Fl 1 / Rack M01','Operational','In Use',
    2.7,'Firmware Update','Apr 19, 2026',37,'CS-UCS2-60831'),
  mk('AST-0001281','Mumbai-Storage-01','Storage','IBM','FlashSystem 5200',
    'Mumbai / Bldg C / Fl 1 / Rack M01','Operational','In Use',
    1.9,'Maintenance Due','Sep 18, 2025',28,'IB-FS52-23091'),
  mk('AST-0001282','Mumbai-Network-01','Network','Juniper','QFX5100',
    'Mumbai / Bldg C / Network Room','Operational','In Use',
    5.1,'EOS Alert','Mar 10, 2026',56,'JN-QFX5-50213'),
  mk('AST-0001283','Mumbai-UPS-01','Power','Schneider Electric','Galaxy VX',
    'Mumbai / Bldg C / Electrical Room','Operational','In Use',
    4.6,'Battery Test','Oct 20, 2025',52,'SE-GALX-71920'),
  mk('AST-0001284','Mumbai-CRAC-01','Cooling','Vertiv','Liebert CW',
    'Mumbai / Bldg C / Fl 1 / Room 02','Operational','In Use',
    6.3,'Filter Replacement','Aug 25, 2025',66,'VT-LBCW-34521'),
  mk('AST-0001285','Mumbai-HSM-01','Security','Thales','Luna HSM 7',
    'Mumbai / Bldg C / Network Room','Operational','In Use',
    3.2,'Firmware Audit','Jan 10, 2026',38,'TH-LHS7-99231'),

  // ── Singapore Bldg A — newer / additional ────────────────────────────────
  mk('AST-0001286','Server-GPU-02','Server','NVIDIA','DGX H100',
    'Singapore / Bldg A / Fl 2 / Rack A05','Operational','In Use',
    0.5,'Warranty Expiry','Nov 20, 2027',12,'NV-H100-88342'),
  mk('AST-0001287','Server-GPU-03','Server','NVIDIA','DGX H100',
    'Singapore / Bldg A / Fl 2 / Rack B02','Operational','In Use',
    0.5,'Warranty Expiry','Nov 20, 2027',11,'NV-H100-88343'),
  mk('AST-0001288','Storage-NetApp-02','Storage','NetApp','AFF A400',
    'Singapore / Bldg A / Fl 2 / Room 03','Operational','In Use',
    0.9,'Firmware Update','Jun 05, 2025',19,'NA-AFF4-91234'),
  mk('AST-0001289','Switch-Cisco-02','Network','Cisco','Nexus 9336',
    'Singapore / Bldg A / Fl 2 / Rack B02','Operational','In Use',
    0.4,'Firmware Update','Dec 15, 2025',10,'CS-NX93-61001'),
  mk('AST-0001290','LoadBalancer-01','Network','F5','BIG-IP 2200',
    'Singapore / Bldg A / Network Room','Operational','In Use',
    2.6,'License Renewal','Mar 28, 2026',36,'F5-BIP2-77841'),
  mk('AST-0001291','CRAC-Vertiv-01','Cooling','Vertiv','Liebert CW',
    'Singapore / Bldg A / Fl 3 / Room 07','Operational','In Use',
    3.4,'Major Service','Dec 22, 2025',48,'VT-LBCW-22981'),
  mk('AST-0001292','HSM-Entrust-01','Security','Entrust','nShield 500',
    'Singapore / Bldg A / Network Room','Operational','In Use',
    4.0,'Firmware Audit','Mar 15, 2026',44,'EN-NSH5-60031'),
  mk('AST-0001293','Server-Supermicro-01','Server','Supermicro','A+ 1114S',
    'Singapore / Bldg A / Fl 1 / Rack C12','Ready','Ready for Deployment',
    0.1,'Deployment','Jun 01, 2025',8,'SM-A11S-01234'),
  mk('AST-0001294','PDU-B02-01','Power','Schneider Electric','APC PDU Basic',
    'Singapore / Bldg A / Fl 2 / Rack B02','Operational','In Use',
    4.9,'Inspection','Nov 05, 2025',58,'SE-APDB-80021'),

  // ── Hamina & Oslo ─────────────────────────────────────────────────────────
  mk('AST-0001295','Hamina-Server-01','Server','Dell','PowerEdge R750',
    'Hamina / Bldg A / Fl 1 / Rack H01','Operational','In Use',
    1.9,'Firmware Update','Aug 02, 2025',24,'DL-R750-55210'),
  mk('AST-0001296','Hamina-UPS-01','Power','Eaton','9PX 20kVA',
    'Hamina / Bldg A / Electrical Room','Operational','In Use',
    3.1,'Battery Test','Dec 10, 2025',40,'ET-9PX2-30902'),
  mk('AST-0001297','Hamina-Storage-01','Storage','Pure Storage','FlashArray//C70',
    'Hamina / Bldg A / Fl 1 / Rack H01','Operational','In Use',
    0.7,'Firmware Update','Sep 30, 2025',14,'PS-FAC7-12930'),
  mk('AST-0001298','Oslo-Server-01','Server','HPE','ProLiant DL380 Gen10',
    'Oslo / Bldg A / Fl 1 / Rack O02','Operational','In Use',
    2.1,'Warranty Expiry','Jan 28, 2026',30,'HP-DL38-70210'),
  mk('AST-0001299','Oslo-CRAC-01','Cooling','Stulz','CyberAir 3PRO',
    'Oslo / Bldg A / Fl 1 / Room 01','Maintenance','Maintenance',
    6.0,'Major Service','Jul 20, 2025',65,'ST-CA3P-41099'),
  mk('AST-0001300','Oslo-FW-01','Security','Fortinet','FortiGate 600E',
    'Oslo / Bldg A / Network Room','Repair','Repair',
    4.3,'Repair Completion','Jun 18, 2025',78,'FT-FG6E-81234'),
];

// ─── Timeline builder ─────────────────────────────────────────────────────────
// Generates a plausible sequence of lifecycle events for any asset.
// today = 2026-07-05 (context date)
function offsetMonths(baseMs, months) {
  const d = new Date(baseMs);
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function buildAssetTimeline(asset) {
  const TODAY_MS = new Date('2026-07-05').getTime();
  const discoveredMs = TODAY_MS - asset.ageYears * 365.25 * 24 * 3600 * 1000;
  const discoveredStr = new Date(discoveredMs).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const deployedStr   = offsetMonths(discoveredMs, 1);

  const stages = [];

  // Past: always discovered
  stages.push({ label: 'Discovered',  date: discoveredStr, sub: 'Auto Discovery',  status: 'past' });

  const isDiscoverOnly = asset.lifecycleStage === 'Discover';
  if (!isDiscoverOnly) {
    stages.push({ label: 'Deployed', date: deployedStr, sub: `Rack ${asset.location.split('/').pop()?.trim() ?? 'A'}`, status: 'past' });
    stages.push({ label: 'In Use',   date: deployedStr, sub: 'Operational', status: 'past' });
  }

  if (['Maintenance', 'Repair', 'End of Life', 'Retired'].includes(asset.lifecycleStage)) {
    const maintMs = discoveredMs + (asset.ageYears * 0.6) * 365.25 * 24 * 3600 * 1000;
    const maintStr = new Date(maintMs).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    stages.push({ label: 'Maintenance', date: maintStr, sub: 'Preventive Check', status: 'past' });
    if (!['End of Life', 'Retired'].includes(asset.lifecycleStage)) {
      stages.push({ label: 'In Use', date: offsetMonths(maintMs, 1), sub: 'Back to Operation', status: 'past' });
    }
  }

  if (asset.lifecycleStage === 'Repair') {
    stages.push({ label: 'Repair', date: asset.nextMilestone.date, sub: 'Under Repair', status: 'current' });
  } else if (asset.lifecycleStage === 'Ready for Deployment') {
    stages.push({ label: 'Ready', date: asset.nextMilestone.date, sub: 'Staged & Tested', status: 'current' });
  } else if (asset.lifecycleStage === 'End of Life') {
    stages.push({ label: 'End of Life', date: asset.nextMilestone.date, sub: 'Decommission', status: 'current' });
  } else if (asset.lifecycleStage === 'Retired') {
    stages.push({ label: 'Retired', date: asset.nextMilestone.date, sub: 'Decommissioned', status: 'current' });
  } else if (!isDiscoverOnly) {
    // In Use → next milestone is future
    stages.push({ label: 'Next Milestone', date: asset.nextMilestone.date, sub: asset.nextMilestone.label, status: 'next' });
  }

  // Future: estimated EOL
  const eolMs = discoveredMs + 10 * 365.25 * 24 * 3600 * 1000;
  const eolStr = new Date(eolMs).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  if (!['End of Life', 'Retired'].includes(asset.lifecycleStage)) {
    stages.push({ label: 'End of Life', date: eolStr, sub: 'Estimated EOL', status: 'future' });
  }

  return stages;
}

// ─── Aggregate functions — derived from ASSETS array ─────────────────────────

export function getLifecycleStats() {
  const counts = {};
  LIFECYCLE_STAGES.forEach(s => { counts[s] = 0; });
  ASSETS.forEach(a => { counts[a.lifecycleStage] = (counts[a.lifecycleStage] ?? 0) + 1; });
  const total = ASSETS.length;
  return { counts, total, pcts: Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, total ? Math.round(v / total * 1000) / 10 : 0])) };
}

export function getCategoryStats() {
  const counts = {};
  CATEGORIES.forEach(c => { counts[c] = 0; });
  ASSETS.forEach(a => { counts[a.category] = (counts[a.category] ?? 0) + 1; });
  const total = ASSETS.length;
  return { counts, total, pcts: Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, total ? Math.round(v / total * 1000) / 10 : 0])) };
}

export function getAgeProfileData() {
  // Returns data for a grouped bar chart keyed by age bucket.
  const bucketIndex = a => {
    if (a.ageYears < 1)  return 0;
    if (a.ageYears < 3)  return 1;
    if (a.ageYears < 5)  return 2;
    if (a.ageYears < 7)  return 3;
    if (a.ageYears < 10) return 4;
    return 5;
  };
  const data = AGE_BUCKETS.map(b => ({ bucket: b, 'In Use': 0, Maintenance: 0, 'EOL <12mo': 0 }));
  ASSETS.forEach(a => {
    const i = bucketIndex(a);
    if (a.lifecycleStage === 'In Use')          data[i]['In Use']      += 1;
    else if (a.lifecycleStage === 'Maintenance') data[i]['Maintenance'] += 1;
    else if (a.lifecycleStage === 'End of Life') data[i]['EOL <12mo']   += 1;
  });
  return data;
}

/**
 * Generates the mock enterprise backend for the Global Infrastructure
 * Intelligence platform: data/google/*.json.
 *
 * This is a deterministic, seeded generator (not hand-authored JSON) so the
 * dataset can be regenerated or re-scaled later — re-run with:
 *   node scripts/generateGoogleBackend.mjs
 *
 * SCOPE NOTE: the literal spec ranges (20-100 racks/room x 20-40 assets/rack
 * across 30 facilities) produce tens of millions of asset rows — not a
 * viable static JSON dataset. Density is scaled down here (see DENSITY)
 * while keeping every level of the hierarchy populated for all 30
 * facilities, rather than going full-depth on a few and shallow on the rest.
 *
 * All operational/financial/technical metrics are DEMO values. Only
 * facility names, cities, countries, regions, and coordinates are modeled
 * on real public information about Google's data center footprint.
 */
import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'data', 'google');
mkdirSync(OUT_DIR, { recursive: true });

// ─── Seeded PRNG (mulberry32) — deterministic across runs ──────────────────
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20260630);
const randInt = (min, max) => Math.floor(rng() * (max - min + 1)) + min;
const randFloat = (min, max, decimals = 2) => +(rng() * (max - min) + min).toFixed(decimals);
const pick = (arr) => arr[Math.floor(rng() * arr.length)];
const pickWeighted = (pairs) => {
  const total = pairs.reduce((s, [, w]) => s + w, 0);
  let r = rng() * total;
  for (const [val, w] of pairs) { if ((r -= w) <= 0) return val; }
  return pairs[0][0];
};
const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const DENSITY = {
  buildingsPerDc: [1, 3],
  floorsPerBuilding: [2, 3],
  roomsPerFloor: [1, 3],
  racksPerRoom: [6, 14],
  assetsPerRack: [4, 9],
};

// ─── Geography: 29 real Google data center locations, real coordinates ─────
// Coordinates for US/EMEA/SG/TW facilities reuse the values already
// established in data/googleDCMasterData.js (same physical campuses) for
// consistency across the app's two Google-DC datasets.
const FACILITIES = [
  // ─ Americas ─
  { code: 'council-bluffs', name: 'Council Bluffs Data Center', campus: 'Council Bluffs Campus', city: 'Council Bluffs', country: 'United States', countryCode: 'US', region: 'Americas', lat: 41.2619, lng: -95.8608, gcpRegion: 'us-central1' },
  { code: 'the-dalles', name: 'The Dalles Data Center', campus: 'The Dalles Campus', city: 'The Dalles', country: 'United States', countryCode: 'US', region: 'Americas', lat: 45.5946, lng: -121.1787, gcpRegion: 'us-west1' },
  { code: 'douglas-county', name: 'Douglas County Data Center', campus: 'Douglas County Campus', city: 'Atlanta', country: 'United States', countryCode: 'US', region: 'Americas', lat: 33.6789, lng: -84.7458, gcpRegion: null },
  { code: 'mayes-county', name: 'Mayes County Data Center', campus: 'Mayes County Campus', city: 'Pryor', country: 'United States', countryCode: 'US', region: 'Americas', lat: 36.2089, lng: -95.2658, gcpRegion: null },
  { code: 'henderson', name: 'Henderson Data Center', campus: 'Henderson Campus', city: 'Henderson', country: 'United States', countryCode: 'US', region: 'Americas', lat: 36.0395, lng: -114.9817, gcpRegion: 'us-west4' },
  { code: 'columbus', name: 'Columbus Data Center', campus: 'New Albany Campus', city: 'Columbus', country: 'United States', countryCode: 'US', region: 'Americas', lat: 40.08, lng: -82.79, gcpRegion: 'us-east5' },
  { code: 'loudoun-county', name: 'Loudoun County Data Center', campus: 'Loudoun County Campus', city: 'Ashburn', country: 'United States', countryCode: 'US', region: 'Americas', lat: 39.08, lng: -77.49, gcpRegion: 'us-east4' },
  { code: 'moncks-corner', name: 'Moncks Corner Data Center', campus: 'Berkeley County Campus', city: 'Moncks Corner', country: 'United States', countryCode: 'US', region: 'Americas', lat: 33.1913, lng: -80.0144, gcpRegion: null },
  { code: 'toronto', name: 'Toronto Data Center', campus: 'Toronto Campus', city: 'Toronto', country: 'Canada', countryCode: 'CA', region: 'Americas', lat: 43.6532, lng: -79.3832, gcpRegion: 'northamerica-northeast2' },
  { code: 'santiago', name: 'Santiago Data Center', campus: 'Quilicura Campus', city: 'Santiago', country: 'Chile', countryCode: 'CL', region: 'Americas', lat: -33.3617, lng: -70.7339, gcpRegion: 'southamerica-west1' },

  // ─ Europe ─
  { code: 'hamina', name: 'Hamina Data Center', campus: 'Hamina Campus', city: 'Hamina', country: 'Finland', countryCode: 'FI', region: 'EMEA', lat: 60.5693, lng: 27.1981, gcpRegion: 'europe-north1' },
  { code: 'st-ghislain', name: 'St. Ghislain Data Center', campus: 'Saint-Ghislain Campus', city: 'Saint-Ghislain', country: 'Belgium', countryCode: 'BE', region: 'EMEA', lat: 50.45, lng: 3.82, gcpRegion: 'europe-west1' },
  { code: 'eemshaven', name: 'Eemshaven Data Center', campus: 'Eemshaven Campus', city: 'Eemshaven', country: 'Netherlands', countryCode: 'NL', region: 'EMEA', lat: 53.4395, lng: 6.8276, gcpRegion: 'europe-west4' },
  { code: 'dublin', name: 'Dublin Data Center', campus: 'Grange Castle Campus', city: 'Dublin', country: 'Ireland', countryCode: 'IE', region: 'EMEA', lat: 53.3016, lng: -6.4185, gcpRegion: 'europe-west2' },
  { code: 'fredericia', name: 'Fredericia Data Center', campus: 'Fredericia Campus', city: 'Fredericia', country: 'Denmark', countryCode: 'DK', region: 'EMEA', lat: 55.5658, lng: 9.7522, gcpRegion: null },
  { code: 'milan', name: 'Milan Data Center', campus: 'Milan Campus', city: 'Milan', country: 'Italy', countryCode: 'IT', region: 'EMEA', lat: 45.4642, lng: 9.19, gcpRegion: 'europe-west8' },
  { code: 'madrid', name: 'Madrid Data Center', campus: 'Madrid Campus', city: 'Madrid', country: 'Spain', countryCode: 'ES', region: 'EMEA', lat: 40.4168, lng: -3.7038, gcpRegion: 'europe-southwest1' },
  { code: 'warsaw', name: 'Warsaw Data Center', campus: 'Warsaw Campus', city: 'Warsaw', country: 'Poland', countryCode: 'PL', region: 'EMEA', lat: 52.2297, lng: 21.0122, gcpRegion: null },

  // ─ Asia Pacific ─
  { code: 'mumbai', name: 'Mumbai Data Center', campus: 'Mumbai Campus', city: 'Mumbai', country: 'India', countryCode: 'IN', region: 'APAC', lat: 19.076, lng: 72.8777, gcpRegion: 'asia-south1' },
  { code: 'delhi-ncr', name: 'Delhi NCR Data Center', campus: 'Delhi NCR Campus', city: 'Delhi', country: 'India', countryCode: 'IN', region: 'APAC', lat: 28.7041, lng: 77.1025, gcpRegion: 'asia-south2' },
  { code: 'singapore', name: 'Singapore Data Center', campus: 'Jurong West Campus', city: 'Singapore', country: 'Singapore', countryCode: 'SG', region: 'APAC', lat: 1.3496, lng: 103.7063, gcpRegion: 'asia-southeast1' },
  { code: 'jakarta', name: 'Jakarta Data Center', campus: 'Jakarta Campus', city: 'Jakarta', country: 'Indonesia', countryCode: 'ID', region: 'APAC', lat: -6.2088, lng: 106.8456, gcpRegion: 'asia-southeast2' },
  { code: 'sydney', name: 'Sydney Data Center', campus: 'Sydney Campus', city: 'Sydney', country: 'Australia', countryCode: 'AU', region: 'APAC', lat: -33.8688, lng: 151.2093, gcpRegion: 'australia-southeast1' },
  { code: 'melbourne', name: 'Melbourne Data Center', campus: 'Melbourne Campus', city: 'Melbourne', country: 'Australia', countryCode: 'AU', region: 'APAC', lat: -37.8136, lng: 144.9631, gcpRegion: 'australia-southeast2' },
  { code: 'taiwan', name: 'Taiwan Data Center', campus: 'Changhua Campus', city: 'Changhua', country: 'Taiwan', countryCode: 'TW', region: 'APAC', lat: 24.0518, lng: 120.5161, gcpRegion: 'asia-east1' },
  { code: 'hong-kong', name: 'Hong Kong Data Center', campus: 'Hong Kong Campus', city: 'Hong Kong', country: 'Hong Kong', countryCode: 'HK', region: 'APAC', lat: 22.3193, lng: 114.1694, gcpRegion: 'asia-east2' },

  // ─ Middle East ─
  { code: 'doha', name: 'Doha Data Center', campus: 'Doha Campus', city: 'Doha', country: 'Qatar', countryCode: 'QA', region: 'MiddleEast', lat: 25.2854, lng: 51.531, gcpRegion: 'me-central1' },
  { code: 'dammam', name: 'Dammam Data Center', campus: 'Dammam Campus', city: 'Dammam', country: 'Saudi Arabia', countryCode: 'SA', region: 'MiddleEast', lat: 26.4207, lng: 50.0888, gcpRegion: 'me-central2' },
  { code: 'tel-aviv', name: 'Tel Aviv Data Center', campus: 'Tel Aviv Campus', city: 'Tel Aviv', country: 'Israel', countryCode: 'IL', region: 'MiddleEast', lat: 32.0853, lng: 34.7818, gcpRegion: 'me-west1' },
];

const REGION_META = {
  Americas: { name: 'Americas' },
  EMEA: { name: 'Europe, Middle East & Africa' },
  APAC: { name: 'Asia Pacific' },
  MiddleEast: { name: 'Middle East' },
};

// ─── Lookup pools ────────────────────────────────────────────────────────
const ASSET_TYPES = [
  { type: 'Server', vendors: [['Dell', 'PowerEdge R750'], ['HPE', 'ProLiant DL380'], ['Lenovo', 'ThinkSystem SR650'], ['Supermicro', 'SYS-1029U']], powerW: [450, 750] },
  { type: 'GPU Server', vendors: [['NVIDIA/Dell', 'PowerEdge XE9680'], ['NVIDIA/Supermicro', 'DGX H100'], ['NVIDIA/Lenovo', 'ThinkSystem SR675 V3']], powerW: [6500, 10200] },
  { type: 'Storage', vendors: [['NetApp', 'FAS8700'], ['Pure Storage', 'FlashArray//X'], ['Dell EMC', 'PowerStore 9000']], powerW: [800, 1800] },
  { type: 'Network Switch', vendors: [['Arista', '7280R3'], ['Cisco', 'Nexus 9336C'], ['Juniper', 'QFX5200']], powerW: [350, 900] },
  { type: 'Firewall', vendors: [['Palo Alto Networks', 'PA-5450'], ['Fortinet', 'FortiGate 3700D']], powerW: [400, 700] },
  { type: 'Router', vendors: [['Juniper', 'MX960'], ['Cisco', 'ASR 9910']], powerW: [1200, 3200] },
  { type: 'PDU', vendors: [['Schneider Electric', 'PowerLogic PDU'], ['Vertiv', 'Geist rPDU']], powerW: [0, 0] },
  { type: 'UPS', vendors: [['Eaton', '9395P'], ['Vertiv', 'Liebert EXM'], ['Schneider Electric', 'Galaxy VX']], powerW: [0, 0] },
  { type: 'Cooling Unit', vendors: [['Schneider Electric', 'Uniflair'], ['Stulz', 'CyberAir 3PRO'], ['Vertiv', 'Liebert PDX']], powerW: [3000, 9000] },
  { type: 'Sensor', vendors: [['Vertiv', 'NetBotz 750'], ['Schneider Electric', 'EcoStruxure IT Sensor']], powerW: [5, 15] },
];
const ASSET_STATUS_WEIGHTS = [['Operational', 88], ['Maintenance', 8], ['Decommissioned', 4]];
const TIERS = ['III', 'III+', 'IV'];
const COOLING_TYPES = ['Air-cooled (CRAH)', 'Liquid-cooled (direct-to-chip)', 'Hybrid air/liquid', 'Immersion (pilot)'];
const UPS_REDUNDANCY = ['N+1', '2N', '2N+1'];
const CERTIFICATIONS = ['LEED Gold', 'LEED Platinum', 'ISO 14001', 'ISO 50001', 'BREEAM Excellent', 'Uptime Institute Tier III Certification'];
const NEWS_CATEGORIES = ['Weather', 'Power', 'Expansion', 'Community', 'Government', 'Cyber'];
const RISK_CATEGORIES = ['Weather', 'Flood', 'Earthquake', 'Political', 'Cyber', 'Grid Stability', 'Supply Chain'];
const RISK_LEVELS = ['Low', 'Medium', 'High'];
const INCIDENT_SEVERITIES = ['Minor', 'Moderate', 'Major'];
const NEWS_SOURCES = ['Data Center Dynamics', 'Regional Business Journal', 'Local Tribune', 'Reuters Wire (regional desk)', 'Utility Sector Weekly'];
const DOCUMENT_TYPES = ['Sustainability Report Reference', 'Environmental Permit Filing', 'Local Press Release', 'Community Benefit Agreement', 'Grid Interconnection Filing'];

let idCounters = {};
function nextId(prefix) {
  idCounters[prefix] = (idCounters[prefix] ?? 0) + 1;
  return `${prefix}-${String(idCounters[prefix]).padStart(5, '0')}`;
}

// ─── Portfolio / Region / Country ───────────────────────────────────────
const regionIds = {};
const regions = Object.entries(REGION_META).map(([code, meta]) => {
  const id = nextId('REG');
  regionIds[code] = id;
  return { id, code, name: meta.name, countryIds: [], campusIds: [], dataCenterIds: [] };
});

const countryIds = {};
const countries = [];
function getOrCreateCountry(facility) {
  const key = facility.countryCode;
  if (countryIds[key]) return countryIds[key];
  const id = nextId('CTY');
  countryIds[key] = id;
  countries.push({
    id, code: facility.countryCode, name: facility.country, regionId: regionIds[facility.region],
    regionCode: facility.region, campusIds: [], dataCenterIds: [],
  });
  regions.find(r => r.code === facility.region).countryIds.push(id);
  return id;
}

// ─── Build the full hierarchy ───────────────────────────────────────────
const campuses = [];
const dataCenters = [];
const buildings = [];
const floors = [];
const rooms = [];
const rows = [];
const racks = [];
const assets = [];
const esgRecords = [];
const weatherRecords = [];
const newsRecords = [];
const riskRecords = [];
const maintenanceRecords = [];
const incidentRecords = [];
const aiInsightRecords = [];
const documentRecords = [];
const relationships = [];

function addRelationship(parentId, parentType, childId, childType) {
  relationships.push({ id: nextId('REL'), parentId, parentType, childId, childType });
}

for (const facility of FACILITIES) {
  const countryId = getOrCreateCountry(facility);
  const regionId = regionIds[facility.region];

  const campusId = nextId('CMP');
  const campus = {
    id: campusId,
    name: facility.campus,
    code: facility.code,
    countryId, regionId,
    city: facility.city,
    latitude: facility.lat,
    longitude: facility.lng,
    areaAcres: randInt(40, 400),
    dataCenterIds: [],
  };
  campuses.push(campus);
  regions.find(r => r.id === regionId).campusIds.push(campusId);
  countries.find(c => c.id === countryId).campusIds.push(campusId);
  addRelationship(regionId, 'Region', countryId, 'Country');
  addRelationship(countryId, 'Country', campusId, 'Campus');

  const dcId = nextId('DC');
  const status = pickWeighted([['Active', 80], ['Under Construction', 20]]);
  const capacityMw = randInt(45, 230);
  const pue = randFloat(1.06, 1.22, 2);
  const renewablePct = randInt(18, 100);
  const utilizationPct = status === 'Active' ? randInt(55, 94) : randInt(5, 25);
  const riskScoreBase = randInt(10, 70);

  const dataCenter = {
    id: dcId,
    identity: {
      name: facility.name,
      displayCode: facility.code.toUpperCase(),
      operator: 'Google LLC',
      facilityType: 'Hyperscale Campus',
      tier: pick(TIERS),
      status,
      commissionedYear: status === 'Active' ? randInt(2008, 2022) : null,
      plannedOnlineYear: status === 'Under Construction' ? randInt(2026, 2029) : null,
    },
    location: {
      campusId, countryId, regionId,
      city: facility.city,
      country: facility.country,
      region: facility.region,
      latitude: facility.lat,
      longitude: facility.lng,
      timezone: pick(['UTC-6', 'UTC-5', 'UTC-8', 'UTC', 'UTC+1', 'UTC+2', 'UTC+3', 'UTC+5:30', 'UTC+8', 'UTC+9', 'UTC+10', 'UTC+11']),
      elevationM: randInt(2, 420),
    },
    campus: {
      campusName: facility.campus,
      campusAreaAcres: campus.areaAcres,
    },
    infrastructure: {
      buildingCount: 0, // filled after building generation
      floorCount: 0,
      roomCount: 0,
      rackCount: 0,
      totalAreaSqm: randInt(15000, 140000),
      whiteSpaceSqm: randInt(8000, 90000),
      constructionType: pick(['Concrete tilt-wall', 'Pre-engineered steel', 'Modular prefabricated']),
      seismicRating: pick(['Standard', 'Enhanced — Zone 3+', 'Enhanced — Zone 4']),
    },
    capacity: {
      itCapacityMw: capacityMw,
      totalCapacityMw: Math.round(capacityMw * 1.18),
      capacityUtilizationPct: utilizationPct,
      plannedExpansionMw: status === 'Under Construction' ? randInt(40, 120) : randInt(0, 60),
      maxDesignCapacityMw: Math.round(capacityMw * 1.6),
    },
    power: {
      substationCapacityMva: randInt(150, 600),
      backupGeneratorCount: randInt(6, 24),
      backupGeneratorCapacityMw: randInt(10, 40),
      upsRedundancy: pick(UPS_REDUNDANCY),
      pue,
      wue: randFloat(0.15, 1.8, 2),
      gridConnectionKv: pick([115, 138, 230, 345, 400]),
    },
    cooling: {
      coolingType: pick(COOLING_TYPES),
      coolingCapacityMw: Math.round(capacityMw * 1.1),
      coolingRedundancy: pick(UPS_REDUNDANCY),
      chillerCount: randInt(4, 18),
      freeCoolingHoursPct: randInt(20, 85),
      coolingWaterSourceType: pick(['Municipal reclaimed water', 'Closed-loop (no external water)', 'Groundwater', 'Surface water — permitted withdrawal']),
    },
    network: {
      networkTier: pick(['Tier 1 backbone POP', 'Regional aggregation site', 'Edge POP + backbone']),
      fiberProviders: shuffle(['Lumen', 'Zayo', 'GTT', 'Colt', 'Equinix Fabric', 'Vodafone Carrier']).slice(0, randInt(2, 4)),
      peeringExchanges: shuffle(['DE-CIX', 'AMS-IX', 'LINX', 'Equinix IX', 'NAPAfrica', 'HKIX']).slice(0, randInt(0, 2)),
      internalBackboneGbps: randInt(400, 3200),
      edgePoPCount: randInt(0, 3),
    },
    storage: {
      storageCapacityPb: randInt(50, 900),
      storageType: pick(['NVMe all-flash + object tier', 'Hybrid flash/HDD', 'Distributed object storage']),
      backupRetentionDays: pick([30, 60, 90, 180]),
    },
    gpu: {
      gpuClusterCount: randInt(0, 6),
      totalGpuUnits: randInt(0, 12) * 1024,
      gpuGeneration: pick(['NVIDIA H100', 'NVIDIA A100', 'NVIDIA B200', 'TPU v5e (Google custom silicon)']),
      aiTrainingCapable: rng() > 0.4,
      aiWorkloadPct: randInt(5, 60),
    },
    utilities: {
      waterSourceType: pick(['Municipal', 'Reclaimed/recycled', 'Groundwater well', 'Air-cooled — minimal water']),
      wasteHeatRecovery: rng() > 0.7,
      onsiteSubstation: rng() > 0.3,
      naturalGasBackup: rng() > 0.8,
    },
    esg: {
      renewablePct,
      carbonIntensityKgPerMwh: randFloat(5, 420, 1),
      annualCarbonOffsetTons: randInt(500, 18000),
      esgScore: randInt(55, 96),
      esgGrade: null, // derived below
      sustainabilityCertifications: shuffle(CERTIFICATIONS).slice(0, randInt(1, 3)),
      waterUsageMlPerYear: randFloat(20, 900, 1),
      circularWaterPct: randInt(0, 70),
    },
    risk: {
      overallRiskScore: riskScoreBase,
      riskLevel: riskScoreBase >= 55 ? 'High' : riskScoreBase >= 30 ? 'Medium' : 'Low',
    },
    weather: {
      climateZone: pick(['Humid continental', 'Mediterranean', 'Oceanic', 'Tropical', 'Arid', 'Subtropical', 'Subarctic']),
    },
    operations: {
      operationalStatus: status === 'Active' ? 'Online' : 'Pre-commissioning',
      uptimePct: status === 'Active' ? randFloat(99.9, 99.999, 3) : null,
      activeIncidentCount: randInt(0, 3),
      alarmCriticalCount: randInt(0, 2),
      alarmHighCount: randInt(0, 5),
      alarmMediumCount: randInt(1, 10),
      alarmLowCount: randInt(2, 20),
      lastAuditDate: `2026-${String(randInt(1, 6)).padStart(2, '0')}-${String(randInt(1, 28)).padStart(2, '0')}`,
    },
    maintenance: {
      maintenanceWindowHours: pick([4, 6, 8]),
      openWorkOrders: randInt(0, 14),
      preventiveMaintenanceCompliancePct: randInt(82, 100),
    },
    publicInfo: {
      googleCloudRegion: facility.gcpRegion,
      publicSustainabilityInitiative: 'Google 24/7 Carbon-Free Energy Initiative',
      sourceNote: 'Location/name based on publicly reported Google data center sites. GCP region mapping is best-effort and not an official Google disclosure.',
    },
    aiSummaryId: null, // filled after aiInsights generation
  };
  dataCenter.esg.esgGrade = dataCenter.esg.esgScore >= 90 ? 'A' : dataCenter.esg.esgScore >= 75 ? 'B' : dataCenter.esg.esgScore >= 60 ? 'C' : 'D';

  dataCenters.push(dataCenter);
  campus.dataCenterIds.push(dcId);
  countries.find(c => c.id === countryId).dataCenterIds.push(dcId);
  regions.find(r => r.id === regionId).dataCenterIds.push(dcId);
  addRelationship(campusId, 'Campus', dcId, 'DataCenter');

  // ─ Buildings -> Floors -> Rooms -> Rows -> Racks -> Assets ─
  let dcBuildingCount = 0, dcFloorCount = 0, dcRoomCount = 0, dcRackCount = 0;
  const buildingCount = randInt(...DENSITY.buildingsPerDc);
  for (let b = 0; b < buildingCount; b++) {
    const buildingId = nextId('BLD');
    const buildingFloorCount = randInt(...DENSITY.floorsPerBuilding);
    buildings.push({
      id: buildingId, dataCenterId: dcId,
      name: `Building ${String.fromCharCode(65 + b)}`,
      floorCount: buildingFloorCount,
      areaSqm: randInt(8000, 40000),
      constructionYear: dataCenter.identity.commissionedYear ?? randInt(2024, 2027),
      status: status === 'Active' ? 'Operational' : 'Under Construction',
    });
    dcBuildingCount++;
    addRelationship(dcId, 'DataCenter', buildingId, 'Building');

    for (let f = 0; f < buildingFloorCount; f++) {
      const floorId = nextId('FLR');
      const floorRoomCount = randInt(...DENSITY.roomsPerFloor);
      floors.push({
        id: floorId, buildingId, dataCenterId: dcId,
        level: f + 1,
        roomCount: floorRoomCount,
        purpose: f === 0 ? 'Server Hall + MEP' : 'Server Hall',
      });
      dcFloorCount++;
      addRelationship(buildingId, 'Building', floorId, 'Floor');

      for (let r = 0; r < floorRoomCount; r++) {
        const roomId = nextId('RM');
        const roomRackCount = randInt(...DENSITY.racksPerRoom);
        rooms.push({
          id: roomId, floorId, buildingId, dataCenterId: dcId,
          name: `Room ${f + 1}-${r + 1}`,
          type: pick(['Server Hall', 'Server Hall', 'Network Core Room']),
          rackCount: roomRackCount,
          areaSqm: randInt(400, 2200),
          coolingType: dataCenter.cooling.coolingType,
        });
        dcRoomCount++;
        addRelationship(floorId, 'Floor', roomId, 'Room');

        const rowId = nextId('ROW');
        rows.push({ id: rowId, roomId, floorId, buildingId, dataCenterId: dcId, rowLabel: `Row-${r + 1}`, rackCount: roomRackCount });
        addRelationship(roomId, 'Room', rowId, 'Row');

        for (let k = 0; k < roomRackCount; k++) {
          const rackId = nextId('RACK');
          const rackAssetCount = randInt(...DENSITY.assetsPerRack);
          racks.push({
            id: rackId, rowId, roomId, floorId, buildingId, dataCenterId: dcId,
            rackLabel: `R${k + 1}`,
            rackType: pick(['Standard 42U', 'High-density 48U', 'GPU rack — liquid-cooled']),
            uHeight: pick([42, 45, 48]),
            powerDrawKw: randFloat(4, 18, 1),
            assetCount: rackAssetCount,
          });
          dcRackCount++;
          addRelationship(rowId, 'Row', rackId, 'Rack');

          for (let a = 0; a < rackAssetCount; a++) {
            const assetDef = pick(ASSET_TYPES);
            const [vendor, model] = pick(assetDef.vendors);
            const assetId = nextId('AST');
            assets.push({
              id: assetId, rackId, roomId, dataCenterId: dcId,
              type: assetDef.type,
              vendor, model,
              serialNumber: `SN-${facility.code.slice(0, 3).toUpperCase()}-${randInt(100000, 999999)}`,
              status: pickWeighted(ASSET_STATUS_WEIGHTS),
              installationDate: `${randInt(2018, 2025)}-${String(randInt(1, 12)).padStart(2, '0')}-${String(randInt(1, 28)).padStart(2, '0')}`,
              warrantyExpiry: `${randInt(2026, 2030)}-${String(randInt(1, 12)).padStart(2, '0')}-${String(randInt(1, 28)).padStart(2, '0')}`,
              powerDrawW: randInt(assetDef.powerW[0], Math.max(assetDef.powerW[1], assetDef.powerW[0] + 1)),
              rackPositionU: randInt(1, 42),
            });
            addRelationship(rackId, 'Rack', assetId, 'Asset');
          }
        }
      }
    }
  }
  dataCenter.infrastructure.buildingCount = dcBuildingCount;
  dataCenter.infrastructure.floorCount = dcFloorCount;
  dataCenter.infrastructure.roomCount = dcRoomCount;
  dataCenter.infrastructure.rackCount = dcRackCount;

  // ─ ESG monthly trend (12 months) ─
  for (let m = 0; m < 12; m++) {
    esgRecords.push({
      id: nextId('ESG'), dataCenterId: dcId,
      month: `2025-${String(m + 1).padStart(2, '0')}`,
      renewablePct: Math.max(0, Math.min(100, renewablePct + randInt(-6, 6))),
      carbonIntensityKgPerMwh: Math.max(0, dataCenter.esg.carbonIntensityKgPerMwh + randFloat(-15, 15, 1)),
      pue: Math.max(1.02, pue + randFloat(-0.03, 0.03, 3)),
      wue: Math.max(0.05, dataCenter.esg.waterUsageMlPerYear / 12 / 100),
      energyMix: { renewable: renewablePct, gridMix: 100 - renewablePct },
    });
  }

  // ─ Weather profile ─
  weatherRecords.push({
    id: nextId('WX'), dataCenterId: dcId,
    climateZone: dataCenter.weather.climateZone,
    current: {
      tempC: randInt(-5, 38),
      condition: pick(['Clear', 'Partly cloudy', 'Overcast', 'Light rain', 'Windy', 'Humid']),
      humidityPct: randInt(25, 90),
      windKph: randInt(5, 45),
    },
    seasonalAvgTempC: { q1: randInt(-10, 30), q2: randInt(0, 35), q3: randInt(5, 40), q4: randInt(-5, 30) },
    extremeWeatherEvents: shuffle(['Heatwave', 'Coastal storm', 'Heavy snowfall', 'Monsoon flooding', 'Drought', 'None recorded (5yr)']).slice(0, randInt(0, 2)),
    riskNotes: 'Demo placeholder — not a live weather feed.',
  });

  // ─ Risk register (one row per category) ─
  for (const category of RISK_CATEGORIES) {
    const level = pickWeighted([['Low', 60], ['Medium', 30], ['High', 10]]);
    riskRecords.push({
      id: nextId('RISK'), dataCenterId: dcId,
      category, level,
      score: level === 'High' ? randInt(70, 95) : level === 'Medium' ? randInt(35, 69) : randInt(5, 34),
      narrative: `${category} risk assessed as ${level.toLowerCase()} based on regional historical data and site mitigations.`,
      lastAssessed: `2026-${String(randInt(1, 6)).padStart(2, '0')}-01`,
    });
  }

  // ─ News (3 per facility) ─
  for (let n = 0; n < 3; n++) {
    const category = pick(NEWS_CATEGORIES);
    riskRecords.length; // no-op to keep block shape consistent
    newsRecords.push({
      id: nextId('NEWS'), dataCenterId: dcId,
      category,
      headline: `${facility.city} data center ${{
        Weather: 'operations unaffected by seasonal weather advisory',
        Power: 'secures additional renewable power purchase agreement',
        Expansion: 'campus expansion enters next planning phase',
        Community: 'announces local workforce and STEM education funding',
        Government: 'receives updated local zoning and permit approval',
        Cyber: 'completes annual third-party security audit',
      }[category]}`,
      source: pick(NEWS_SOURCES),
      publishedDate: `2026-${String(randInt(1, 6)).padStart(2, '0')}-${String(randInt(1, 28)).padStart(2, '0')}`,
    });
  }

  // ─ Maintenance — historical completed records for every facility, plus
  // upcoming scheduled work for only a realistic subset (not every site has
  // maintenance scheduled at once — otherwise "Under Maintenance" KPIs and
  // filters are meaningless, since they'd always equal the total count).
  const scheduledCount = pickWeighted([[0, 50], [1, 35], [2, 15]]);
  for (let mIdx = 0; mIdx < 4; mIdx++) {
    const scheduled = mIdx < scheduledCount;
    maintenanceRecords.push({
      id: nextId('MNT'), dataCenterId: dcId,
      type: pick(['Generator load test', 'Chiller preventive maintenance', 'UPS battery replacement', 'Fire suppression inspection', 'Switchgear thermal scan']),
      status: scheduled ? 'Scheduled' : 'Completed',
      date: scheduled
        ? `2026-${String(randInt(7, 12)).padStart(2, '0')}-${String(randInt(1, 28)).padStart(2, '0')}`
        : `2026-${String(randInt(1, 6)).padStart(2, '0')}-${String(randInt(1, 28)).padStart(2, '0')}`,
      durationHours: pick([2, 4, 6, 8]),
    });
  }

  // ─ Incidents (2-4 per facility) ─
  const incidentCount = randInt(2, 4);
  for (let i = 0; i < incidentCount; i++) {
    incidentRecords.push({
      id: nextId('INC'), dataCenterId: dcId,
      severity: pick(INCIDENT_SEVERITIES),
      summary: pick(['Brief cooling capacity excursion, auto-remediated', 'Localized power feed transfer event', 'Network link flap on redundant path', 'Sensor false-positive alarm storm', 'Scheduled maintenance overrun']),
      status: pickWeighted([['Resolved', 85], ['Monitoring', 15]]),
      occurredAt: `2025-${String(randInt(1, 12)).padStart(2, '0')}-${String(randInt(1, 28)).padStart(2, '0')}`,
    });
  }

  // ─ AI executive summary ─
  const aiId = nextId('AI');
  aiInsightRecords.push({
    id: aiId, dataCenterId: dcId,
    disclaimer: 'Demo AI summary — templated, not generated by a live model.',
    operationalPosture: `${facility.name} is currently ${status === 'Active' ? `online at ${utilizationPct}% utilization with ${dataCenter.operations.uptimePct}% uptime` : 'in pre-commissioning, ramping toward planned online date'}.`,
    capacityObservations: `IT capacity stands at ${capacityMw} MW against a max design of ${dataCenter.capacity.maxDesignCapacityMw} MW, leaving ${dataCenter.capacity.maxDesignCapacityMw - capacityMw} MW of long-term headroom.`,
    esgObservations: `Renewable mix is ${renewablePct}%, with a PUE of ${pue} and ESG grade ${dataCenter.esg.esgGrade}.`,
    riskObservations: `Overall risk score ${riskScoreBase}/100 (${dataCenter.risk.riskLevel}), driven primarily by regional ${pick(RISK_CATEGORIES).toLowerCase()} exposure.`,
    recommendations: shuffle([
      'Review backup generator load test cadence against regional grid stability trends.',
      'Evaluate liquid-cooling retrofit for GPU-dense rows ahead of next capacity phase.',
      'Increase renewable PPA coverage to close the gap to portfolio-leading sites.',
      'Validate flood mitigation plan against updated regional climate projections.',
      'Prioritize preventive maintenance backlog before peak seasonal load.',
    ]).slice(0, 3),
  });
  dataCenter.aiSummaryId = aiId;
  addRelationship(dcId, 'DataCenter', aiId, 'AIInsight');

  // ─ Public documents (2-3 per facility) ─
  const docCount = randInt(2, 3);
  for (let d = 0; d < docCount; d++) {
    documentRecords.push({
      id: nextId('DOC'), dataCenterId: dcId,
      title: `${facility.name} — ${pick(DOCUMENT_TYPES)}`,
      type: pick(DOCUMENT_TYPES),
      publishedYear: randInt(2019, 2026),
      sourceNote: 'Reference only — see Google\'s public Environmental Report and official data center site pages for verified information.',
    });
  }
}

// ─── Portfolio rollup ────────────────────────────────────────────────────
const portfolio = {
  id: 'POR-00001',
  name: 'Google Global Data Center Portfolio (Demo)',
  owner: 'Google LLC',
  generatedAt: new Date().toISOString(),
  disclaimer: 'Facility names, cities, countries, regions, and coordinates are modeled on publicly available information about Google\'s data center footprint. All capacity, power, cooling, ESG, risk, financial, and asset-level figures are synthetic demo values for this platform and do not represent real Google operational data.',
  totals: {
    regionCount: regions.length,
    countryCount: countries.length,
    campusCount: campuses.length,
    dataCenterCount: dataCenters.length,
    buildingCount: buildings.length,
    floorCount: floors.length,
    roomCount: rooms.length,
    rackCount: racks.length,
    assetCount: assets.length,
    totalCapacityMw: Math.round(dataCenters.reduce((s, d) => s + d.capacity.itCapacityMw, 0)),
  },
  regionIds: regions.map(r => r.id),
};

// ─── Search index ────────────────────────────────────────────────────────
const searchIndex = [
  ...regions.map(r => ({ id: r.id, type: 'Region', label: r.name, path: r.name })),
  ...countries.map(c => ({ id: c.id, type: 'Country', label: c.name, path: `${regions.find(r => r.id === c.regionId).name} / ${c.name}` })),
  ...campuses.map(c => {
    const country = countries.find(x => x.id === c.countryId);
    return { id: c.id, type: 'Campus', label: c.name, path: `${country.name} / ${c.name}` };
  }),
  ...dataCenters.map(d => ({ id: d.id, type: 'DataCenter', label: d.identity.name, path: `${d.location.country} / ${d.location.city} / ${d.identity.name}` })),
  ...racks.map(r => ({ id: r.id, type: 'Rack', label: r.rackLabel, path: `${r.dataCenterId} / ${r.roomId} / ${r.rackLabel}` })),
  ...assets.map(a => ({ id: a.id, type: 'Asset', label: `${a.type} — ${a.serialNumber}`, path: `${a.dataCenterId} / ${a.rackId} / ${a.serialNumber}` })),
];

// ─── Metadata ────────────────────────────────────────────────────────────
const metadata = {
  generatedAt: new Date().toISOString(),
  generator: 'scripts/generateGoogleBackend.mjs',
  seed: 20260630,
  density: DENSITY,
  recordCounts: {
    regions: regions.length, countries: countries.length, campuses: campuses.length,
    dataCenters: dataCenters.length, buildings: buildings.length, floors: floors.length,
    rooms: rooms.length, rows: rows.length, racks: racks.length, assets: assets.length,
    esg: esgRecords.length, weather: weatherRecords.length, news: newsRecords.length,
    risks: riskRecords.length, maintenance: maintenanceRecords.length, incidents: incidentRecords.length,
    aiInsights: aiInsightRecords.length, documents: documentRecords.length, relationships: relationships.length,
    searchIndex: searchIndex.length,
  },
  disclaimer: portfolio.disclaimer,
};

// ─── Write files ─────────────────────────────────────────────────────────
function write(filename, data) {
  writeFileSync(path.join(OUT_DIR, filename), JSON.stringify(data, null, 2) + '\n');
}

write('portfolio.json', portfolio);
write('regions.json', regions);
write('countries.json', countries);
write('campuses.json', campuses);
write('datacenters.json', dataCenters);
write('buildings.json', buildings);
write('floors.json', floors);
write('rooms.json', rooms);
write('rows.json', rows);
write('racks.json', racks);
write('assets.json', assets);
write('esg.json', esgRecords);
write('weather.json', weatherRecords);
write('news.json', newsRecords);
write('risks.json', riskRecords);
write('maintenance.json', maintenanceRecords);
write('incidents.json', incidentRecords);
write('aiInsights.json', aiInsightRecords);
write('documents.json', documentRecords);
write('relationships.json', relationships);
write('searchIndex.json', searchIndex);

// Lightweight precomputed per-DC asset-type counts, so callers that only
// need counts (e.g. KPI/adapter logic) don't have to pull the full
// multi-MB assets.json into their bundle just to tally types.
const assetTypeCounts = dataCenters.map(dc => {
  const dcAssets = assets.filter(a => a.dataCenterId === dc.id);
  const counts = {};
  for (const a of dcAssets) counts[a.type] = (counts[a.type] ?? 0) + 1;
  return { dataCenterId: dc.id, counts };
});
write('assetTypeCounts.json', assetTypeCounts);

write('metadata.json', metadata);

console.log('Generated:', metadata.recordCounts);

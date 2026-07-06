// data/realEstateHierarchy.js
// Flat node map for the Real Estate Explorer hierarchy.
// Nodes exist from region → room; racks are generated on-demand via getRackNodesForRoom().
// Buildings carry a dcId that links to data/mock/racks.js and components/datacenters/*.

import { mockRacks, generateDCRacks } from '@/data/mock/racks';

// ── rack stats helper ─────────────────────────────────────────────────────────
function roomStatsFromDcId(dcId) {
  const racks = mockRacks[dcId] || generateDCRacks(dcId);
  const totalKw = racks.reduce((s, r) => s + r.maxPowerKw, 0);
  const usedKw  = racks.reduce((s, r) => s + r.powerKw,    0);
  const avgTemp = racks.reduce((s, r) => s + r.inletTempC, 0) / racks.length;
  const avgOcc  = racks.reduce((s, r) => s + Math.round(r.spaceUsedU / r.spaceTotalU * 100), 0) / racks.length;
  const nCrit   = racks.filter(r => r.status === 'critical').length;
  const nWarn   = racks.filter(r => r.status === 'warning').length;
  return {
    capacityMw:    +(totalKw / 1000).toFixed(2),
    itCapacityMw:  +(usedKw  / 1000).toFixed(2),
    utilizationPct: Math.round((usedKw / totalKw) * 100),
    areaSqft:      12500,
    occupancyPct:  Math.round(avgOcc),
    avgTempC:      +avgTemp.toFixed(1),
    pue:           1.35,
    status:        nCrit > 0 ? 'critical' : nWarn > 0 ? 'maintenance' : 'operational',
    rackCount:     racks.length,
  };
}

// ── seed builder helpers ──────────────────────────────────────────────────────
let _nodes = {};

function addNode(n) { _nodes[n.id] = n; }

function makeRoom(id, parentId, name, type, dcId, overrides = {}) {
  const base = type === 'datacenter-floor' ? roomStatsFromDcId(dcId) : {
    capacityMw: 0.8, itCapacityMw: 0.6, utilizationPct: 72,
    areaSqft: 800, occupancyPct: 65, avgTempC: 21.0, pue: 1.0,
    status: 'operational', rackCount: 0,
  };
  addNode({
    id, type: 'room', parentId, name,
    children: [],
    roomType: type,
    dcId: type === 'datacenter-floor' ? dcId : null,
    geo: overrides.geo || { x: 14, y: 10, w: 72, h: 80 },
    ...base,
    ...overrides,
  });
  return id;
}

function makeFloor(id, parentId, name, dcId, roomDefs) {
  const roomIds = roomDefs.map(r => makeRoom(r.id, id, r.name, r.type, dcId, r.overrides));
  addNode({
    id, type: 'floor', parentId, name,
    children: roomIds,
    geo: null,
    capacityMw: 0, itCapacityMw: 0, utilizationPct: 0, // aggregated by getNodeStats
    areaSqft: 0, occupancyPct: 0, avgTempC: 0, pue: 0,
    status: 'operational',
  });
  return id;
}

function makeBuilding(id, parentId, name, dcId, geo, floorDefs) {
  const floorIds = floorDefs.map(f => makeFloor(f.id, id, f.name, dcId, f.rooms));
  addNode({
    id, type: 'building', parentId, name,
    children: floorIds,
    dcId,
    geo,
    capacityMw: 0, itCapacityMw: 0, utilizationPct: 0,
    areaSqft: 0, occupancyPct: 0, avgTempC: 0, pue: 0,
    status: 'operational',
  });
  return id;
}

function makeCampus(id, parentId, name, dcId, geo, buildingDefs) {
  const bldIds = buildingDefs.map(b =>
    makeBuilding(b.id, id, b.name, b.dcId || dcId, b.geo, b.floors)
  );
  addNode({
    id, type: 'campus', parentId, name,
    children: bldIds,
    dcId,
    geo,
    capacityMw: 0, itCapacityMw: 0, utilizationPct: 0,
    areaSqft: 0, occupancyPct: 0, avgTempC: 0, pue: 0,
    status: 'operational',
  });
  return id;
}

function makeRegion(id, name, geo, campusDefs) {
  const cmpIds = campusDefs.map(c => makeCampus(c.id, id, c.name, c.dcId, c.geo, c.buildings));
  addNode({
    id, type: 'region', parentId: null, name,
    children: cmpIds,
    geo,
    capacityMw: 0, itCapacityMw: 0, utilizationPct: 0,
    areaSqft: 0, occupancyPct: 0, avgTempC: 0, pue: 0,
    status: 'operational',
  });
  return id;
}

// ── Reusable room templates ───────────────────────────────────────────────────
const DC_ROOMS = (prefix, floor, dcId) => [
  { id: `${prefix}-f${floor}-dc`,  name: `Room A0${floor}`, type: 'datacenter-floor', overrides: { geo: { x: 14, y: 10, w: 72, h: 80 } } },
  { id: `${prefix}-f${floor}-ups`, name: 'UPS Room',        type: 'support',          overrides: { geo: { x: 0,  y: 0,  w: 12, h: 50 } } },
  { id: `${prefix}-f${floor}-elec`,name: 'Electrical Room', type: 'support',          overrides: { geo: { x: 0,  y: 55, w: 12, h: 40 } } },
];

const FLOORS_3 = (prefix, dcId) => [
  { id: `${prefix}-f1`, name: 'Floor 1', rooms: DC_ROOMS(prefix, 1, dcId) },
  { id: `${prefix}-f2`, name: 'Floor 2', rooms: DC_ROOMS(prefix, 2, dcId) },
  { id: `${prefix}-f3`, name: 'Floor 3', rooms: DC_ROOMS(prefix, 3, dcId) },
  { id: `${prefix}-fr`, name: 'Roof',    rooms: [{ id: `${prefix}-fr-cool`, name: 'Cooling Plant', type: 'support', overrides: {} }] },
];

const FLOORS_2 = (prefix, dcId) => [
  { id: `${prefix}-f1`, name: 'Floor 1', rooms: DC_ROOMS(prefix, 1, dcId) },
  { id: `${prefix}-f2`, name: 'Floor 2', rooms: DC_ROOMS(prefix, 2, dcId) },
];

// ── SINGAPORE ─────────────────────────────────────────────────────────────────
makeRegion('reg-sgp', 'Singapore', { lat: 1.3521, lng: 103.8198 }, [
  {
    id: 'cmp-sgp-a', name: 'Campus A', dcId: 'sgp-1',
    geo: { lat: 1.3520, lng: 103.8195 },
    buildings: [
      {
        id: 'bld-sgp-a-a', name: 'Building A', dcId: 'sgp-1',
        geo: { x: 18, y: 28, w: 32, h: 26 },
        floors: FLOORS_3('bsgpa', 'sgp-1'),
      },
      {
        id: 'bld-sgp-a-b', name: 'Building B', dcId: 'sgp-2',
        geo: { x: 58, y: 28, w: 28, h: 24 },
        floors: FLOORS_3('bsgpb', 'sgp-2'),
      },
    ],
  },
  {
    id: 'cmp-sgp-b', name: 'Campus B', dcId: 'sgp-2',
    geo: { lat: 1.3530, lng: 103.8210 },
    buildings: [
      { id: 'bld-sgp-b-a', name: 'Building A', dcId: 'sgp-2', geo: { x: 30, y: 30, w: 40, h: 30 }, floors: FLOORS_2('bsgpba', 'sgp-2') },
    ],
  },
  {
    id: 'cmp-sgp-c', name: 'Campus C', dcId: 'sgp-3',
    geo: { lat: 1.3510, lng: 103.8185 },
    buildings: [
      { id: 'bld-sgp-c-a', name: 'Building A', dcId: 'sgp-3', geo: { x: 25, y: 35, w: 50, h: 30 }, floors: FLOORS_2('bsgpca', 'sgp-3') },
    ],
  },
]);

// ── SYDNEY ────────────────────────────────────────────────────────────────────
makeRegion('reg-syd', 'Sydney', { lat: -33.8688, lng: 151.2093 }, [
  {
    id: 'cmp-syd-a', name: 'Campus A', dcId: 'syd-1',
    geo: { lat: -33.8690, lng: 151.2095 },
    buildings: [
      { id: 'bld-syd-a-a', name: 'Building A', dcId: 'syd-1', geo: { x: 20, y: 25, w: 30, h: 28 }, floors: FLOORS_3('bsyda', 'syd-1') },
      { id: 'bld-syd-a-b', name: 'Building B', dcId: 'syd-2', geo: { x: 58, y: 30, w: 25, h: 22 }, floors: FLOORS_2('bsydb', 'syd-2') },
    ],
  },
  {
    id: 'cmp-syd-b', name: 'Campus B', dcId: 'syd-3',
    geo: { lat: -33.8700, lng: 151.2080 },
    buildings: [
      { id: 'bld-syd-b-a', name: 'Building A', dcId: 'syd-3', geo: { x: 30, y: 30, w: 40, h: 30 }, floors: FLOORS_2('bsydba', 'syd-3') },
    ],
  },
]);

// ── TOKYO ─────────────────────────────────────────────────────────────────────
makeRegion('reg-tyo', 'Tokyo', { lat: 35.6762, lng: 139.6503 }, [
  {
    id: 'cmp-tyo-a', name: 'Campus A', dcId: 'tyo-1',
    geo: { lat: 35.6765, lng: 139.6508 },
    buildings: [
      { id: 'bld-tyo-a-a', name: 'Building A', dcId: 'tyo-1', geo: { x: 20, y: 25, w: 35, h: 30 }, floors: FLOORS_3('btyoa', 'tyo-1') },
      { id: 'bld-tyo-a-b', name: 'Building B', dcId: 'tyo-2', geo: { x: 62, y: 30, w: 28, h: 25 }, floors: FLOORS_2('btyob', 'tyo-2') },
    ],
  },
]);

// ── MUMBAI ────────────────────────────────────────────────────────────────────
makeRegion('reg-mum', 'Mumbai', { lat: 19.0760, lng: 72.8777 }, [
  {
    id: 'cmp-mum-a', name: 'Campus A', dcId: 'mum-1',
    geo: { lat: 19.0762, lng: 72.8780 },
    buildings: [
      { id: 'bld-mum-a-a', name: 'Building A', dcId: 'mum-1', geo: { x: 15, y: 25, w: 35, h: 30 }, floors: FLOORS_3('bmuma', 'mum-1') },
      { id: 'bld-mum-a-b', name: 'Building B', dcId: 'mum-2', geo: { x: 58, y: 28, w: 28, h: 26 }, floors: FLOORS_2('bmumb', 'mum-2') },
    ],
  },
]);

// ── HAMINA ────────────────────────────────────────────────────────────────────
makeRegion('reg-ham', 'Hamina', { lat: 60.5696, lng: 27.1939 }, [
  {
    id: 'cmp-ham-a', name: 'Campus A', dcId: 'ham-1',
    geo: { lat: 60.5698, lng: 27.1942 },
    buildings: [
      { id: 'bld-ham-a-a', name: 'Building A', dcId: 'ham-1', geo: { x: 10, y: 25, w: 28, h: 28 }, floors: FLOORS_3('bhama', 'ham-1') },
      { id: 'bld-ham-a-b', name: 'Building B', dcId: 'ham-2', geo: { x: 45, y: 25, w: 26, h: 26 }, floors: FLOORS_2('bhamb', 'ham-2') },
      { id: 'bld-ham-a-c', name: 'Building C', dcId: 'ham-3', geo: { x: 76, y: 28, w: 20, h: 22 }, floors: FLOORS_2('bhamc', 'ham-3') },
    ],
  },
]);

// ── OSLO ──────────────────────────────────────────────────────────────────────
makeRegion('reg-osl', 'Oslo', { lat: 59.9139, lng: 10.7522 }, [
  {
    id: 'cmp-osl-a', name: 'Campus A', dcId: 'osl-1',
    geo: { lat: 59.9142, lng: 10.7526 },
    buildings: [
      { id: 'bld-osl-a-a', name: 'Building A', dcId: 'osl-1', geo: { x: 20, y: 28, w: 32, h: 28 }, floors: FLOORS_3('bosla', 'osl-1') },
      { id: 'bld-osl-a-b', name: 'Building B', dcId: 'osl-2', geo: { x: 60, y: 30, w: 26, h: 24 }, floors: FLOORS_2('boslb', 'osl-2') },
    ],
  },
]);

// ── Exports ───────────────────────────────────────────────────────────────────
export const RE_NODES = _nodes;
export const ROOT_IDS = ['reg-sgp', 'reg-syd', 'reg-tyo', 'reg-mum', 'reg-ham', 'reg-osl'];

// Default selection: Singapore > Campus A > Building A > Floor 2 > Room A02
export const DEFAULT_NODE_ID = 'bsgpa-f2';

/** Returns rack nodes for a datacenter-floor room, generated from mockRacks/generateDCRacks */
export function getRackNodesForRoom(roomId) {
  const room = RE_NODES[roomId];
  if (!room || room.roomType !== 'datacenter-floor' || !room.dcId) return [];
  const racks = mockRacks[room.dcId] || generateDCRacks(room.dcId);
  return racks.map(r => ({
    id:    `rack-${room.id}-${r.id}`,
    type:  'rack',
    parentId: roomId,
    name:  r.label,
    children: [],
    dcId:  room.dcId,
    rackRef: r.id,
    geo:   { row: r.row, position: r.position },
    capacityMw:    +(r.maxPowerKw / 1000).toFixed(3),
    itCapacityMw:  +(r.powerKw    / 1000).toFixed(3),
    utilizationPct: r.utilPct,
    areaSqft:      14,
    occupancyPct:  Math.round(r.spaceUsedU / r.spaceTotalU * 100),
    avgTempC:      r.inletTempC,
    pue:           1.0,
    status:        r.status === 'warning' ? 'maintenance' : r.status,
    rack:          r, // raw rack object for the details panel
  }));
}

/** Returns ordered array of ancestor nodeIds from root down to (not including) nodeId */
export function getAncestors(nodeId) {
  const path = [];
  let cur = RE_NODES[nodeId];
  while (cur && cur.parentId) {
    path.unshift(cur.parentId);
    cur = RE_NODES[cur.parentId];
  }
  return path;
}

/** Returns all descendant IDs (depth-first) */
export function getDescendants(nodeId) {
  const node = RE_NODES[nodeId];
  if (!node) return [];
  const result = [];
  function walk(id) {
    const n = RE_NODES[id];
    if (!n) return;
    result.push(id);
    n.children.forEach(walk);
  }
  node.children.forEach(walk);
  return result;
}

/** Returns the building node that is an ancestor of (or is) the given node */
export function getAncestorBuilding(nodeId) {
  let cur = RE_NODES[nodeId];
  while (cur) {
    if (cur.type === 'building') return cur;
    cur = RE_NODES[cur.parentId];
  }
  return null;
}

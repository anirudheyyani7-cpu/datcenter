// Thermal floor plan data for v3 heatmap visualization
// Each datacenter has an 8×4 grid (columns A-H, rows 1-4) of tile temperature readings
// Tiles represent 1m² floor sections. CRAH units cool from the rear (row 4).
// Cold aisle: rows 1 & 3 (front of racks), Hot aisle: rows 2 & 4 (rear of racks)
import { GOOGLE_DC_MASTER } from '@/data/googleDCMasterData';

const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

function generateThermalGrid(avgTemp, hotSpots = [], chahPositions = []) {
  const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const rows = [1, 2, 3, 4];
  const tiles = [];
  cols.forEach((col, ci) => {
    rows.forEach((row) => {
      const isHotAisle = row === 2 || row === 4;
      const isColdAisle = row === 1 || row === 3;
      const isCrah = chahPositions.some(p => p.col === col && p.row === row);
      const isHotSpot = hotSpots.some(h => h.col === col && h.row === row);
      let temp = avgTemp;
      if (isHotAisle) temp += 8 + Math.round(Math.random() * 4);
      if (isColdAisle) temp -= 3 + Math.round(Math.random() * 2);
      if (isCrah) temp -= 6;
      if (isHotSpot) temp += 10 + Math.round(Math.random() * 5);
      temp = Math.max(15, Math.min(45, temp + Math.round((Math.random() - 0.5) * 3)));
      tiles.push({ col, row, tempC: temp, isHotAisle, isColdAisle, isCrah, isHotSpot });
    });
  });
  return tiles;
}

// ─── Google DC campus thermal generation ───────────────────────────────────
// Derives a plausible CFD-style floor heatmap for every Active GOOGLE_DC_MASTER
// campus from its real attributes (PUE, utilization, tier, risk_flag, alarm
// counts) rather than pure random noise, so hotter/riskier campuses visibly
// run hotter with more CRAH units offline and more hotspot tiles.

function hashId(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function spreadColumns(n) {
  if (n <= 0) return [];
  if (n === 1) return [COLS[0]];
  const cols = [];
  for (let i = 0; i < n; i++) {
    cols.push(COLS[Math.round((i * (COLS.length - 1)) / (n - 1))]);
  }
  return cols;
}

function pickDistinctColumns(n, seed, exclude = []) {
  const picked = [];
  let i = 0;
  while (picked.length < n && i < 20) {
    const col = COLS[(seed + i * 5) % COLS.length];
    if (!exclude.includes(col) && !picked.includes(col)) picked.push(col);
    i++;
  }
  return picked;
}

const HOTSPOT_MESSAGE_TEMPLATES = [
  (dc, col, crahOffline) =>
    `Row ${col} hot aisle trending high — ${dc.market} campus running ${dc.utilization_pct}% utilization${crahOffline > 0 ? ', one CRAH unit degraded' : ''}.`,
  (dc, col) =>
    `Rear row ${col} elevated above setpoint — PUE ${dc.pue.toFixed(2)} indicates reduced cooling headroom, recommend load rebalance.`,
  (dc, col) =>
    `Row ${col} approaching thermal threshold — ${dc.risk_flag} risk flag, monitor rack density in this aisle.`,
  (dc, col) =>
    `Hot spot detected in row ${col} — Tier ${dc.tier} facility at ${dc.utilization_pct}% load, schedule CRAH inspection.`,
];

export function generateCampusThermal(dc) {
  const seed = hashId(dc.id);

  const avgTempC = Math.max(18, Math.min(32, Math.round(
    16 + (dc.pue - 1.08) * 45 + (dc.utilization_pct / 100) * 7
  )));
  const targetTempC = dc.tier === 'IV' ? 21 : dc.tier === 'III' ? 22 : 23;

  const crahUnits = Math.max(2, Math.min(8, Math.round(dc.capacity_mw / 35)));
  const crahOffline = dc.risk_flag === 'High' ? 2 : dc.risk_flag === 'Medium' ? 1 : 0;
  const crahOnline = Math.max(1, crahUnits - crahOffline);
  const crahCols = spreadColumns(crahUnits);
  const crahPositions = crahCols.map(col => ({ col, row: 4 }));

  const hotspotCount = Math.max(0, Math.min(4, dc.alarm_critical * 2 + dc.alarm_high));
  const hotspotCols = pickDistinctColumns(hotspotCount, seed + 7, crahCols);
  const hotSpots = hotspotCols.map(col => ({ col, row: 2 }));

  const hotspotAlerts = hotSpots.map((h, i) => ({
    col: h.col,
    row: h.row,
    message: HOTSPOT_MESSAGE_TEMPLATES[i % HOTSPOT_MESSAGE_TEMPLATES.length](dc, h.col, crahOffline),
  }));

  return {
    avgTempC,
    targetTempC,
    crahUnits,
    crahOnline,
    tiles: generateThermalGrid(avgTempC, hotSpots, crahPositions),
    airflowDirection: 'front-to-back',
    hotspotAlerts,
  };
}

const googleDCThermalEntries = Object.fromEntries(
  GOOGLE_DC_MASTER
    .filter(dc => dc.status === 'Active')
    .map(dc => [dc.id, generateCampusThermal(dc)])
);

export const mockThermalData = {
  'mum-1': {
    avgTempC: 22,
    targetTempC: 21,
    crahUnits: 4,
    crahOnline: 4,
    tiles: generateThermalGrid(22, [{ col: 'C', row: 2 }], [
      { col: 'A', row: 4 }, { col: 'D', row: 4 }, { col: 'E', row: 4 }, { col: 'H', row: 4 },
    ]),
    airflowDirection: 'front-to-back',
    hotspotAlerts: [],
  },
  'mum-2': {
    avgTempC: 27,
    targetTempC: 23,
    crahUnits: 2,
    crahOnline: 1,
    tiles: generateThermalGrid(27,
      [{ col: 'B', row: 2 }, { col: 'D', row: 4 }, { col: 'G', row: 2 }],
      [{ col: 'A', row: 4 }, { col: 'H', row: 4 }]
    ),
    airflowDirection: 'front-to-back',
    hotspotAlerts: [
      { col: 'B', row: 2, message: 'Row B hot aisle at 38°C — CRAH-B-07 offline' },
      { col: 'D', row: 4, message: 'Row D rear reaching 37°C — load rebalance recommended' },
    ],
  },
  'che-1': {
    avgTempC: 23,
    targetTempC: 22,
    crahUnits: 3,
    crahOnline: 2,
    tiles: generateThermalGrid(23, [{ col: 'E', row: 2 }], [
      { col: 'A', row: 4 }, { col: 'D', row: 4 }, { col: 'H', row: 4 },
    ]),
    airflowDirection: 'front-to-back',
    hotspotAlerts: [{ col: 'E', row: 2, message: 'Bearing wear on CH-03 — slightly elevated temps in Row E' }],
  },
  'hyd-1': {
    avgTempC: 21,
    targetTempC: 21,
    crahUnits: 4,
    crahOnline: 4,
    tiles: generateThermalGrid(21, [], [
      { col: 'A', row: 4 }, { col: 'C', row: 4 }, { col: 'F', row: 4 }, { col: 'H', row: 4 },
    ]),
    airflowDirection: 'front-to-back',
    hotspotAlerts: [],
  },
  'sgp-1': {
    avgTempC: 20,
    targetTempC: 20,
    crahUnits: 5,
    crahOnline: 5,
    tiles: generateThermalGrid(20, [{ col: 'F', row: 2 }], [
      { col: 'A', row: 4 }, { col: 'C', row: 4 }, { col: 'E', row: 4 }, { col: 'G', row: 4 }, { col: 'H', row: 4 },
    ]),
    airflowDirection: 'front-to-back',
    hotspotAlerts: [{ col: 'F', row: 2, message: 'Row F approaching thermal threshold — DBS Bank racks at 91% utilisation' }],
  },
  'sgp-2': {
    avgTempC: 21,
    targetTempC: 21,
    crahUnits: 2,
    crahOnline: 2,
    tiles: generateThermalGrid(21, [], [{ col: 'B', row: 4 }, { col: 'G', row: 4 }]),
    airflowDirection: 'front-to-back',
    hotspotAlerts: [],
  },
  'hkg-1': {
    avgTempC: 22,
    targetTempC: 21,
    crahUnits: 2,
    crahOnline: 2,
    tiles: generateThermalGrid(22, [], [{ col: 'B', row: 4 }, { col: 'G', row: 4 }]),
    airflowDirection: 'front-to-back',
    hotspotAlerts: [],
  },
  'fra-1': {
    avgTempC: 19,
    targetTempC: 20,
    crahUnits: 3,
    crahOnline: 3,
    tiles: generateThermalGrid(19, [], [
      { col: 'A', row: 4 }, { col: 'D', row: 4 }, { col: 'H', row: 4 },
    ]),
    airflowDirection: 'front-to-back',
    hotspotAlerts: [],
  },
  'lon-1': {
    avgTempC: 21,
    targetTempC: 21,
    crahUnits: 2,
    crahOnline: 2,
    tiles: generateThermalGrid(21, [], [{ col: 'B', row: 4 }, { col: 'G', row: 4 }]),
    airflowDirection: 'front-to-back',
    hotspotAlerts: [],
  },
  'dxb-1': {
    avgTempC: 26,
    targetTempC: 22,
    crahUnits: 2,
    crahOnline: 2,
    tiles: generateThermalGrid(26,
      [{ col: 'C', row: 2 }, { col: 'F', row: 4 }],
      [{ col: 'A', row: 4 }, { col: 'H', row: 4 }]
    ),
    airflowDirection: 'front-to-back',
    hotspotAlerts: [
      { col: 'C', row: 2, message: 'High ambient temperature driving hot aisle temps up — PUE 1.62' },
      { col: 'F', row: 4, message: 'Rear rows elevated — consider airflow containment' },
    ],
  },
  'iad-1': {
    avgTempC: 20,
    targetTempC: 20,
    crahUnits: 6,
    crahOnline: 6,
    tiles: generateThermalGrid(20, [], [
      { col: 'A', row: 4 }, { col: 'B', row: 4 }, { col: 'D', row: 4 },
      { col: 'E', row: 4 }, { col: 'G', row: 4 }, { col: 'H', row: 4 },
    ]),
    airflowDirection: 'front-to-back',
    hotspotAlerts: [],
  },
  'gru-1': {
    avgTempC: 22,
    targetTempC: 21,
    crahUnits: 2,
    crahOnline: 2,
    tiles: generateThermalGrid(22, [], [{ col: 'C', row: 4 }, { col: 'F', row: 4 }]),
    airflowDirection: 'front-to-back',
    hotspotAlerts: [],
  },
  ...googleDCThermalEntries,
};

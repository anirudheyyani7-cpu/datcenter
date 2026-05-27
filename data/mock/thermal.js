// Thermal floor plan data for v3 heatmap visualization
// Each datacenter has an 8×4 grid (columns A-H, rows 1-4) of tile temperature readings
// Tiles represent 1m² floor sections. CRAH units cool from the rear (row 4).
// Cold aisle: rows 1 & 3 (front of racks), Hot aisle: rows 2 & 4 (rear of racks)

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
};

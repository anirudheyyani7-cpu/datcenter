/**
 * Covers the full physical hierarchy below DataCenter: Building -> Floor ->
 * Room -> Row -> Rack -> Asset. Kept in one service (rather than one file
 * per level) to match the explicit services/ list in the platform spec.
 *
 * assets.json itself (~21k records, several MB) is dynamically imported
 * only inside the three functions that need full per-asset records, so
 * callers that just need type counts (e.g. KPI/portfolio logic) pull in
 * the small precomputed assetTypeCounts.json instead.
 * @typedef {import('../types/google').Asset} Asset
 */
import buildings from '../data/google/buildings.json';
import floors from '../data/google/floors.json';
import rooms from '../data/google/rooms.json';
import rows from '../data/google/rows.json';
import racks from '../data/google/racks.json';
import assetTypeCounts from '../data/google/assetTypeCounts.json';

export async function getBuildingsByDataCenter(dataCenterId) {
  return buildings.filter(b => b.dataCenterId === dataCenterId);
}

export async function getFloorsByBuilding(buildingId) {
  return floors.filter(f => f.buildingId === buildingId);
}

export async function getRoomsByFloor(floorId) {
  return rooms.filter(r => r.floorId === floorId);
}

export async function getRowsByRoom(roomId) {
  return rows.filter(r => r.roomId === roomId);
}

export async function getRacksByRow(rowId) {
  return racks.filter(r => r.rowId === rowId);
}

export async function getRacksByDataCenter(dataCenterId) {
  return racks.filter(r => r.dataCenterId === dataCenterId);
}

export async function getRackById(id) {
  return racks.find(r => r.id === id);
}

/** @returns {Promise<Asset[]>} */
export async function getAssetsByRack(rackId) {
  const { default: assets } = await import('../data/google/assets.json');
  return assets.filter(a => a.rackId === rackId);
}

/** @returns {Promise<Asset[]>} */
export async function getAssetsByDataCenter(dataCenterId) {
  const { default: assets } = await import('../data/google/assets.json');
  return assets.filter(a => a.dataCenterId === dataCenterId);
}

/** @returns {Promise<Asset | undefined>} */
export async function getAssetById(id) {
  const { default: assets } = await import('../data/google/assets.json');
  return assets.find(a => a.id === id);
}

/**
 * Reads the precomputed per-DC type breakdown rather than scanning the full
 * asset list — this is the function the portfolio dashboard's adapter
 * calls, so KPI/chart code never has to load assets.json at all.
 * @returns {Promise<Record<Asset['type'], number>>}
 */
export async function getAssetTypeCounts(dataCenterId) {
  if (!dataCenterId) {
    return assetTypeCounts.reduce((acc, entry) => {
      for (const [type, count] of Object.entries(entry.counts)) acc[type] = (acc[type] ?? 0) + count;
      return acc;
    }, {});
  }
  return assetTypeCounts.find(entry => entry.dataCenterId === dataCenterId)?.counts ?? {};
}

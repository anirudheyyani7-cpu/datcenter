/** @typedef {import('../types/google').DataCenter} DataCenter */
import dataCenters from '../data/google/datacenters.json';
import maintenance from '../data/google/maintenance.json';
import incidents from '../data/google/incidents.json';
import documents from '../data/google/documents.json';

/** @returns {Promise<DataCenter[]>} */
export async function getDataCenters() {
  return dataCenters;
}

/** @returns {Promise<DataCenter | undefined>} */
export async function getDataCenterById(id) {
  return dataCenters.find(d => d.id === id);
}

/** @returns {Promise<DataCenter[]>} */
export async function getDataCentersByRegion(regionCode) {
  return dataCenters.filter(d => d.location.region === regionCode);
}

/** @returns {Promise<DataCenter[]>} */
export async function getDataCentersByCountry(countryId) {
  return dataCenters.filter(d => d.location.countryId === countryId);
}

/** @returns {Promise<DataCenter[]>} */
export async function getDataCentersByCampus(campusId) {
  return dataCenters.filter(d => d.location.campusId === campusId);
}

/** @returns {Promise<DataCenter[]>} */
export async function searchDataCenters(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return dataCenters.filter(d =>
    d.identity.name.toLowerCase().includes(q) ||
    d.location.city.toLowerCase().includes(q) ||
    d.location.country.toLowerCase().includes(q)
  );
}

/** @returns {Promise<import('../types/google').MaintenanceRecord[]>} */
export async function getMaintenanceByDataCenter(dataCenterId) {
  return maintenance.filter(m => m.dataCenterId === dataCenterId);
}

/** @returns {Promise<import('../types/google').IncidentRecord[]>} */
export async function getIncidentsByDataCenter(dataCenterId) {
  return incidents.filter(i => i.dataCenterId === dataCenterId);
}

/** @returns {Promise<import('../types/google').DocumentRecord[]>} */
export async function getDocumentsByDataCenter(dataCenterId) {
  return documents.filter(doc => doc.dataCenterId === dataCenterId);
}

/**
 * relationships.json is the full hierarchy edge list (~25k rows, several
 * MB) — dynamically imported here so pages that never call this function
 * (most don't) never pull it into their bundle.
 * @returns {Promise<import('../types/google').Relationship[]>}
 */
export async function getRelationshipsFor(entityId) {
  const { default: relationships } = await import('../data/google/relationships.json');
  return relationships.filter(r => r.parentId === entityId || r.childId === entityId);
}

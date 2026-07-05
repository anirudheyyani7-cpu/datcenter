/**
 * Filtering and search logic over the facility list. Kept separate from
 * components so the map, search bar, filter panel, and KPI cards all
 * operate on the same contract — reused by both the global page and every
 * regional page.
 */

export const DEFAULT_FILTERS = {
  region: 'All',
  country: 'All',
  health: 'All',
  risk: 'All',
  status: 'All',
  facilityType: 'All',
  capacityBand: 'All',
  renewableBand: 'All',
  underMaintenance: 'All',
  pueBand: 'All',
  utilizationBand: 'All',
};

export function capacityBandOf(capacityMw) {
  if (capacityMw >= 150) return 'high';
  if (capacityMw >= 80) return 'mid';
  return 'low';
}

export function renewableBandOf(renewablePct) {
  if (renewablePct >= 70) return 'high';
  if (renewablePct >= 40) return 'mid';
  return 'low';
}

export function pueBandOf(pue) {
  if (pue <= 1.15) return 'low';
  if (pue <= 1.3) return 'mid';
  return 'high';
}

export function utilizationBandOf(utilizationPct) {
  if (utilizationPct >= 80) return 'high';
  if (utilizationPct >= 50) return 'mid';
  return 'low';
}

export function applyFacilityFilters(facilities, filters) {
  return facilities.filter(f => {
    if (filters.region !== 'All' && f.region !== filters.region) return false;
    if (filters.country !== 'All' && f.country !== filters.country) return false;
    if (filters.health !== 'All' && f.health !== filters.health) return false;
    if (filters.risk !== 'All' && f.riskFlag !== filters.risk) return false;
    if (filters.status !== 'All' && f.status !== filters.status) return false;
    if (filters.facilityType !== 'All' && f.facilityType !== filters.facilityType) return false;
    if (filters.capacityBand !== 'All' && capacityBandOf(f.capacityMw) !== filters.capacityBand) return false;
    if (filters.renewableBand !== 'All' && renewableBandOf(f.renewablePct) !== filters.renewableBand) return false;
    if (filters.underMaintenance === 'Yes' && !f.underMaintenance) return false;
    if (filters.pueBand !== 'All' && pueBandOf(f.pue) !== filters.pueBand) return false;
    if (filters.utilizationBand !== 'All' && utilizationBandOf(f.utilizationPct) !== filters.utilizationBand) return false;
    return true;
  });
}

export function searchFacilities(facilities, query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return facilities.filter(f =>
    f.name.toLowerCase().includes(q) ||
    f.city.toLowerCase().includes(q) ||
    f.country.toLowerCase().includes(q)
  ).slice(0, 8);
}

export function distinctValues(facilities, key) {
  return Array.from(new Set(facilities.map(f => f[key]))).sort();
}

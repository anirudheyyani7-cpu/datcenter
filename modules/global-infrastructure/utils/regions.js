/**
 * Shared region constants — single source of truth for region codes/labels
 * so the global map's region pins, breadcrumbs, filters, and the
 * [region] route all agree on the same four regions.
 */
export const REGION_CODES = ['Americas', 'EMEA', 'APAC', 'MiddleEast'];

export const REGION_LABELS = {
  Americas: 'Americas',
  EMEA: 'EMEA',
  APAC: 'APAC',
  MiddleEast: 'Middle East',
};

export function isValidRegion(code) {
  return REGION_CODES.includes(code);
}

/** Centroid (simple average lat/lng) + facility count per region, for the global map's region pins. */
export function buildRegionMarkers(facilities) {
  return REGION_CODES.map(region => {
    const list = facilities.filter(f => f.region === region);
    if (!list.length) return null;
    return {
      region,
      label: REGION_LABELS[region],
      count: list.length,
      latitude: list.reduce((s, f) => s + f.latitude, 0) / list.length,
      longitude: list.reduce((s, f) => s + f.longitude, 0) / list.length,
    };
  }).filter(Boolean);
}

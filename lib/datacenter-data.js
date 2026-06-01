let cachedData = null;

function normalizeDatacenter(dc) {
  const coords = dc.coordinates || {};
  return {
    ...dc,
    coordinates: {
      lat: coords.lat ?? coords.latitude ?? null,
      lng: coords.lng ?? coords.longitude ?? null,
    },
    notable_facts: Array.isArray(dc.notable_facts)
      ? dc.notable_facts
      : dc.notable_facts
      ? [dc.notable_facts]
      : [],
    key_tenants: dc.key_tenants ?? [],
    certifications: dc.certifications ?? [],
    connectivity: {
      submarine_cables: [],
      cloud_on_ramps: [],
      ...dc.connectivity,
    },
  };
}

function deriveCountrySummary(rawSummary, countryDCs) {
  const validCoords = countryDCs
    .map(dc => dc.coordinates)
    .filter(c => c && c.lat != null && c.lng != null);

  let map_center = rawSummary?.map_center;
  if (!map_center && validCoords.length > 0) {
    map_center = [
      validCoords.reduce((s, c) => s + c.lat, 0) / validCoords.length,
      validCoords.reduce((s, c) => s + c.lng, 0) / validCoords.length,
    ];
  }

  return {
    total_facilities: rawSummary?.total_facilities ?? rawSummary?.total_facilities_in_dataset ?? countryDCs.length,
    combined_capacity_mw: rawSummary?.combined_capacity_mw ?? rawSummary?.total_capacity_mw ?? 0,
    avg_pue: rawSummary?.avg_pue ?? 0,
    avg_renewable_pct: rawSummary?.avg_renewable_pct ?? 0,
    map_center: map_center ?? [20, 0],
    map_zoom: rawSummary?.map_zoom ?? 5,
    ...rawSummary,
  };
}

export async function loadDatacenters() {
  if (cachedData) return cachedData;
  const response = await fetch('/data/datacenter_repository.json');
  const raw = await response.json();

  const datacenters = (raw.datacenters ?? []).map(normalizeDatacenter);

  const country_summary = {};
  for (const [country, summary] of Object.entries(raw.country_summary ?? {})) {
    const countryDCs = datacenters.filter(dc => dc.country === country);
    country_summary[country] = deriveCountrySummary(summary, countryDCs);
  }

  cachedData = { ...raw, datacenters, country_summary };
  return cachedData;
}

export function getDatacentersByCountry(data, country) {
  if (!country || country === 'All') return data.datacenters;
  return data.datacenters.filter(dc => dc.country === country);
}

export function getCountrySummary(data, country) {
  return data.country_summary[country];
}

export function calculateGlobalStats(datacenters) {
  const total = datacenters.length || 1;
  const totalCapacity = datacenters.reduce((sum, dc) => sum + (dc.capacity_mw ?? 0), 0);
  const avgPUE = datacenters.reduce((sum, dc) => sum + (dc.pue ?? 0), 0) / total;
  const avgRenewable = datacenters.reduce((sum, dc) => sum + (dc.renewable_energy_pct ?? 0), 0) / total;
  const countries = [...new Set(datacenters.map(dc => dc.country))].length;

  return {
    total: datacenters.length,
    totalCapacity,
    avgPUE: avgPUE.toFixed(2),
    avgRenewable: Math.round(avgRenewable),
    countries,
  };
}

export function formatDatacenterForAI(dc) {
  return `
Datacenter: ${dc.name}
Location: ${dc.city}, ${dc.country}
Operator: ${dc.operator}
Tier: ${dc.tier_rating}
Capacity: ${dc.capacity_mw} MW
PUE: ${dc.pue}
Renewable Energy: ${dc.renewable_energy_pct}%
Status: ${dc.status}
Key Tenants: ${dc.key_tenants?.join(', ')}
Certifications: ${dc.certifications?.join(', ')}
Submarine Cables: ${dc.connectivity?.submarine_cables?.join(', ') || 'N/A'}
Cloud On-Ramps: ${dc.connectivity?.cloud_on_ramps?.join(', ')}
Notable Facts: ${dc.notable_facts?.join('; ')}
`.trim();
}

/**
 * Returns PeeringDB facilities that are NOT already in the curated dataset,
 * preventing duplicate pins on the map.
 * Matching is done by normalised name+city string.
 */
export function filterPeeringFacilities(peeringFacilities, curatedDatacenters) {
  const curatedKeys = new Set(
    curatedDatacenters.map(dc =>
      `${dc.name.toLowerCase().trim()}_${dc.city.toLowerCase().trim()}`
    )
  );
  return peeringFacilities.filter(
    f => !curatedKeys.has(`${f.name.toLowerCase().trim()}_${f.city.toLowerCase().trim()}`)
  );
}

export function getCountryDataForAI(data, country) {
  const dcs = getDatacentersByCountry(data, country);
  const summary = data.country_summary[country];
  if (!summary) return '';

  return `
${country} Datacenter Market:
- Total Facilities in Dataset: ${summary.total_facilities}
- Combined Capacity: ${summary.combined_capacity_mw} MW
- Average PUE: ${summary.avg_pue}
- Average Renewable Energy: ${summary.avg_renewable_pct}%

Key facilities:
${dcs.map(dc => `- ${dc.name} (${dc.capacity_mw}MW, ${dc.tier_rating}, PUE ${dc.pue})`).join('\n')}
`.trim();
}

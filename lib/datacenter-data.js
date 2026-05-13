let cachedData = null;

export async function loadDatacenters() {
  if (cachedData) return cachedData;
  const response = await fetch('/data/datacenter_repository.json');
  cachedData = await response.json();
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
  const total = datacenters.length;
  const totalCapacity = datacenters.reduce((sum, dc) => sum + dc.capacity_mw, 0);
  const avgPUE = datacenters.reduce((sum, dc) => sum + dc.pue, 0) / total;
  const avgRenewable = datacenters.reduce((sum, dc) => sum + dc.renewable_energy_pct, 0) / total;
  const countries = [...new Set(datacenters.map(dc => dc.country))].length;

  return {
    total,
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

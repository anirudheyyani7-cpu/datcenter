// Fetches Google's own published data center location list
// (https://datacenters.google/locations/) server-side and normalizes it
// into asset-portfolio-shaped rows. This is the only externally-sourced
// "live" location data in the module — Google does not publish MW/PUE/
// financial figures, so those fields are left null rather than invented.
//
// The page embeds a sequence of JSON objects (not a clean array) inside
// <div id="data-centers-data">. We extract it with a balanced-brace scan
// and JSON.parse each object individually.

const SOURCE_URL = 'https://datacenters.google/locations/';
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12h — this page changes rarely

let cache = { data: null, fetchedAt: 0 };

const CONTINENT_TO_REGION = {
  'North America': 'AMER',
  'South America': 'LATAM',
  Europe: 'EMEA',
  Asia: 'APAC',
};

// Public, well-known coordinates for sites Google's page lists without
// lat/long of its own (city/region-level precision, not exact campus).
const COORD_FALLBACK = {
  'Armstrong County, Texas': [34.95, -100.80],
  'Canelones, Uruguay': [-34.52, -56.28],
  'Central Ohio': [40.08, -82.50],
  'Changhua County, Taiwan': [24.05, 120.52],
  'Chonburi, Thailand': [13.36, 100.98],
  'Council Bluffs, Iowa': [41.2619, -95.8608],
  'Douglas County, Georgia': [33.6789, -84.7458],
  'Dublin, Ireland': [53.3498, -6.2603],
  'Eemshaven, Netherlands': [53.4395, 6.8276],
  'Ellis County, Texas': [32.40, -96.84],
  'Farciennes, Belgium': [50.40, 4.55],
  'Fredericia, Denmark': [55.5658, 9.7522],
  'Groningen, Netherlands': [53.2194, 6.5665],
  'Hamina, Finland': [60.5693, 27.1981],
  'Hanau, Germany': [50.1322, 8.9163],
  'Haskell County, Texas': [33.16, -99.73],
  'Henderson, Nevada': [36.0395, -114.9817],
  'Hermantown, Minnesota': [46.80, -92.23],
  'Horndal, Sweden': [60.30, 16.61],
  Indiana: [41.13, -85.13],
  'Inzai, Japan': [35.8333, 140.15],
  'Jackson County, Alabama': [34.76, -85.93],
  'Kansas City, Missouri': [39.10, -94.58],
  'Kronstorf, Austria': [48.23, 14.30],
  'LaGrange, Georgia': [33.0379, -85.0322],
  'Lenoir, North Carolina': [35.9123, -81.5392],
  'Lincoln, Nebraska': [40.8136, -96.7026],
  'Mayes County, Oklahoma': [36.2089, -95.2658],
  'Mesa, Arizona': [33.4152, -111.8315],
  'Michigan City, Indiana': [41.7075, -86.8952],
  'Montgomery County, Tennessee': [36.5298, -87.3595],
  'Muskogee County, Oklahoma': [35.74, -95.37],
  'Omaha, Nebraska': [41.2565, -95.9345],
  'Pampa, Texas': [35.5359, -100.9599],
  'Papillion, Nebraska': [41.1544, -96.0422],
  'Pine Island, Minnesota': [44.20, -92.65],
  'Quilicura, Chile': [-33.3617, -70.7339],
  'Red Oak, Texas': [32.5085, -96.9933],
  'Selangor, Malaysia': [3.07, 101.52],
  Singapore: [1.3521, 103.8198],
  'Skien, Norway': [59.21, 9.61],
  'St. Ghislain, Belgium': [50.45, 3.82],
  'Storey County, Nevada': [39.41, -119.41],
  'The Dalles, Oregon': [45.5946, -121.1787],
  'Waltham Cross, United Kingdom': [51.6890, -0.0322],
  'Wilbarger County, Texas': [34.13, -99.28],
  'Winschoten, Netherlands': [53.1397, 7.0336],
};

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function extractBalancedObjects(blob) {
  const objects = [];
  let depth = 0;
  let startIdx = -1;
  for (let i = 0; i < blob.length; i++) {
    const c = blob[i];
    if (c === '{') { if (depth === 0) startIdx = i; depth++; }
    else if (c === '}') {
      depth--;
      if (depth === 0 && startIdx >= 0) { objects.push(blob.slice(startIdx, i + 1)); startIdx = -1; }
    }
  }
  return objects;
}

function toAssetRow(loc) {
  const location = loc.location || '';
  const continent = loc.continent || '';
  const commaIdx = location.lastIndexOf(',');
  const city = commaIdx >= 0 ? location.slice(0, commaIdx).trim() : location;
  const afterComma = commaIdx >= 0 ? location.slice(commaIdx + 1).trim() : null;
  const country = continent === 'North America' ? 'United States' : (afterComma || location);

  const fallback = COORD_FALLBACK[location];
  const latitude = loc.latitude ?? fallback?.[0] ?? null;
  const longitude = loc.longitude ?? fallback?.[1] ?? null;

  return {
    asset_id: `GOOG-${slugify(location)}`,
    asset_name: `${city} Data Center`,
    region: CONTINENT_TO_REGION[continent] || null,
    country,
    city,
    latitude,
    longitude,
    ownership_type: 'Owned',
    facility_status: loc.inDevelopment ? 'Under Construction' : 'Active',
    tier_rating: null,
    total_area_sqft: null,
    total_it_capacity_mw: null,
    current_it_load_mw: null,
    utilization_pct: null,
    pue: null,
    acquisition_date: null, acquisition_value_m: null, current_valuation_m: null, annual_depreciation_m: null,
    capex_budget_m: null, capex_spent_m: null, capex_remaining_m: null,
    lease_start_date: null, lease_expiry_date: null, break_clause_date: null, annual_rent_m: null, rent_escalation_pct: null, renewal_option: null,
    ppa_provider: null, ppa_rate_usd_mwh: null, ppa_expiry_date: null, renewable_energy_pct: null,
    risk_flag: null,
    notes: `Source: ${SOURCE_URL}`,
  };
}

export async function fetchGoogleDataCenterLocations() {
  if (cache.data && Date.now() - cache.fetchedAt < CACHE_TTL_MS) return cache.data;

  const res = await fetch(SOURCE_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36' },
  });
  if (!res.ok) throw new Error(`Google locations page returned ${res.status}`);
  const html = await res.text();

  const marker = html.indexOf('id="data-centers-data"');
  if (marker === -1) throw new Error('data-centers-data block not found — page structure may have changed.');
  const divStart = html.indexOf('>', marker) + 1;
  const divEnd = html.indexOf('</div>', divStart);
  const blob = html.slice(divStart, divEnd);

  const rawObjects = extractBalancedObjects(blob)
    .map(o => { try { return JSON.parse(o); } catch { return null; } })
    .filter(o => o && o.location);

  const rows = rawObjects.map(toAssetRow);
  cache = { data: rows, fetchedAt: Date.now() };
  return rows;
}

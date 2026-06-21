// Deterministic computation engine.
//
// Every score, rank, and financial figure in the cockpit comes from here —
// never from the LLM. Given the same decision_type + params, this always
// returns byte-identical output (seeded PRNG, no Math.random(), no Date.now()).

import { isCoastalRegion } from '@/data/decisionModules';

function seedFromString(str) {
  let h = 2166136261; // FNV-1a basis
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeRng(seedKey) {
  const rng = mulberry32(seedFromString(seedKey));
  return {
    float: (min = 0, max = 1) => min + rng() * (max - min),
    int: (min, max) => Math.floor(min + rng() * (max - min + 1)),
    pick: (arr) => arr[Math.floor(rng() * arr.length)],
  };
}

const LOCATION_NAME_POOL = [
  'North Industrial Corridor', 'Riverside Tech Park', 'Outer Ring Belt',
  'East Logistics Zone', 'Greenfield Estate', 'Substation District',
  'Coastal Gateway Park', 'Highway Junction Cluster',
];

function normParams(decisionType, params) {
  const location = (params?.location || 'Metro Region').trim();
  const capacity = Number(params?.capacity) > 0 ? Number(params.capacity) : 100;
  const clientName = (params?.client_name || '').trim();
  return { location, capacity, clientName, decisionType };
}

function computeFeasibility(rng, { capacity }) {
  const land = rng.int(55, 92);
  const regulatory = rng.int(50, 90);
  const utility = rng.int(50, 95);
  const score = Math.round((land + regulatory + utility) / 3);
  return {
    score,
    verdict: score >= 75 ? 'Highly feasible' : score >= 55 ? 'Feasible with conditions' : 'Marginal — needs mitigation',
    factors: [
      { label: 'Land availability', score: land },
      { label: 'Regulatory pathway', score: regulatory },
      { label: 'Utility readiness', score: utility },
    ],
  };
}

function computeCandidateLocations(rng, { location, capacity }) {
  const count = 4;
  const ranked = Array.from({ length: count }, (_, i) => {
    const name = `${location} — ${LOCATION_NAME_POOL[rng.int(0, LOCATION_NAME_POOL.length - 1)]}`;
    const score = rng.int(60, 95) - i * rng.int(0, 4); // gentle separation, still deterministic
    return {
      name,
      score: Math.max(40, score),
      land_cost_per_acre_usd: rng.int(80, 600) * 1000,
      power_grid_distance_km: rng.int(1, 18),
      risk_tag: rng.pick(['Low', 'Moderate', 'Elevated']),
    };
  }).sort((a, b) => b.score - a.score);
  return { ranked };
}

function computePowerAnalysis(rng, { capacity }) {
  const gridCapacity = rng.int(Math.round(capacity * 1.5), Math.round(capacity * 4));
  const substationDistance = rng.int(1, 15);
  const renewableMix = rng.int(20, 55);
  const score = Math.round(
    Math.min(100, (gridCapacity / capacity) * 20) * 0.5 +
    Math.max(0, 100 - substationDistance * 5) * 0.3 +
    renewableMix * 0.2
  );
  return {
    score: Math.min(100, score),
    grid_capacity_mw: gridCapacity,
    substation_distance_km: substationDistance,
    renewable_mix_pct: renewableMix,
    verdict: score >= 75 ? 'Grid-ready' : score >= 55 ? 'Upgrades required' : 'Significant grid investment needed',
  };
}

function computeRiskAnalysis(rng, { location, capacity }) {
  const coastal = isCoastalRegion(location);
  const floodZone = coastal ? rng.pick(['moderate', 'high']) : rng.pick(['low', 'moderate']);
  const seismic = rng.pick(['low', 'moderate']);
  const regulatory = rng.pick(['low', 'moderate', 'elevated']);
  const riskPenalty = (coastal ? 15 : 0) + (floodZone === 'high' ? 15 : floodZone === 'moderate' ? 7 : 0) + (regulatory === 'elevated' ? 10 : 0);
  const score = Math.max(20, 95 - riskPenalty - rng.int(0, 10));
  return {
    score,
    coastal,
    flood_zone: floodZone,
    seismic_zone: seismic,
    regulatory_risk: regulatory,
    flags: [
      coastal ? 'Coastal exposure — cyclone/storm-surge planning required' : null,
      floodZone === 'high' ? 'High flood-zone rating — elevate critical infrastructure' : null,
      regulatory === 'elevated' ? 'Elevated regulatory friction in this jurisdiction' : null,
    ].filter(Boolean),
  };
}

function computeCostEstimation(rng, { capacity }) {
  const capexPerMw = rng.int(6, 10); // $M per MW, illustrative
  const capex = capacity * capexPerMw;
  const opexPerYear = Math.round(capex * rng.float(0.06, 0.1));
  const paybackYears = Math.round(capex / (opexPerYear * rng.float(1.3, 1.8)));
  const score = Math.max(30, 100 - Math.round(capexPerMw * 5));
  return {
    score,
    capex_usd_m: capex,
    opex_usd_m_per_year: opexPerYear,
    payback_years: Math.min(15, Math.max(3, paybackYears)),
  };
}

function computeConnectivity(rng, { location }) {
  const fiberRoutes = rng.int(2, 9);
  const latency = rng.int(2, 18);
  const carrierDensity = rng.pick(['Low', 'Moderate', 'High', 'Very High']);
  const score = Math.min(100, fiberRoutes * 8 + Math.max(0, 30 - latency));
  return {
    score: Math.min(100, score),
    fiber_routes: fiberRoutes,
    latency_ms_to_hub: latency,
    carrier_density: carrierDensity,
  };
}

function computeFinalRecommendation(modules, { location, capacity, clientName, decisionType }) {
  const scored = Object.values(modules).filter(m => typeof m?.score === 'number');
  const avg = scored.length ? Math.round(scored.reduce((s, m) => s + m.score, 0) / scored.length) : 60;
  const verdict = avg >= 75 ? 'Proceed' : avg >= 55 ? 'Proceed with mitigations' : 'Hold — material gaps identified';
  const topLocation = modules.candidate_locations?.ranked?.[0]?.name;
  const headline = topLocation
    ? `${verdict} — ${topLocation}`
    : `${verdict} for ${location}`;
  return {
    score: avg,
    verdict,
    headline,
    summary_metrics: [
      { label: 'Capacity', value: `${capacity} MW` },
      { label: 'Location', value: location },
      ...(clientName ? [{ label: 'Client', value: clientName }] : []),
    ],
  };
}

/**
 * Computes data for EVERY module in the decision_type's registry.
 * Pure function — same inputs always produce the same output.
 */
export function computeDecisionData(decisionType, rawParams) {
  const params = normParams(decisionType, rawParams);
  const seedKey = `${decisionType}|${params.location}|${params.capacity}|${params.clientName}`;

  const modules = {};
  modules.feasibility = computeFeasibility(makeRng(seedKey + '|feasibility'), params);
  modules.candidate_locations = computeCandidateLocations(makeRng(seedKey + '|locations'), params);
  modules.power_analysis = computePowerAnalysis(makeRng(seedKey + '|power'), params);
  modules.risk_analysis = computeRiskAnalysis(makeRng(seedKey + '|risk'), params);
  modules.cost_estimation = computeCostEstimation(makeRng(seedKey + '|cost'), params);
  modules.connectivity = computeConnectivity(makeRng(seedKey + '|connectivity'), params);
  modules.final_recommendation = computeFinalRecommendation(modules, params);

  return { params, modules };
}

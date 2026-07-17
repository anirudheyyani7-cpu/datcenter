// Deterministic computation engine.
//
// Every score, rank, and financial figure in the cockpit comes from here —
// never from the LLM. Given the same decision_type + params, this always
// returns byte-identical output (seeded PRNG, no Math.random(), no Date.now()).

import { isCoastalRegion } from '@/data/decisionModules';
import { CHIP_PROFILES, COOLING_PROFILES, COST_BASIS } from '@/data/gpuChipProfiles';

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
  const chipGeneration = params?.chipGeneration || null;
  const coolingApproach = params?.coolingApproach || null;
  return { location, capacity, clientName, decisionType, chipGeneration, coolingApproach };
}

// ── AI/GPU campus physics helpers ────────────────────────────────────────
// Resolution + derivation only — no randomness. Shared by
// computeGpuClusterPlanning and the chip-aware branches of
// computePowerAnalysis / computeCostEstimation / computeRiskAnalysis below,
// so the physics are computed identically everywhere they're used.

function resolveChip(chipGeneration) {
  return CHIP_PROFILES.find(c => c.id === chipGeneration) || CHIP_PROFILES.find(c => c.id === 'h100');
}

function resolveCooling(coolingApproach) {
  return COOLING_PROFILES.find(c => c.id === coolingApproach) || COOLING_PROFILES.find(c => c.id === 'air_containment');
}

function minViableCooling(rackPowerKw) {
  const viable = COOLING_PROFILES.filter(c => c.max_rack_kw >= rackPowerKw).sort((a, b) => a.max_rack_kw - b.max_rack_kw);
  if (viable.length) return viable[0];
  // Nothing on the list can support this density — surface the most capable tier anyway.
  return COOLING_PROFILES.reduce((a, b) => (b.max_rack_kw > a.max_rack_kw ? b : a));
}

function computeAchievablePue(chip, cooling) {
  return Math.round(Math.max(chip.min_pue, 1 + cooling.pue_penalty) * 100) / 100;
}

// Derives (never randomizes) the physics of a GPU cluster at a given IT
// capacity for a chosen chip generation + cooling approach.
function deriveClusterPhysics({ capacity, chipGeneration, coolingApproach }) {
  const chip = resolveChip(chipGeneration);
  const cooling = resolveCooling(coolingApproach);
  const rackPowerKw = chip.rack_power_kw;
  const coolingMismatch = cooling.max_rack_kw < rackPowerKw;
  const minViable = coolingMismatch ? minViableCooling(rackPowerKw) : cooling;

  const capacityKw = capacity * 1000;
  const racksRequired = Math.ceil(capacityKw / rackPowerKw);
  const gpusSupported = racksRequired * chip.gpus_per_rack;
  const nodesRequired = Math.ceil(gpusSupported / chip.gpus_per_node);

  const achievablePue = computeAchievablePue(chip, cooling);
  const estimatedWue = cooling.wue_l_per_kwh;
  const gridConnectionMwRequired = Math.round(capacity * achievablePue * 10) / 10;

  const facilityBasis = cooling.facility_class === 'liquid_ready'
    ? COST_BASIS.facility_capex_usd_per_mw.liquid_ready
    : COST_BASIS.facility_capex_usd_per_mw.conventional_air;
  const facilityCapexUsd = Math.round(capacity * facilityBasis * cooling.capex_multiplier);
  const gpuCapexUsd = Math.round(nodesRequired * COST_BASIS.gpu_hardware_capex_usd_per_node[chip.id]);
  const totalCapexUsd = facilityCapexUsd + gpuCapexUsd;

  return {
    chip, cooling, coolingMismatch,
    minViableCoolingId: minViable.id, minViableCoolingLabel: minViable.label,
    racksRequired, gpusSupported, nodesRequired, powerDensityKwPerRack: rackPowerKw,
    achievablePue, estimatedWue, gridConnectionMwRequired,
    facilityCapexUsd, gpuCapexUsd, totalCapexUsd,
  };
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

function computePowerAnalysis(rng, { capacity, chipGeneration, coolingApproach }) {
  // When chip-aware, the grid capacity needed reflects the PUE-adjusted load
  // (the number actually negotiated with a utility), not the raw IT capacity.
  // When chip_generation is null this is a no-op — effectiveLoad === capacity,
  // so every downstream rng call/argument matches today's behavior exactly.
  const chipAware = !!chipGeneration;
  let effectiveLoad = capacity;
  let achievablePue = null;
  if (chipAware) {
    const physics = deriveClusterPhysics({ capacity, chipGeneration, coolingApproach });
    achievablePue = physics.achievablePue;
    effectiveLoad = physics.gridConnectionMwRequired;
  }

  const gridCapacity = rng.int(Math.round(effectiveLoad * 1.5), Math.round(effectiveLoad * 4));
  const substationDistance = rng.int(1, 15);
  const renewableMix = rng.int(20, 55);
  const score = Math.round(
    Math.min(100, (gridCapacity / effectiveLoad) * 20) * 0.5 +
    Math.max(0, 100 - substationDistance * 5) * 0.3 +
    renewableMix * 0.2
  );
  return {
    score: Math.min(100, score),
    grid_capacity_mw: gridCapacity,
    substation_distance_km: substationDistance,
    renewable_mix_pct: renewableMix,
    verdict: score >= 75 ? 'Grid-ready' : score >= 55 ? 'Upgrades required' : 'Significant grid investment needed',
    ...(chipAware ? { pue_adjusted_load_mw: effectiveLoad, achievable_pue: achievablePue } : {}),
  };
}

function computeRiskAnalysis(rng, { location, capacity, chipGeneration, coolingApproach }) {
  const coastal = isCoastalRegion(location);
  const floodZone = coastal ? rng.pick(['moderate', 'high']) : rng.pick(['low', 'moderate']);
  const seismic = rng.pick(['low', 'moderate']);
  const regulatory = rng.pick(['low', 'moderate', 'elevated']);
  const riskPenalty = (coastal ? 15 : 0) + (floodZone === 'high' ? 15 : floodZone === 'moderate' ? 7 : 0) + (regulatory === 'elevated' ? 10 : 0);
  let score = Math.max(20, 95 - riskPenalty - rng.int(0, 10));
  const flags = [
    coastal ? 'Coastal exposure — cyclone/storm-surge planning required' : null,
    floodZone === 'high' ? 'High flood-zone rating — elevate critical infrastructure' : null,
    regulatory === 'elevated' ? 'Elevated regulatory friction in this jurisdiction' : null,
  ];

  // AI-specific risks — only evaluated when chip_generation is set, and only
  // via NEW rng calls appended after the ones above, so the existing 4 rng
  // draws (and therefore every existing decision_type's output) are untouched.
  const chipAware = !!chipGeneration;
  let aiFields = {};
  if (chipAware) {
    const physics = deriveClusterPhysics({ capacity, chipGeneration, coolingApproach });
    const chipSupplyRisk = rng.pick(['moderate', 'elevated', 'severe']);
    const gridLeadTimeMonths = rng.int(9, 30);
    const coolingMaturity = physics.cooling.facility_class === 'liquid_ready' ? rng.pick(['emerging', 'maturing']) : 'established';
    const aiPenalty =
      (chipSupplyRisk === 'severe' ? 20 : chipSupplyRisk === 'elevated' ? 10 : 5) +
      (physics.coolingMismatch ? 15 : 0) +
      (coolingMaturity === 'emerging' ? 10 : 0);
    score = Math.max(15, score - aiPenalty);

    flags.push(`Chip supply/allocation risk: ${chipSupplyRisk}`);
    flags.push(`Grid interconnection lead time ~${gridLeadTimeMonths} months vs a typical 18-24 month AI campus build schedule`);
    flags.push(
      physics.coolingMismatch
        ? `Cooling-tech mismatch — ${physics.cooling.label} cannot support ${physics.powerDensityKwPerRack}kW/rack`
        : `Cooling-tech maturity: ${coolingMaturity}`
    );
    aiFields = { chip_supply_risk: chipSupplyRisk, grid_lead_time_months: gridLeadTimeMonths, cooling_maturity: coolingMaturity };
  }

  const verdict = score >= 75 ? 'Low risk' : score >= 55 ? 'Moderate risk' : 'Elevated risk — mitigation required';
  return {
    score,
    verdict,
    coastal,
    flood_zone: floodZone,
    seismic_zone: seismic,
    regulatory_risk: regulatory,
    flags: flags.filter(Boolean),
    ...aiFields,
  };
}

function computeCostEstimation(rng, { capacity, chipGeneration, coolingApproach }) {
  const capexPerMw = rng.int(6, 10); // $M per MW, illustrative
  let capex = capacity * capexPerMw;

  // Chip-aware: capex becomes facility capex + GPU hardware capex (modeled
  // separately, per data/gpuChipProfiles.js) instead of the generic $/MW
  // draw above. When chip_generation is null this branch never runs, so
  // capex/opex/payback/score are computed with the exact same rng calls
  // and arguments as today.
  const chipAware = !!chipGeneration;
  let facilityCapexUsdM = null;
  let gpuCapexUsdM = null;
  if (chipAware) {
    const physics = deriveClusterPhysics({ capacity, chipGeneration, coolingApproach });
    facilityCapexUsdM = Math.round(physics.facilityCapexUsd / 1_000_000);
    gpuCapexUsdM = Math.round(physics.gpuCapexUsd / 1_000_000);
    capex = facilityCapexUsdM + gpuCapexUsdM;
  }

  const opexPerYear = Math.round(capex * rng.float(0.06, 0.1));
  const paybackYears = Math.min(15, Math.max(3, Math.round(capex / (opexPerYear * rng.float(1.3, 1.8)))));
  const score = Math.max(30, 100 - Math.round(capexPerMw * 5));
  const verdict = paybackYears <= 6 ? 'Fast payback' : paybackYears <= 9 ? 'Moderate payback' : 'Slow payback — capital-intensive';
  return {
    score,
    verdict,
    capex_usd_m: capex,
    opex_usd_m_per_year: opexPerYear,
    payback_years: paybackYears,
    ...(chipAware ? { facility_capex_usd_m: facilityCapexUsdM, gpu_capex_usd_m: gpuCapexUsdM } : {}),
  };
}

function computeConnectivity(rng, { location }) {
  const fiberRoutes = rng.int(2, 9);
  const latency = rng.int(2, 18);
  const carrierDensity = rng.pick(['Low', 'Moderate', 'High', 'Very High']);
  const score = Math.min(100, fiberRoutes * 8 + Math.max(0, 30 - latency));
  const verdict = score >= 75 ? 'Well-connected' : score >= 55 ? 'Adequate connectivity' : 'Connectivity gap';
  return {
    score: Math.min(100, score),
    verdict,
    fiber_routes: fiberRoutes,
    latency_ms_to_hub: latency,
    carrier_density: carrierDensity,
  };
}

// AI/GPU campus cluster planner. Resolves the chip + cooling profile and
// DERIVES cluster physics/capex via deriveClusterPhysics — rng is used only
// for genuinely uncertain inputs (grid interconnection lead time), never for
// the physics or arithmetic.
function computeGpuClusterPlanning(rng, { capacity, chipGeneration, coolingApproach }) {
  const physics = deriveClusterPhysics({ capacity, chipGeneration, coolingApproach });
  const {
    chip, cooling, coolingMismatch, minViableCoolingId, minViableCoolingLabel,
    racksRequired, gpusSupported, nodesRequired, powerDensityKwPerRack,
    achievablePue, estimatedWue, gridConnectionMwRequired,
    facilityCapexUsd, gpuCapexUsd, totalCapexUsd,
  } = physics;

  // Genuinely uncertain input — not derivable from the physics above.
  const gridLeadTimeMonths = rng.int(9, 30);

  // Fixed 3-phase rollout cadence — a planning convention, not randomized.
  const PHASES = [
    { phase: 'Foundation', fraction: 0.3 },
    { phase: 'Scale-Up', fraction: 0.4 },
    { phase: 'Full Buildout', fraction: 0.3 },
  ];
  const capexPhasing = PHASES.map(({ phase, fraction }) => ({
    phase,
    mw: Math.round(capacity * fraction * 10) / 10,
    capex_usd: Math.round(totalCapexUsd * fraction),
  }));

  // The headline AI-campus insight: what a conventional-DC $/MW rule of
  // thumb would earmark for this capacity (the "envelope"), versus how many
  // MW that same budget actually buys once GPU hardware capex — not
  // facility capex — dominates the bill.
  const envelopeUsd = Math.round(capacity * COST_BASIS.facility_capex_usd_per_mw.conventional_air);
  const blendedCostPerMw = totalCapexUsd / capacity;
  const deliverableMw = Math.round((envelopeUsd / blendedCostPerMw) * 10) / 10;
  const envelopeUtilizationPct = Math.round((deliverableMw / capacity) * 1000) / 10;

  let score = Math.round(90 - (achievablePue - 1.0) * 100);
  if (coolingMismatch) score -= 30;
  score = Math.max(15, Math.min(97, score));

  const verdict = coolingMismatch
    ? `Cooling mismatch — ${cooling.label} cannot support ${powerDensityKwPerRack}kW/rack`
    : achievablePue <= 1.15 ? 'Deployable as specified' : 'Deployable with efficiency trade-offs';

  return {
    score,
    verdict,
    chip_id: chip.id,
    chip_label: chip.label,
    cooling_id: cooling.id,
    cooling_label: cooling.label,
    gpus_supported: gpusSupported,
    nodes_required: nodesRequired,
    racks_required: racksRequired,
    power_density_kw_per_rack: powerDensityKwPerRack,
    cooling_mismatch: coolingMismatch,
    min_viable_cooling_id: coolingMismatch ? minViableCoolingId : null,
    min_viable_cooling_label: coolingMismatch ? minViableCoolingLabel : null,
    achievable_pue: achievablePue,
    estimated_wue_l_per_kwh: estimatedWue,
    grid_connection_mw_required: gridConnectionMwRequired,
    grid_lead_time_months: gridLeadTimeMonths,
    facility_capex_usd: facilityCapexUsd,
    gpu_capex_usd: gpuCapexUsd,
    total_capex_usd: totalCapexUsd,
    capex_phasing: capexPhasing,
    envelope_utilization: {
      envelope_usd: envelopeUsd,
      requested_mw: capacity,
      deliverable_mw: deliverableMw,
      utilization_pct: envelopeUtilizationPct,
    },
  };
}

function computeFinalRecommendation(modules, { location, capacity, clientName, decisionType }) {
  const scores = Object.values(modules).filter(m => typeof m?.score === 'number').map(m => m.score);
  const avg = scores.length ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 60;
  const verdict = avg >= 75 ? 'Proceed' : avg >= 55 ? 'Proceed with mitigations' : 'Hold — material gaps identified';
  const topLocation = modules.candidate_locations?.ranked?.[0]?.name;
  const headline = topLocation
    ? `${verdict} — ${topLocation}`
    : `${verdict} for ${location}`;

  // Confidence: high when the underlying module scores agree with each other
  // (low spread); a wide spread (e.g. great power, terrible risk) means the
  // recommendation is less clear-cut even if the average looks fine.
  const spread = scores.length > 1 ? Math.max(...scores) - Math.min(...scores) : 0;
  const confidence = Math.max(45, Math.min(95, Math.round(avg - spread * 0.3 + 10)));

  return {
    score: avg,
    verdict,
    headline,
    confidence,
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

  // IMPORTANT: only append the new AI/GPU params to the seed when they're
  // actually set (i.e. effectively only for ai_gpu_campus). Appending them
  // unconditionally would change the seed — and therefore every computed
  // figure — for the 4 existing decision types.
  let seedKey = `${decisionType}|${params.location}|${params.capacity}|${params.clientName}`;
  if (params.chipGeneration) seedKey += `|${params.chipGeneration}`;
  if (params.coolingApproach) seedKey += `|${params.coolingApproach}`;

  const modules = {};
  modules.feasibility = computeFeasibility(makeRng(seedKey + '|feasibility'), params);
  modules.candidate_locations = computeCandidateLocations(makeRng(seedKey + '|locations'), params);
  modules.power_analysis = computePowerAnalysis(makeRng(seedKey + '|power'), params);
  modules.risk_analysis = computeRiskAnalysis(makeRng(seedKey + '|risk'), params);
  modules.cost_estimation = computeCostEstimation(makeRng(seedKey + '|cost'), params);
  modules.connectivity = computeConnectivity(makeRng(seedKey + '|connectivity'), params);
  // Only computed for ai_gpu_campus — computing it unconditionally would leak
  // its score into computeFinalRecommendation's average for every other
  // decision type too, changing their output.
  if (decisionType === 'ai_gpu_campus') {
    modules.gpu_cluster_planning = computeGpuClusterPlanning(makeRng(seedKey + '|gpu'), params);
  }
  modules.final_recommendation = computeFinalRecommendation(modules, params);

  return { params, modules };
}

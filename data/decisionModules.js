// Decision-engine registry — FIXED structure.
// The LLM is only allowed to select/rank/explain from this registry.
// It can never invent a module name or a decision_type.

export const DECISION_QUICK_STARTS = [
  {
    id: 'land-site-audit',
    decision_type: 'land_site_audit',
    title: 'Land & Site Audit',
    subtitle: 'Find and rank candidate locations for a new AI datacenter',
    icon: 'MapPin',
  },
  {
    id: 'power-readiness',
    decision_type: 'power_readiness',
    title: 'Power Readiness Assessment',
    subtitle: 'Evaluate grid access, substations, and energy strategy',
    icon: 'Zap',
  },
  {
    id: 'cooling-sustainability',
    decision_type: 'cooling_sustainability',
    title: 'Cooling & Sustainability Review',
    subtitle: 'Analyze PUE, WUE, cooling design, and ESG impact',
    icon: 'Droplets',
  },
  {
    id: 'expansion-investment',
    decision_type: 'expansion_investment',
    title: 'Expansion & Investment Strategy',
    subtitle: 'Assess build vs acquire, expansion, and capital deployment',
    icon: 'TrendingUp',
  },
];

// The 7 globally-fixed modules. No other module name may ever appear
// in selected_modules / priority_order, by the LLM or by the engine.
export const ALL_MODULES = [
  'final_recommendation',
  'candidate_locations',
  'feasibility',
  'power_analysis',
  'risk_analysis',
  'cost_estimation',
  'connectivity',
];

// Fixed per-decision_type subset — defines what's even eligible for that decision.
export const MODULE_REGISTRY = {
  land_site_audit: [
    'final_recommendation',
    'candidate_locations',
    'feasibility',
    'power_analysis',
    'risk_analysis',
    'cost_estimation',
    'connectivity',
  ],
  power_readiness: [
    'final_recommendation',
    'power_analysis',
    'risk_analysis',
    'cost_estimation',
    'feasibility',
    'connectivity',
  ],
  cooling_sustainability: [
    'final_recommendation',
    'feasibility',
    'risk_analysis',
    'cost_estimation',
    'power_analysis',
  ],
  expansion_investment: [
    'final_recommendation',
    'cost_estimation',
    'risk_analysis',
    'feasibility',
    'candidate_locations',
    'power_analysis',
  ],
};

export const MODULE_LABELS = {
  final_recommendation: 'Final Recommendation',
  candidate_locations: 'Top Locations',
  feasibility: 'Feasibility',
  power_analysis: 'Power',
  risk_analysis: 'Risk',
  cost_estimation: 'Cost',
  connectivity: 'Connectivity',
};

// module → card component key (Part 6)
export const CARD_MAPPING = {
  final_recommendation: 'HeroCard',
  candidate_locations: 'TopLocationsCard',
  power_analysis: 'PowerCard',
  risk_analysis: 'RiskCard',
  cost_estimation: 'CostCard',
  connectivity: 'ConnectivityCard',
  feasibility: 'FeasibilityCard',
};

// Deterministic lookup — used by the coastal/flood hard constraint.
// Plain string match, no LLM, no geocoding API.
export const COASTAL_REGIONS = [
  'chennai', 'mumbai', 'kochi', 'cochin', 'visakhapatnam', 'vizag',
  'mangalore', 'goa', 'kolkata', 'surat', 'kandla', 'chittagong',
  'singapore', 'jakarta', 'manila', 'ho chi minh', 'bangkok',
];

export function isCoastalRegion(location = '') {
  const l = location.toLowerCase();
  return COASTAL_REGIONS.some(region => l.includes(region));
}

const MIN_MODULES = 3;
const MAX_MODULES = 5;
const POWER_THRESHOLD_MW = 50;

/**
 * Deterministic, code-enforced hard constraints. Runs AFTER the LLM
 * proposes a selection, and also defines the fallback path used when
 * the LLM call fails or returns something invalid.
 *
 * The LLM is never trusted to enforce these on its own — every rule
 * here is re-checked in code regardless of what the LLM said.
 */
export function applyHardConstraints(decisionType, params, llmSelection = {}) {
  const registry = MODULE_REGISTRY[decisionType] || [];
  const capacity = Number(params?.capacity) || 0;
  const coastal = isCoastalRegion(params?.location);

  // 1. Start from the LLM's pick, but drop anything not in this decision_type's registry
  //    (this is the "LLM cannot invent modules" enforcement).
  let selected = (llmSelection.selected_modules || [])
    .filter(m => registry.includes(m));

  // 2. Required inclusions by rule.
  const required = new Set();
  required.add('final_recommendation'); // always
  if (capacity >= POWER_THRESHOLD_MW && registry.includes('power_analysis')) required.add('power_analysis');
  if (coastal && registry.includes('risk_analysis')) required.add('risk_analysis');
  if (decisionType === 'land_site_audit' && registry.includes('candidate_locations')) required.add('candidate_locations');

  required.forEach(m => { if (!selected.includes(m)) selected.push(m); });

  // 3. Clamp to 3–5, filling from registry order if under the minimum.
  if (selected.length < MIN_MODULES) {
    for (const m of registry) {
      if (selected.length >= MIN_MODULES) break;
      if (!selected.includes(m)) selected.push(m);
    }
  }
  if (selected.length > MAX_MODULES) {
    // Keep required modules first, then trim the rest.
    const requiredFirst = [...selected.filter(m => required.has(m)), ...selected.filter(m => !required.has(m))];
    selected = requiredFirst.slice(0, MAX_MODULES);
  }

  // 4. Priority order — respect the LLM's proposed order where possible,
  //    otherwise fall back to registry order. final_recommendation always leads.
  let priorityOrder = (llmSelection.priority_order || []).filter(m => selected.includes(m));
  selected.forEach(m => { if (!priorityOrder.includes(m)) priorityOrder.push(m); });
  priorityOrder = ['final_recommendation', ...priorityOrder.filter(m => m !== 'final_recommendation')];

  return { selected_modules: selected, priority_order: priorityOrder, required: [...required] };
}

/**
 * Fully deterministic fallback selection — used when the LLM call
 * fails, times out, or returns malformed output. No randomness.
 */
export function defaultSelection(decisionType, params) {
  const registry = MODULE_REGISTRY[decisionType] || [];
  const { selected_modules, priority_order } = applyHardConstraints(decisionType, params, {
    selected_modules: registry.slice(0, MAX_MODULES),
    priority_order: registry,
  });
  return { selected_modules, priority_order };
}

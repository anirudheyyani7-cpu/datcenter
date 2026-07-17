// AI/GPU campus domain constants — the ONLY place chip, cooling, and cost
// assumptions for the ai_gpu_campus decision type live. Every figure here is
// a planning-grade estimate (illustrative order-of-magnitude, not a vendor
// quote) — correct them here and every downstream computation updates.
//
// Consumed exclusively by lib/decisionEngine.js's computeGpuClusterPlanning
// and the chip-aware branches of computePowerAnalysis / computeCostEstimation
// / computeRiskAnalysis. No randomness lives in this file.

// Rack/node power figures assume a density level that keeps the profile
// "paired" with the cooling tier named in `cooling_required` (its minimum
// viable cooling — see COOLING_PROFILES below). Source: vendor reference
// architectures (NVIDIA DGX/HGX + GB200 NVL72 public specs), rounded to
// planning-grade figures — treat as an estimate, not a spec sheet.
export const CHIP_PROFILES = [
  {
    id: 'h100',
    label: 'NVIDIA H100 SXM',
    vendor: 'NVIDIA',
    gpu_tdp_w: 700, // per-GPU TDP, SXM form factor
    gpus_per_node: 8, // standard 8-GPU HGX/DGX node
    node_power_kw: 10.2, // 8-GPU node incl. host/CPU/DRAM overhead — planning estimate
    rack_power_kw: 20.4, // 2 nodes/rack — kept air-viable per note below
    gpus_per_rack: 16,
    cooling_required: 'air_containment', // minimum viable cooling tier at this density
    min_pue: 1.2, // best-case achievable PUE at this chip's density with adequate cooling
    notes: 'Air-viable with hot/cold aisle containment at this density; liquid optional for higher rack fill.',
  },
  {
    id: 'h200',
    label: 'NVIDIA H200 SXM',
    vendor: 'NVIDIA',
    gpu_tdp_w: 700,
    gpus_per_node: 8,
    node_power_kw: 10.2,
    rack_power_kw: 40.8, // 4 nodes/rack — exceeds air-containment ceiling, needs rear-door HX+
    gpus_per_rack: 32,
    cooling_required: 'rear_door_hx',
    min_pue: 1.15,
    notes: 'Same per-GPU power as H100; typically racked denser, pushing past air-only cooling limits.',
  },
  {
    id: 'gb200_nvl72',
    label: 'NVIDIA GB200 NVL72',
    vendor: 'NVIDIA',
    gpu_tdp_w: 1200, // Blackwell-class GPU TDP within the NVL72 tray
    gpus_per_node: 72, // rack-scale system — the rack IS the "node" unit for this design
    node_power_kw: 120,
    rack_power_kw: 120,
    gpus_per_rack: 72,
    cooling_required: 'direct_to_chip',
    min_pue: 1.08,
    notes: 'Rack-scale NVLink domain; liquid (direct-to-chip) cooling is mandatory, not optional, at 120kW/rack.',
  },
  {
    id: 'next_gen',
    label: 'Next-gen (planning)',
    vendor: 'Forward-looking placeholder',
    gpu_tdp_w: 1500,
    gpus_per_node: 8,
    node_power_kw: 17.8,
    rack_power_kw: 160, // 9 nodes/rack — beyond direct-to-chip ceiling, needs immersion
    gpus_per_rack: 72,
    cooling_required: 'immersion',
    min_pue: 1.04,
    notes: 'Placeholder for the next silicon generation — figures are directional, for scenario planning only.',
  },
];

// Source: industry cooling-tier reference points (ASHRAE liquid cooling
// guidance + vendor rack-density envelopes), rounded to planning-grade
// figures. `facility_class` marks whether the facility's electrical/
// mechanical plant needs a liquid-ready (re)design, or can retrofit onto a
// conventional-air facility shell.
export const COOLING_PROFILES = [
  {
    id: 'air_containment',
    label: 'Air (hot/cold aisle containment)',
    max_rack_kw: 30,
    pue_penalty: 0.25, // additive over a 1.0 baseline
    wue_l_per_kwh: 1.8, // evaporative cooling tower water draw — planning estimate
    capex_multiplier: 1.0,
    facility_class: 'conventional',
  },
  {
    id: 'rear_door_hx',
    label: 'Rear-door heat exchanger',
    max_rack_kw: 50,
    pue_penalty: 0.15,
    wue_l_per_kwh: 1.1,
    capex_multiplier: 1.2,
    facility_class: 'conventional', // retrofits onto a conventional facility shell
  },
  {
    id: 'direct_to_chip',
    label: 'Direct-to-chip liquid',
    max_rack_kw: 132,
    pue_penalty: 0.08,
    wue_l_per_kwh: 0.4,
    capex_multiplier: 1.5,
    facility_class: 'liquid_ready', // requires redesigned electrical/mechanical plant
  },
  {
    id: 'immersion',
    label: 'Immersion cooling',
    max_rack_kw: 250,
    pue_penalty: 0.04,
    wue_l_per_kwh: 0.15,
    capex_multiplier: 1.9,
    facility_class: 'liquid_ready', // different facility design entirely (tanks, not raised floor)
  },
];

// Facility capex ($/MW-IT) and GPU hardware capex ($/node) are modeled
// SEPARATELY on purpose: for AI campuses, GPU hardware capex typically
// dwarfs facility capex, which conventional-DC $/MW rules of thumb miss
// entirely. Source: industry-reported hyperscale AI campus build costs,
// rounded to planning-grade figures.
export const COST_BASIS = {
  facility_capex_usd_per_mw: {
    conventional_air: 7_000_000, // $/MW-IT, conventional air-cooled shell + power + cooling infra
    liquid_ready: 10_500_000, // $/MW-IT, liquid-ready electrical/mechanical plant
  },
  // $/node — for gb200_nvl72 (rack-scale), one "node" = one NVL72 rack (72 GPUs).
  gpu_hardware_capex_usd_per_node: {
    h100: 300_000, // 8x H100 SXM node, street-price-adjacent planning estimate
    h200: 360_000, // 8x H200 SXM node
    gb200_nvl72: 3_500_000, // 1x NVL72 rack-scale system, 72 GPUs
    next_gen: 480_000, // 8-GPU node, forward-looking placeholder (~1.5x H200)
  },
};

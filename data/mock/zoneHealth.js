// Deterministic per-DC zone-health generator for the Asset Portfolio digital twin.
// Fabricates the same { power, cooling, noc, soc, racks, security } shape Command
// Center's hand-authored mockZoneHealth (data/mock/index.js) uses for its Live Stats
// panel and 3D hotspot cards, derived from the DC's real attributes (healthScore,
// utilizationPercent, pue, totalCapacityMW) plus a seeded hash so results are stable
// per DC id but vary across DCs — same pattern as generateCampusThermal (thermal.js)
// and generateDCRacks (racks.js).

function hashId(id) {
  let h = 0;
  const s = String(id || 'dc');
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) || 1;
}

function makeRng(seed) {
  let s = seed;
  return function rng() {
    s = (s * 1664525 + 1013904223) | 0;
    return (s >>> 0) / 0xFFFFFFFF;
  };
}

const STATUS_ORDER = ['operational', 'warning', 'critical'];

function statusForScore(score) {
  if (score >= 90) return 'operational';
  if (score >= 75) return 'warning';
  return 'critical';
}

// Nudge a base status up or down a notch per-zone so the six zones aren't
// all identically healthy/unhealthy — mirrors real facilities where one
// subsystem lags behind the overall health score.
function jitterStatus(baseStatus, rng, driftChance = 0.22) {
  let idx = STATUS_ORDER.indexOf(baseStatus);
  if (rng() < driftChance) idx = Math.min(STATUS_ORDER.length - 1, idx + 1);
  else if (rng() < driftChance) idx = Math.max(0, idx - 1);
  return STATUS_ORDER[idx];
}

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length) % arr.length];

const ALERT_TEMPLATES = {
  power: {
    warning: [
      (n, u) => `Power load trending high at ${n} — ${u}% utilisation, monitor UPS headroom.`,
      (n) => `UPS load rebalancing in progress at ${n} — one bank running above nominal.`,
    ],
    critical: [
      (n) => `UPS bank degraded at ${n} — battery health critical, isolate and inspect immediately.`,
      (n) => `Power redundancy compromised at ${n} — failover capacity below threshold.`,
    ],
  },
  cooling: {
    warning: [
      (n, u, pue) => `Cooling running warm at ${n} — PUE ${pue} indicates reduced headroom, review CRAH capacity.`,
      (n) => `Chiller load elevated at ${n} — approaching setpoint, schedule inspection.`,
    ],
    critical: [
      (n, u, pue) => `Cooling load critical at ${n} — PUE ${pue}, chiller offline, escalate to facilities.`,
      (n) => `Thermal runaway risk at ${n} — cooling capacity insufficient for current load.`,
    ],
  },
  noc: {
    warning: [(n) => `${n} NOC tracking an elevated ticket queue — review open escalations.`],
    critical: [(n) => `${n} NOC handling multiple critical incidents — MTTR trending above SLA.`],
  },
  soc: {
    warning: [(n) => `Security operations flagged a low-priority access anomaly at ${n} — under review.`],
    critical: [(n) => `Security operations flagged active threat activity at ${n} — investigation in progress.`],
  },
  racks: {
    warning: [(n, hot) => `${hot} rack${hot === 1 ? '' : 's'} above 85% utilisation at ${n} — plan capacity expansion.`],
    critical: [(n, hot) => `${hot} racks above safe thermal/power threshold at ${n} — immediate load rebalance recommended.`],
  },
  security: {
    warning: [(n) => `Physical security logged a minor access anomaly at ${n} in the last 24h.`],
    critical: [(n) => `Physical security investigating a breach attempt at ${n} — perimeter alert active.`],
  },
};

function alertsFor(zone, status, rng, ...args) {
  if (status === 'operational') return [];
  const templates = ALERT_TEMPLATES[zone][status];
  return [pick(rng, templates)(...args)];
}

// Deterministic fallback zone-health for any DC — Google campuses, uploaded/
// ingested datasets, or Supabase asset_register rows — that has no hand-authored
// entry in mockZoneHealth. Consumes the adapted `dc` shape produced by
// assetToDigitalTwinDC / googleDCToDigitalTwinDC in lib/assetPortfolioCalc.js.
export function generateDCZoneHealth(dc) {
  const seed = hashId(dc?.id);
  const rng = makeRng(seed);

  const healthScore = dc?.healthScore ?? 85;
  const utilPct = clamp(Math.round(dc?.utilizationPercent ?? 70), 5, 99);
  const pue = dc?.pue ?? 1.4;
  const capacityMW = dc?.totalCapacityMW || 20;
  const name = dc?.name || dc?.id || 'this facility';
  const baseStatus = statusForScore(healthScore);

  const totalRacks = Math.max(20, Math.round(capacityMW * 15));
  const usedRacks = Math.round(totalRacks * (utilPct / 100));

  // Power
  const powerStatus = jitterStatus(baseStatus, rng);
  const upsTotal = clamp(Math.round(capacityMW / 25) + 2, 2, 8);
  const upsOffline = powerStatus === 'critical' ? 2 : powerStatus === 'warning' ? 1 : 0;
  const power = {
    status: powerStatus,
    loadPct: clamp(Math.round(utilPct + (rng() - 0.5) * 14), 10, 99),
    upsOnline: Math.max(1, upsTotal - upsOffline),
    upsTotal,
    batteryPct: clamp(Math.round(96 - (powerStatus === 'critical' ? 35 : powerStatus === 'warning' ? 15 : 0) - rng() * 8), 20, 99),
    redundancy: dc?.tier?.includes('IV') ? '2N' : rng() > 0.5 ? 'N+1' : '2N',
    alerts: alertsFor('power', powerStatus, rng, name, utilPct),
  };

  // Cooling
  const coolingStatus = jitterStatus(baseStatus, rng);
  const chillerTotal = clamp(Math.round(capacityMW / 30) + 2, 2, 6);
  const chillerOffline = coolingStatus === 'critical' ? 1 : 0;
  const avgTempC = clamp(Math.round(18 + (pue - 1.1) * 20 + rng() * 3), 18, 32);
  const cooling = {
    status: coolingStatus,
    loadPct: clamp(Math.round(utilPct - 5 + rng() * 15), 10, 99),
    chillerOnline: Math.max(1, chillerTotal - chillerOffline),
    chillerTotal,
    avgTempC,
    pue,
    alerts: alertsFor('cooling', coolingStatus, rng, name, utilPct, pue.toFixed(2)),
  };

  // NOC
  const nocStatus = jitterStatus(baseStatus, rng);
  const noc = {
    status: nocStatus,
    activeTickets: nocStatus === 'critical' ? 5 + Math.round(rng() * 4) : nocStatus === 'warning' ? 2 + Math.round(rng() * 3) : Math.round(rng() * 2),
    staffOnDuty: clamp(Math.round(capacityMW / 20) + 2, 2, 12),
    mttrMin: clamp(Math.round(20 + (100 - healthScore) * 1.2 + rng() * 15), 15, 120),
    slaCompliance: clamp(+(99.9 - (100 - healthScore) * 0.08 - rng() * 0.5).toFixed(1), 95, 99.99),
    alerts: alertsFor('noc', nocStatus, rng, name),
  };

  // SOC
  const socStatus = jitterStatus(baseStatus, rng);
  const camerasTotal = clamp(Math.round(capacityMW * 0.6) + 12, 12, 96);
  const soc = {
    status: socStatus,
    activeAlerts: socStatus === 'critical' ? 2 + Math.round(rng() * 3) : socStatus === 'warning' ? 1 : 0,
    threatsBlocked: Math.round(20 + rng() * 100),
    compliancePct: clamp(Math.round(99 - (100 - healthScore) * 0.3), 85, 100),
    cctvsOnline: camerasTotal,
    alerts: alertsFor('soc', socStatus, rng, name),
  };

  // Racks
  const racksStatus = jitterStatus(utilPct > 85 ? 'warning' : baseStatus, rng, 0.15);
  const hotRacks = racksStatus === 'operational' ? 0 : Math.max(1, Math.round(totalRacks * (racksStatus === 'critical' ? 0.03 : 0.015)));
  const racks = {
    status: racksStatus,
    totalRacks,
    usedRacks,
    avgUtilPct: utilPct,
    hotRacks,
    alerts: alertsFor('racks', racksStatus, rng, name, hotRacks),
  };

  // Security
  const securityStatus = jitterStatus(baseStatus, rng, 0.12);
  const accessPoints = clamp(Math.round(capacityMW / 8) + 4, 4, 30);
  const security = {
    status: securityStatus,
    camerasOnline: securityStatus === 'critical' ? Math.max(0, camerasTotal - 2 - Math.round(rng() * 3)) : camerasTotal,
    camerasTotal,
    accessPoints,
    staffOnSite: clamp(Math.round(capacityMW / 18) + 2, 2, 14),
    incidents24h: securityStatus === 'operational' ? 0 : 1 + Math.round(rng() * 2),
    alerts: alertsFor('security', securityStatus, rng, name),
  };

  return { power, cooling, noc, soc, racks, security };
}

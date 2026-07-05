/**
 * Type definitions for the Global Infrastructure Intelligence module.
 * Plain JSDoc typedefs (project does not use TypeScript) — kept here so
 * components/services/hooks/utils can reference a single shared shape.
 */

/**
 * @typedef {'APAC' | 'EMEA' | 'Americas' | 'LatAm'} Region
 */

/**
 * @typedef {'healthy' | 'warning' | 'critical'} HealthStatus
 */

/**
 * @typedef {Object} Facility
 * @property {string} id
 * @property {string} name
 * @property {string} country
 * @property {string} city
 * @property {Region} region
 * @property {number} latitude
 * @property {number} longitude
 * @property {'Active' | 'Under Construction'} status
 * @property {HealthStatus} health
 * @property {'Low' | 'Medium' | 'High'} riskFlag
 * @property {string} facilityType
 * @property {number} capacityMw
 * @property {number} pue
 * @property {string} tier
 * @property {number} renewablePct
 * @property {number} utilizationPct
 * @property {number} carbonMt
 * @property {number} racks
 * @property {number} servers
 * @property {number} gpus
 * @property {string} address
 */

/**
 * @typedef {Object} PortfolioKpi
 * @property {string} id
 * @property {string} label
 * @property {string} value
 * @property {string} [unit]
 * @property {string} [caption]
 */

/**
 * @typedef {Object} RegionRollup
 * @property {Region} region
 * @property {number} facilityCount
 * @property {number} capacityMw
 * @property {number} avgRenewablePct
 * @property {number} avgPue
 * @property {number} criticalCount
 */

/**
 * @typedef {Object} FacilityFilters
 * @property {Region | 'All'} region
 * @property {string} country  // country name or 'All'
 * @property {HealthStatus | 'All'} health
 * @property {'Low' | 'Medium' | 'High' | 'All'} risk
 * @property {'Active' | 'Under Construction' | 'All'} status
 * @property {string} facilityType // or 'All'
 */

/**
 * @typedef {Object} GlobalInfrastructureInsight
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {'opportunity' | 'risk' | 'trend'} category
 * @property {number} confidence
 */

export {};

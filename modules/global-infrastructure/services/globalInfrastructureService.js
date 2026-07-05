/**
 * Service layer for the Global Infrastructure Intelligence page.
 *
 * Sources from the enterprise data layer (services/* + data/google/*.json,
 * 29 facilities, full hierarchy) built in the previous backend pass, rather
 * than the earlier standalone 94-facility dataset this module started with.
 * `fetchFacilities` adapts the enterprise DataCenter shape down to the flat
 * Facility shape every map/panel/filter component already consumes, so none
 * of those components needed to change.
 */
import { getDataCenters } from '@/services/dataCenterService';
import { getMaintenanceByDataCenter } from '@/services/dataCenterService';
import { getAssetTypeCounts } from '@/services/assetService';
import {
  buildPortfolioKpis,
  buildRegionRollups,
  buildAiInsights,
} from '../utils/portfolioAnalytics';

const HEALTH_FROM_RISK = { Low: 'healthy', Medium: 'warning', High: 'critical' };
const HOURS_PER_YEAR = 8760;

async function adaptDataCenter(dc) {
  const [maintenance, assetCounts] = await Promise.all([
    getMaintenanceByDataCenter(dc.id),
    getAssetTypeCounts(dc.id),
  ]);

  const servers = (assetCounts['Server'] ?? 0) + (assetCounts['GPU Server'] ?? 0);
  const underMaintenance = maintenance.some(m => m.status === 'Scheduled');
  const carbonMt = Math.round(
    (dc.capacity.itCapacityMw * (dc.capacity.capacityUtilizationPct / 100) * HOURS_PER_YEAR * dc.esg.carbonIntensityKgPerMwh) / 1000
  );

  return {
    id: dc.id,
    name: dc.identity.name,
    country: dc.location.country,
    city: dc.location.city,
    region: dc.location.region,
    latitude: dc.location.latitude,
    longitude: dc.location.longitude,
    status: dc.identity.status,
    commissionedYear: dc.identity.commissionedYear,
    health: HEALTH_FROM_RISK[dc.risk.riskLevel] ?? 'healthy',
    healthScore: Math.max(0, 100 - dc.risk.overallRiskScore),
    riskFlag: dc.risk.riskLevel,
    facilityType: dc.identity.facilityType,
    capacityMw: dc.capacity.itCapacityMw,
    pue: dc.power.pue,
    tier: dc.identity.tier,
    renewablePct: dc.esg.renewablePct,
    utilizationPct: dc.capacity.capacityUtilizationPct,
    carbonMt,
    racks: dc.infrastructure.rackCount,
    servers,
    gpuClusters: dc.gpu.gpuClusterCount,
    gpuUnits: dc.gpu.totalGpuUnits,
    aiWorkloadPct: dc.gpu.aiWorkloadPct,
    underMaintenance,
    esgGrade: dc.esg.esgGrade,
    waterUsageMlPerYear: dc.esg.waterUsageMlPerYear,
    operator: dc.identity.operator,
  };
}

export async function fetchFacilities() {
  const dataCenters = await getDataCenters();
  return Promise.all(dataCenters.map(adaptDataCenter));
}

export async function fetchPortfolioKpis(facilities) {
  return buildPortfolioKpis(facilities);
}

export async function fetchRegionRollups(facilities) {
  return buildRegionRollups(facilities);
}

export async function fetchAiInsights(facilities, rollups) {
  return buildAiInsights(facilities, rollups);
}

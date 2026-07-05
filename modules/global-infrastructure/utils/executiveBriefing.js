/**
 * Generates the AI Executive Briefing narrative entirely from the current
 * (filtered) dataset — no hardcoded sentences. Each line is built from a
 * real aggregate computed below; if an aggregate has nothing notable to
 * report, its line is simply omitted rather than padded with filler.
 */
import { buildRegionRollups } from './portfolioAnalytics';
import { REGION_LABELS } from './regions';

export function buildExecutiveBriefing(facilities, esgSnapshotByDc = {}, esgPrevMonthByDc = {}) {
  if (!facilities.length) return [];

  const lines = [];
  const rollups = buildRegionRollups(facilities);

  const criticalCount = facilities.filter(f => f.health === 'critical').length;
  const warningCount = facilities.filter(f => f.health === 'warning').length;
  const overallHealth = criticalCount === 0 && warningCount === 0
    ? 'Global infrastructure remains healthy across all monitored facilities.'
    : criticalCount > 0
      ? `Global infrastructure shows ${criticalCount} site${criticalCount > 1 ? 's' : ''} at critical risk and ${warningCount} under watch.`
      : `Global infrastructure is largely healthy, with ${warningCount} site${warningCount > 1 ? 's' : ''} flagged for elevated risk.`;
  lines.push(overallHealth);

  const busiestRegion = [...rollups].sort((a, b) => b.avgUtilizationPct - a.avgUtilizationPct)[0];
  if (busiestRegion) {
    lines.push(`${busiestRegion.region} is operating at ${busiestRegion.avgUtilizationPct}% average utilization, the highest of any region in the current view.`);
  }

  const hotSite = [...facilities].sort((a, b) => b.utilizationPct - a.utilizationPct)[0];
  if (hotSite && hotSite.utilizationPct >= 85) {
    lines.push(`${hotSite.city} is approaching higher cooling demand at ${hotSite.utilizationPct}% utilization and may warrant capacity review.`);
  }

  const maintenanceCount = facilities.filter(f => f.underMaintenance).length;
  if (maintenanceCount > 0) {
    lines.push(`${maintenanceCount} facilit${maintenanceCount > 1 ? 'ies have' : 'y has'} scheduled maintenance in the current view.`);
  }

  const avgRenewableNow = facilities.reduce((s, f) => s + f.renewablePct, 0) / facilities.length;
  const trackedPrev = facilities
    .map(f => esgPrevMonthByDc[f.id])
    .filter(Boolean);
  if (trackedPrev.length) {
    const avgRenewablePrev = trackedPrev.reduce((s, e) => s + e.renewablePct, 0) / trackedPrev.length;
    const delta = Math.round(avgRenewableNow - avgRenewablePrev);
    if (delta !== 0) {
      lines.push(`Renewable energy usage ${delta > 0 ? 'increased' : 'decreased'} ${Math.abs(delta)}% month-over-month across the current view.`);
    }
  }

  const underConstruction = facilities.filter(f => f.status === 'Under Construction').length;
  if (underConstruction > 0) {
    lines.push(`${underConstruction} campus${underConstruction > 1 ? 'es are' : ' is'} currently under construction, expanding portfolio capacity.`);
  }

  return lines;
}

/**
 * Same "derive every line from real data, omit if nothing to say" approach
 * as buildExecutiveBriefing, scoped to a single region — different framing
 * (facility-level callouts rather than region-vs-region comparisons) since
 * there's only one region in view.
 */
export function buildRegionalBriefing(regionCode, facilities, criticalIncidentCount = 0) {
  if (!facilities.length) return [];

  const lines = [];
  const label = REGION_LABELS[regionCode] ?? regionCode;
  const countries = new Set(facilities.map(f => f.country)).size;

  lines.push(`${label} currently operates ${facilities.length} facilit${facilities.length === 1 ? 'y' : 'ies'} across ${countries} countr${countries === 1 ? 'y' : 'ies'}.`);

  const avgUtilization = Math.round(facilities.reduce((s, f) => s + f.utilizationPct, 0) / facilities.length);
  lines.push(`Average utilization remains ${avgUtilization >= 85 ? 'elevated' : avgUtilization >= 60 ? 'healthy' : 'moderate'} at ${avgUtilization}%.`);

  const avgRenewable = Math.round(facilities.reduce((s, f) => s + f.renewablePct, 0) / facilities.length);
  lines.push(`Renewable energy usage ${avgRenewable >= 80 ? 'exceeds' : 'stands at'} ${avgRenewable}%.`);

  const sortedByRenewable = [...facilities].sort((a, b) => b.renewablePct - a.renewablePct);
  if (sortedByRenewable.length >= 2) {
    lines.push(`${sortedByRenewable[0].city} and ${sortedByRenewable[1].city} continue to lead sustainability metrics.`);
  } else if (sortedByRenewable.length === 1) {
    lines.push(`${sortedByRenewable[0].city} leads the region's sustainability metrics.`);
  }

  const hotSite = [...facilities].sort((a, b) => b.utilizationPct - a.utilizationPct)[0];
  if (hotSite && hotSite.utilizationPct >= 85) {
    const aiDriven = (hotSite.aiWorkloadPct ?? 0) >= 40;
    lines.push(`${hotSite.city} is approaching higher utilization${aiDriven ? ' due to increasing AI workloads' : ''}.`);
  }

  const maintenanceCount = facilities.filter(f => f.underMaintenance).length;
  if (maintenanceCount > 0) {
    lines.push(`${maintenanceCount} facilit${maintenanceCount > 1 ? 'ies have' : 'y has'} scheduled maintenance in ${label}.`);
  }

  lines.push(criticalIncidentCount > 0
    ? `${criticalIncidentCount} critical infrastructure incident${criticalIncidentCount > 1 ? 's are' : ' is'} currently active in ${label}.`
    : 'No critical infrastructure incidents are currently active.');

  return lines;
}

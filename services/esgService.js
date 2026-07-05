/** @typedef {import('../types/google').EsgMonthlyRecord} EsgMonthlyRecord */
import esg from '../data/google/esg.json';
import dataCenters from '../data/google/datacenters.json';

/** @returns {Promise<EsgMonthlyRecord[]>} */
export async function getEsgTrend(dataCenterId) {
  return esg.filter(e => e.dataCenterId === dataCenterId).sort((a, b) => a.month.localeCompare(b.month));
}

/** @returns {Promise<EsgMonthlyRecord | undefined>} */
export async function getEsgSnapshot(dataCenterId) {
  const trend = esg.filter(e => e.dataCenterId === dataCenterId);
  return trend.sort((a, b) => b.month.localeCompare(a.month))[0];
}

/** @returns {Promise<{ avgRenewablePct: number, avgPue: number, avgCarbonIntensity: number }>} */
export async function getPortfolioEsgSummary() {
  const dcs = dataCenters;
  const avgRenewablePct = Math.round(dcs.reduce((s, d) => s + d.esg.renewablePct, 0) / dcs.length);
  const avgPue = Math.round((dcs.reduce((s, d) => s + d.power.pue, 0) / dcs.length) * 100) / 100;
  const avgCarbonIntensity = Math.round((dcs.reduce((s, d) => s + d.esg.carbonIntensityKgPerMwh, 0) / dcs.length) * 10) / 10;
  return { avgRenewablePct, avgPue, avgCarbonIntensity };
}

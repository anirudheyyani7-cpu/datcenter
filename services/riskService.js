/** @typedef {import('../types/google').RiskRecord} RiskRecord */
import risks from '../data/google/risks.json';

/** @returns {Promise<RiskRecord[]>} */
export async function getRisksByDataCenter(dataCenterId) {
  return risks.filter(r => r.dataCenterId === dataCenterId);
}

/** @returns {Promise<RiskRecord[]>} */
export async function getRisksByCategory(category) {
  return risks.filter(r => r.category === category);
}

/** @returns {Promise<{ category: string, high: number, medium: number, low: number }[]>} */
export async function getPortfolioRiskSummary() {
  const byCategory = new Map();
  for (const r of risks) {
    if (!byCategory.has(r.category)) byCategory.set(r.category, { category: r.category, high: 0, medium: 0, low: 0 });
    byCategory.get(r.category)[r.level.toLowerCase()]++;
  }
  return Array.from(byCategory.values());
}

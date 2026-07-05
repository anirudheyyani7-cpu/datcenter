/** @typedef {import('../types/google').AIInsight} AIInsight */
import aiInsights from '../data/google/aiInsights.json';

/** @returns {Promise<AIInsight | undefined>} */
export async function getInsightByDataCenter(dataCenterId) {
  return aiInsights.find(i => i.dataCenterId === dataCenterId);
}

/** @returns {Promise<AIInsight[]>} */
export async function getAllInsights() {
  return aiInsights;
}

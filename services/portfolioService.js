/** @typedef {import('../types/google').Portfolio} Portfolio */
import portfolio from '../data/google/portfolio.json';

/** @returns {Promise<Portfolio>} */
export async function getPortfolio() {
  return portfolio;
}

/** @returns {Promise<Portfolio['totals']>} */
export async function getPortfolioTotals() {
  return portfolio.totals;
}

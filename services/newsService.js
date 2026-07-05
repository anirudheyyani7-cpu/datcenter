/** @typedef {import('../types/google').NewsItem} NewsItem */
import news from '../data/google/news.json';

/** @returns {Promise<NewsItem[]>} */
export async function getNewsByDataCenter(dataCenterId) {
  return news.filter(n => n.dataCenterId === dataCenterId);
}

/** @returns {Promise<NewsItem[]>} */
export async function getNewsByCategory(category) {
  return news.filter(n => n.category === category);
}

/** @returns {Promise<NewsItem[]>} */
export async function getRecentNews(limit = 10) {
  return [...news].sort((a, b) => b.publishedDate.localeCompare(a.publishedDate)).slice(0, limit);
}

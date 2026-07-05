/** @typedef {import('../types/google').Campus} Campus */
import campuses from '../data/google/campuses.json';

/** @returns {Promise<Campus[]>} */
export async function getCampuses() {
  return campuses;
}

/** @returns {Promise<Campus | undefined>} */
export async function getCampusById(id) {
  return campuses.find(c => c.id === id);
}

/** @returns {Promise<Campus[]>} */
export async function getCampusesByCountry(countryId) {
  return campuses.filter(c => c.countryId === countryId);
}

/** @returns {Promise<Campus[]>} */
export async function getCampusesByRegion(regionId) {
  return campuses.filter(c => c.regionId === regionId);
}

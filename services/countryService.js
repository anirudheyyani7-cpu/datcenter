/** @typedef {import('../types/google').Country} Country */
import countries from '../data/google/countries.json';

/** @returns {Promise<Country[]>} */
export async function getCountries() {
  return countries;
}

/** @returns {Promise<Country | undefined>} */
export async function getCountryById(id) {
  return countries.find(c => c.id === id);
}

/** @returns {Promise<Country[]>} */
export async function getCountriesByRegion(regionId) {
  return countries.filter(c => c.regionId === regionId);
}

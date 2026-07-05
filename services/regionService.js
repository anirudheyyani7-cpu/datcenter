/** @typedef {import('../types/google').Region} Region */
import regions from '../data/google/regions.json';

/** @returns {Promise<Region[]>} */
export async function getRegions() {
  return regions;
}

/** @returns {Promise<Region | undefined>} */
export async function getRegionById(id) {
  return regions.find(r => r.id === id);
}

/** @returns {Promise<Region | undefined>} */
export async function getRegionByCode(code) {
  return regions.find(r => r.code === code);
}

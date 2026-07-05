/** @typedef {import('../types/google').WeatherProfile} WeatherProfile */
import weather from '../data/google/weather.json';

/** @returns {Promise<WeatherProfile | undefined>} */
export async function getWeatherByDataCenter(dataCenterId) {
  return weather.find(w => w.dataCenterId === dataCenterId);
}

/** @returns {Promise<WeatherProfile[]>} */
export async function getAllWeather() {
  return weather;
}

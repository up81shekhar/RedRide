const axios = require('axios');

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const OSRM_BASE      = 'https://router.project-osrm.org/route/v1/driving';

const headers = { 'User-Agent': 'RedRide/1.0 (contact@redride.app)' };

/**
 * Geocode an address → { lat, lng }
 */
module.exports.getAddressCoordinate = async (address) => {
  const res = await axios.get(`${NOMINATIM_BASE}/search`, {
    params: { q: address, format: 'json', limit: 1, countrycodes: 'in', 'accept-language': 'en' },
    headers,
    timeout: 5000,
  });

  // Retry without country restriction if no result
  let data = res.data;
  if (!data.length) {
    const fallback = await axios.get(`${NOMINATIM_BASE}/search`, {
      params: { q: address, format: 'json', limit: 1 },
      headers,
      timeout: 5000,
    });
    data = fallback.data;
  }

  if (!data.length) throw new Error(`Address not found: ${address}`);
  const { lat, lon } = data[0];
  return { lat: parseFloat(lat), lng: parseFloat(lon) };
};

/**
 * Get distance (km) and duration (min) between two coords using OSRM
 */
module.exports.getDistanceTime = async (origin, destination) => {
  const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const res = await axios.get(`${OSRM_BASE}/${coords}`, {
    params: { overview: 'false' },
    timeout: 8000,
  });
  if (res.data.code !== 'Ok') throw new Error('Unable to calculate route');
  const route = res.data.routes[0];
  return {
    distance: { value: route.distance, text: `${(route.distance / 1000).toFixed(1)} km` },
    duration: { value: route.duration, text: `${Math.ceil(route.duration / 60)} mins` },
  };
};

/**
 * Autocomplete suggestions from Nominatim
 */
module.exports.getAutoCompleteSuggestions = async (input) => {
  const res = await axios.get(`${NOMINATIM_BASE}/search`, {
    params: {
      q: input,
      format: 'json',
      limit: 8,
      addressdetails: 1,
      countrycodes: 'in',          // Prioritize India results
      'accept-language': 'en',
      dedupe: 1,
    },
    headers,
    timeout: 5000,
  });

  // If country-restricted returns nothing, retry without restriction
  let data = res.data;
  if (!data.length) {
    const fallback = await axios.get(`${NOMINATIM_BASE}/search`, {
      params: { q: input, format: 'json', limit: 8, addressdetails: 1, 'accept-language': 'en' },
      headers,
      timeout: 5000,
    });
    data = fallback.data;
  }

  return data.map((r) => ({
    description: r.display_name,
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
  }));
};

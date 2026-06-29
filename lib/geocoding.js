import axios from 'axios';

/**
 * Geocoding utility using Geoapify API
 * @param {string} address - The address to geocode
 * @returns {Promise<{lat: number, lng: number, formatted: string}>}
 */
const geocodeAddress = async (address) => {
  const apiKey = process.env.GEOAPIFY_API_KEY?.trim();
  
  if (!apiKey) {
    throw new Error('GEOAPIFY_API_KEY is not defined in environment variables');
  }

  const config = {
    method: 'get',
    url: `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&filter=countrycode:vn&apiKey=${apiKey}`,
    headers: { }
  };

  try {
    const response = await axios(config);
    if (response.data && response.data.features && response.data.features.length > 0) {
      const feature = response.data.features[0];
      return {
        lat: feature.properties.lat,
        lng: feature.properties.lon,
        formatted: feature.properties.formatted
      };
    }
    throw new Error('No results found for address');
  } catch (error) {
    console.error('Geocoding error:', error.response ? error.response.data : error.message);
    throw error;
  }
};

/**
 * Get distance and time matrix between locations using Geoapify
 * @param {Array<{lat: number, lng: number}>} locations 
 * @returns {Promise<Object>}
 */
const getRouteMatrix = async (locations) => {
  const apiKey = process.env.GEOAPIFY_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEOAPIFY_API_KEY is not defined in environment variables');
  }

  const BATCH_SIZE = 20; // Ensure sources * targets <= 1000 limit
  const numLocations = locations.length;
  const matrix = Array.from({ length: numLocations }, () => Array(numLocations).fill(null));

  for (let i = 0; i < numLocations; i += BATCH_SIZE) {
    for (let j = 0; j < numLocations; j += BATCH_SIZE) {
      const sourceBatch = locations.slice(i, i + BATCH_SIZE);
      const targetBatch = locations.slice(j, j + BATCH_SIZE);

      const config = {
        method: 'post',
        url: `https://api.geoapify.com/v1/routematrix?apiKey=${apiKey}`,
        data: {
          mode: 'drive',
          sources: sourceBatch.map(loc => ({ location: [loc.lng, loc.lat] })),
          targets: targetBatch.map(loc => ({ location: [loc.lng, loc.lat] }))
        }
      };

      const response = await axios(config);
      
      // Fill the matrix
      for (let s = 0; s < sourceBatch.length; s++) {
        for (let t = 0; t < targetBatch.length; t++) {
            const data = response.data.sources_to_targets[s][t];
            matrix[i + s][j + t] = data;
        }
      }
    }
  }

  return { sources_to_targets: matrix };
};

export { geocodeAddress, getRouteMatrix };

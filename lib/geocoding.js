import axios from 'axios';

/**
 * Geocoding utility using Geoapify API
 * @param {string} address - The address to geocode
 * @returns {Promise<{lat: number, lng: number, formatted: string}>}
 */
const geocodeAddress = async (address) => {
  const apiKey = process.env.GEOAPIFY_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEOAPIFY_API_KEY is not defined in environment variables');
  }

  const config = {
    method: 'get',
    url: `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&apiKey=${apiKey}`,
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

  const sources = locations.map(loc => ({ location: [loc.lng, loc.lat] }));
  
  const config = {
    method: 'post',
    url: `https://api.geoapify.com/v1/routematrix?apiKey=${apiKey}`,
    data: {
      mode: 'drive',
      sources: sources,
      targets: sources
    }
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('Route Matrix error:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export { geocodeAddress, getRouteMatrix };

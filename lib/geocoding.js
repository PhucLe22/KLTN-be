import axios from 'axios';

/**
 * Geocoding utility using Geoapify API
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
    return response.data;
  } catch (error) {
    console.error('Geocoding error:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export { geocodeAddress };

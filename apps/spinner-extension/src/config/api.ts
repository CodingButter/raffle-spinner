/**
 * API Configuration for the extension
 */

// Determine the API URL based on environment
const getApiUrl = () => {
  // Check if we have a specific API URL configured
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // In development, use localhost
  if (import.meta.env.DEV) {
    return 'http://localhost:3000/api';
  }

  // In production, use the website API
  return 'https://www.drawday.app/api';
};

export const API_CONFIG = {
  DIRECTUS_URL: getApiUrl(),
} as const;

export default API_CONFIG;

/**
 * API Configuration for the extension
 */

// Use the production backend by default since Chrome extensions don't have NODE_ENV
export const API_CONFIG = {
  DIRECTUS_URL: import.meta.env.VITE_DIRECTUS_URL || 'https://admin.drawday.app',
} as const;

export default API_CONFIG;

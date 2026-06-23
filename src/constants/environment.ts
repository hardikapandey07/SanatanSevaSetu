// Environment Configuration
// Change this URL to switch between development, staging, and production environments

export const ENV_CONFIG = {
  // Development/Testing API
  API_BASE_URL: "http://api.sanatansevasetu.com",

  // Alternative configurations (uncomment to use):
  // STAGING_API_BASE_URL: 'https://staging-api.sanatansevasetu.com',
  // PRODUCTION_API_BASE_URL: 'https://api.sanatansevasetu.com',

  // API Settings
  REQUEST_TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,

  // Debug Settings
  DEBUG_API: __DEV__, // Enable API logging in development
};

// Easy way to switch environments
export const getApiBaseUrl = () => {
  return ENV_CONFIG.API_BASE_URL;
};

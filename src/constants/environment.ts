// Environment Configuration
// Change this URL to switch between development, staging, and production environments

export const ENV_CONFIG = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.sanatansevasetu.com',
  GOOGLE_TRANSLATE_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_KEY ?? 'AIzaSyCGGAc203aDREpebiy1g6MdhhqJlcQAvCo',
  RAZORPAY_KEY_ID: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID ?? 'rzp_live_TIpVRknVg3dRly', // rzp_test_TEuOhTL51QQPXO
  UPI_PAYEE_VPA: process.env.EXPO_PUBLIC_UPI_VPA ?? 'abhishri09@okicici',
  UPI_PAYEE_NAME: process.env.EXPO_PUBLIC_UPI_NAME ?? 'Sanatan Seva Setu',
  REQUEST_TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  DEBUG_API: __DEV__,
};

// Easy way to switch environments
export const getApiBaseUrl = () => {
  return ENV_CONFIG.API_BASE_URL;
};

// Public legal pages hosted on the marketing site
export const LEGAL_URLS = {
  PRIVACY_POLICY: 'https://sanatansevasetu.com/pages/privacy-policy.html',
  TERMS_AND_CONDITIONS: 'https://sanatansevasetu.com/pages/Terms.html',
};

export const PUSH_CONFIG = {
  BASE_URL: ENV_CONFIG.API_BASE_URL,
  API_KEY: 'fcm_QbIiZoLMvhroe3nMqr5qSsUc050qwiMtiKwb4yYuvxA',
};

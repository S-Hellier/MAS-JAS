/**
 * API Configuration
 * 
 * This file centralizes all API endpoint configuration.
 * 
 * IMPORTANT: Update REMOTE_BACKEND_URL with your deployed backend URL
 * 
 * The frontend connects to a REMOTE backend API server, not directly to Supabase.
 * Your backend API handles all Supabase connections.
 */

// ============================================
// CONFIGURE YOUR REMOTE BACKEND URL HERE
// ============================================
// Replace this with your actual deployed backend URL
// Examples:
//   - Vercel: https://your-app.vercel.app
//   - Railway: https://your-app.railway.app
//   - Render: https://your-app.onrender.com
//   - Custom domain: https://api.yourdomain.com
const REMOTE_BACKEND_URL = 'https://pantry-partner-cis0fylsv-scott-helliers-projects.vercel.app';

// ============================================
// OPTIONAL: Local development override
// ============================================
// Uncomment and set this if you want to test against local backend during development
// const LOCAL_BACKEND_URL = 'http://10.0.2.2:3001'; // Android emulator
// const LOCAL_BACKEND_URL = 'http://localhost:3001'; // iOS simulator
// const LOCAL_BACKEND_URL = 'http://192.168.1.100:3001'; // Physical device (use your computer's IP)

// Set to true to use local backend during development
const USE_LOCAL_IN_DEV = false;

const getBaseURL = () => {
  // Check for environment variable override (if using react-native-config)
  const envApiUrl = process.env.API_BASE_URL || process.env.REACT_APP_API_URL;
  
  if (envApiUrl) {
    return envApiUrl;
  }
  
  // Use local backend if enabled and in development
  if (USE_LOCAL_IN_DEV && __DEV__) {
    // Uncomment one of these based on your setup:
    // return LOCAL_BACKEND_URL || 'http://10.0.2.2:3001'; // Android emulator
    // return LOCAL_BACKEND_URL || 'http://localhost:3001'; // iOS simulator
    return 'http://10.0.2.2:3001'; // Default for Android emulator
  }
  
  // Always use remote backend (default)
  if (!REMOTE_BACKEND_URL || REMOTE_BACKEND_URL.includes('your-backend-url')) {
    console.warn(
      '⚠️  REMOTE_BACKEND_URL not configured! ' +
      'Update frontend/src/config/api.config.ts with your deployed backend URL'
    );
  }
  
  return REMOTE_BACKEND_URL;
};

export const API_CONFIG = {
  BASE_URL: getBaseURL(),
  API_V1: `${getBaseURL()}/api/v1`,
  HEALTH: `${getBaseURL()}/health`,
  PANTRY: `${getBaseURL()}/api/v1/pantry`,
  AUTH: `${getBaseURL()}/api/v1/auth`,
  RECIPES: `${getBaseURL()}/api/v1/recipes`,
  BARCODE: `${getBaseURL()}/api/v1/barcode`,
  NOTIFICATIONS: `${getBaseURL()}/api/v1/notifications`,
  ADMIN: `${getBaseURL()}/api/v1/admin`,
} as const;

// Log the API URL in development for debugging
// if (isDevelopment) {
//   console.log('🔗 API Base URL:', API_CONFIG.BASE_URL);
// }


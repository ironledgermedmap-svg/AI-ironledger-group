// API Configuration utilities
export const getGeminiApiKey = (): string | null => {
  // Try to get from window object (set in index.html)
  if (typeof window !== 'undefined' && window.GEMINI_API_KEY && window.GEMINI_API_KEY !== '__GEMINI_API_KEY__') {
    return window.GEMINI_API_KEY;
  }
  
  // Try to get from environment variable
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== '__GEMINI_API_KEY__') {
    return process.env.GEMINI_API_KEY;
  }
  
  // Fallback to hardcoded key for deployment
  return 'AlzaSyDMhAL-OCnDLzgdLA9kml9e8tJ4JCLmkNE';
};

export const isApiKeyConfigured = (): boolean => {
  const key = getGeminiApiKey();
  return key !== null && key.length > 0;
};

// For development/demo purposes - you would replace this with your actual API key
export const DEMO_MODE = !isApiKeyConfigured();

export const showApiKeyWarning = () => {
  console.warn('🔑 Gemini API key not configured. Using enhanced template generation instead.');
  console.info('To enable AI generation, set GEMINI_API_KEY in your environment or window object.');
};

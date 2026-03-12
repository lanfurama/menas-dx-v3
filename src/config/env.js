// Environment variables configuration
// Vite exposes env variables with VITE_ prefix

export const env = {
  // Zalo ZNS
  zalo: {
    oaId: import.meta.env.VITE_ZALO_OA_ID || '',
    appId: import.meta.env.VITE_ZALO_APP_ID || '',
    // Secret key và access token nên được handle qua backend
  },
  
  // AI
  ai: {
    defaultModel: import.meta.env.VITE_AI_DEFAULT_MODEL || 'claude',
    ollamaEndpoint: import.meta.env.VITE_AI_OLLAMA_ENDPOINT || 'http://localhost:11434',
    // API keys nên được handle qua backend
  },
  
  // App
  app: {
    env: import.meta.env.MODE || 'development',
    port: import.meta.env.VITE_PORT || 3006,
    apiUrl:
      import.meta.env.VITE_API_URL ||
      (typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:3000/api/v1'
        : '/api/v1'),
  },
};

// Helper để check nếu đang ở development
export const isDev = import.meta.env.DEV;
export const isProd = import.meta.env.PROD;

import { useState, useEffect } from 'react';
import { aiApi } from '../services/api.js';

export function useAiStatus() {
  const [aiOn, setAiOn] = useState(false);
  const [aiLoading, setAiLoading] = useState(true);

  const checkAiStatus = async () => {
    try {
      setAiLoading(true);
      const { config } = await aiApi.getConfig();
      // AI is considered "on" if there's a default config
      // If API key is masked (contains ***), it means there's a key saved
      // If API key exists and is not empty, AI is configured
      if (config) {
        // Check if API key exists (either masked or actual)
        const hasApiKey = config.api_key && config.api_key.length > 0;
        // For local model, check endpoint instead
        const isLocalConfigured = config.model_id === 'local' && config.api_endpoint;
        setAiOn(hasApiKey || isLocalConfigured);
      } else {
        setAiOn(false);
      }
    } catch (error) {
      console.error('Failed to check AI status:', error);
      setAiOn(false);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    checkAiStatus();
    // Check every 60 seconds
    const interval = setInterval(checkAiStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  return { aiOn, aiLoading, checkAiStatus };
}

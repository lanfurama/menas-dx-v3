import { useState, useEffect } from 'react';
import { AI_MODELS } from '../constants/index.js';
import { aiApi } from '../services/api.js';

export function useAiConfig() {
  const [aiConfigs, setAiConfigs] = useState([]);
  const [selectedModel, setSelectedModel] = useState('claude');
  const [apiKey, setApiKey] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [aiLoading, setAiLoading] = useState(true);
  const [aiSaving, setAiSaving] = useState(false);

  useEffect(() => {
    loadAiConfigs();
  }, []);

  // Reload config when selectedModel changes
  useEffect(() => {
    if (selectedModel && !aiLoading) {
      loadModelConfig(selectedModel);
    }
  }, [selectedModel]);

  const loadModelConfig = async (modelId) => {
    try {
      const { config } = await aiApi.getConfigByModel(modelId);
      if (config) {
        // Set masked API key to show user that key exists
        if (config.api_key && config.api_key.includes('***')) {
          setApiKey(config.api_key); // Show masked key
        } else {
          setApiKey(''); // No key saved
        }
        setApiEndpoint(config.api_endpoint || '');
      } else {
        setApiKey('');
        setApiEndpoint('');
      }
    } catch (err) {
      console.error('Failed to load model config:', err);
      setApiKey('');
      setApiEndpoint('');
    }
  };

  const loadAiConfigs = async () => {
    try {
      setAiLoading(true);
      const { configs } = await aiApi.getConfigs();
      setAiConfigs(configs);
      
      const defaultConfig = configs.find(c => c.is_default);
      if (defaultConfig) {
        setSelectedModel(defaultConfig.model_id);
        // Load config for default model
        await loadModelConfig(defaultConfig.model_id);
      }
    } catch (error) {
      console.error('Failed to load AI configs:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveAi = async () => {
    try {
      setAiSaving(true);
      const updates = {};
      
      // Only update api_key if user provided a new one (not masked)
      // If apiKey contains '***', it means it's masked, so don't update
      if (apiKey && !apiKey.includes('***')) {
        updates.api_key = apiKey;
      }
      // If apiKey is empty string, don't send it (keep existing)
      
      // Include api_endpoint if provided or if it's local model
      if (apiEndpoint || selectedModel === 'local') {
        updates.api_endpoint = apiEndpoint || 'http://localhost:11434';
      }
      
      // Set as default if selected model is different from current default
      const currentDefault = aiConfigs.find(c => c.is_default);
      if (!currentDefault || currentDefault.model_id !== selectedModel) {
        updates.is_default = true;
      }
      
      await aiApi.updateConfig(selectedModel, updates);
      await loadAiConfigs();
      
      // Reload config to get masked API key
      const { config } = await aiApi.getConfigByModel(selectedModel);
      if (config && config.api_key && config.api_key.includes('***')) {
        setApiKey(config.api_key); // Show masked key
      } else {
        setApiKey(''); // Clear if no key
      }
      
      if (selectedModel !== 'local') {
        setApiEndpoint(''); // Clear endpoint if not local
      }
      
      return true;
    } catch (error) {
      console.error('Error saving AI config:', error);
      throw error;
    } finally {
      setAiSaving(false);
    }
  };

  const currentModel = AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[0];

  return {
    aiConfigs,
    selectedModel,
    setSelectedModel,
    apiKey,
    setApiKey,
    apiEndpoint,
    setApiEndpoint,
    aiLoading,
    aiSaving,
    currentModel,
    handleSaveAi,
    loadAiConfigs
  };
}

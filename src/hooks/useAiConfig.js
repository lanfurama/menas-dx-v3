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

  const loadAiConfigs = async () => {
    try {
      setAiLoading(true);
      const { configs } = await aiApi.getConfigs();
      setAiConfigs(configs);
      
      const defaultConfig = configs.find(c => c.is_default);
      if (defaultConfig) {
        setSelectedModel(defaultConfig.model_id);
      }
      
      // Load API key for selected model
      const { config } = await aiApi.getConfig();
      if (config) {
        setApiEndpoint(config.api_endpoint || '');
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
      if (apiKey) updates.api_key = apiKey;
      if (apiEndpoint) updates.api_endpoint = apiEndpoint;
      if (selectedModel) {
        const currentDefault = aiConfigs.find(c => c.is_default);
        if (currentDefault?.model_id !== selectedModel) {
          updates.is_default = true;
        }
      }
      
      await aiApi.updateConfig(selectedModel, updates);
      await loadAiConfigs();
      setApiKey(''); // Clear after save
      return true;
    } catch (error) {
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

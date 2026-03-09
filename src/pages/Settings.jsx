import { useCallback } from 'react';
import { T, AI_MODELS } from '../constants/index.js';
import { useDbConfig } from '../hooks/useDbConfig.js';
import { useAiConfig } from '../hooks/useAiConfig.js';
import { DbConfig } from './settings/components/DbConfig.jsx';
import { AiConfig } from './settings/components/AiConfig.jsx';

export const Settings = ({ currentUser, addLog, onDbConnect, onAiConnect }) => {
  const {
    dbCfg,
    setDbCfg,
    dbOn,
    dbTest,
    dbError,
    dbLoading,
    handleTestDb,
    handleSaveDb: handleSaveDbHook
  } = useDbConfig();

  const {
    selectedModel,
    setSelectedModel,
    apiKey,
    setApiKey,
    apiEndpoint,
    setApiEndpoint,
    aiLoading,
    aiSaving,
    currentModel,
    handleSaveAi: handleSaveAiHook
  } = useAiConfig();

  const handleSaveDb = useCallback(async () => {
    await handleSaveDbHook(onDbConnect, addLog);
  }, [handleSaveDbHook, onDbConnect, addLog]);

  const handleSaveAi = useCallback(async () => {
    try {
      const result = await handleSaveAiHook();
      if (result) {
        const modelName = AI_MODELS.find(m => m.id === selectedModel)?.name || selectedModel;
        if (addLog) {
          addLog('save', 'settings', `Cập nhật AI config: ${modelName}`);
        }
        // Trigger AI status check
        if (onAiConnect) {
          onAiConnect();
        }
        // Use setTimeout to ensure alert shows after state updates
        setTimeout(() => {
          alert('Đã lưu cấu hình AI vào database');
        }, 100);
      }
    } catch (error) {
      console.error('Error saving AI config:', error);
      setTimeout(() => {
        alert('Lưu thất bại: ' + (error.message || 'Unknown error'));
      }, 100);
    }
  }, [handleSaveAiHook, addLog, selectedModel]);

  return (
    <div className="fu" style={{ maxWidth: 700 }}>
      <DbConfig
        dbCfg={dbCfg}
        setDbCfg={setDbCfg}
        dbOn={dbOn}
        dbTest={dbTest}
        dbError={dbError}
        dbLoading={dbLoading}
        handleTestDb={handleTestDb}
        handleSaveDb={handleSaveDb}
      />
      <AiConfig
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        apiKey={apiKey}
        setApiKey={setApiKey}
        apiEndpoint={apiEndpoint}
        setApiEndpoint={setApiEndpoint}
        aiLoading={aiLoading}
        aiSaving={aiSaving}
        currentModel={currentModel}
        handleSaveAi={handleSaveAi}
      />
    </div>
  );
};

import { useCallback } from 'react';
import { T } from '../constants/index.js';
import { useDbConfig } from '../hooks/useDbConfig.js';
import { useAiConfig } from '../hooks/useAiConfig.js';
import { DbConfig } from './settings/components/DbConfig.jsx';
import { AiConfig } from './settings/components/AiConfig.jsx';

export const Settings = ({ currentUser, addLog, onDbConnect }) => {
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
      await handleSaveAiHook();
      addLog('save', 'settings', `Cập nhật AI config: ${selectedModel}`);
      alert('Đã lưu cấu hình AI');
    } catch (error) {
      alert('Lưu thất bại: ' + (error.message || 'Unknown error'));
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

import { useState, useEffect } from 'react';
import { T, ic, AI_MODELS } from '../constants/index.js';
import { Icon } from '../components/Icon.jsx';
import { Dot } from '../components/Dot.jsx';
import { Section } from '../components/Section.jsx';
import { Toggle } from '../components/Toggle.jsx';
import { dbApi, aiApi } from '../services/api.js';

export const Settings = ({ currentUser, addLog, onDbConnect }) => {
  const [dbCfg, setDbCfg] = useState({ name: 'default', host: '', port: '5432', database: '', username: '', password: '', ssl: false });
  const [dbOn, setDbOn] = useState(false);
  const [dbTest, setDbTest] = useState(false);
  const [dbError, setDbError] = useState('');
  const [dbLoading, setDbLoading] = useState(true);
  
  const [aiConfigs, setAiConfigs] = useState([]);
  const [selectedModel, setSelectedModel] = useState('claude');
  const [apiKey, setApiKey] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [aiLoading, setAiLoading] = useState(true);
  const [aiSaving, setAiSaving] = useState(false);

  // Load DB config
  useEffect(() => {
    loadDbConfig();
  }, []);

  // Load AI configs
  useEffect(() => {
    loadAiConfigs();
  }, []);

  const loadDbConfig = async () => {
    try {
      setDbLoading(true);
      const { config } = await dbApi.getConfig();
      if (config) {
        setDbCfg({
          name: config.name || 'default',
          host: config.host || '',
          port: config.port || '5432',
          database: config.database || '',
          username: config.username || '',
          password: '', // Don't load password
          ssl: config.ssl || false,
        });
        setDbOn(config.is_active || false);
      }
    } catch (error) {
      console.error('Failed to load DB config:', error);
    } finally {
      setDbLoading(false);
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

  const downloadSQLFile = (filename, content) => {
    const blob = new Blob([content], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleTestDb = async () => {
    try {
      setDbTest(true);
      setDbError('');
      const response = await dbApi.testConnection({
        host: dbCfg.host,
        port: dbCfg.port,
        database: dbCfg.database,
        username: dbCfg.username,
        password: dbCfg.password,
        ssl: dbCfg.ssl,
      });
      
      if (response.success && response.schemas) {
        // Download 3 file SQL
        const tableNames = {
          'datamart_customer': 'datamart_customer.sql',
          'datamart_transaction': 'datamart_transaction.sql',
          'datamart_localtion': 'datamart_localtion.sql'
        };
        
        Object.entries(response.schemas).forEach(([tableName, sql]) => {
          const filename = tableNames[tableName] || `${tableName}.sql`;
          downloadSQLFile(filename, sql);
        });
        
        setDbError('');
        alert('Kết nối thành công! Đã tải xuống 3 file SQL cấu trúc bảng.');
      } else {
        setDbError('');
      }
    } catch (error) {
      setDbError(error.message || 'Kết nối thất bại');
    } finally {
      setDbTest(false);
    }
  };

  const handleSaveDb = async () => {
    try {
      setDbLoading(true);
      setDbError('');
      await dbApi.saveConfig(dbCfg);
      setDbOn(true);
      onDbConnect?.();
      addLog('save', 'settings', 'Lưu cấu hình database');
      alert('Đã lưu cấu hình database');
    } catch (error) {
      setDbError(error.message || 'Lưu thất bại');
    } finally {
      setDbLoading(false);
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
      addLog('save', 'settings', `Cập nhật AI config: ${selectedModel}`);
      alert('Đã lưu cấu hình AI');
      setApiKey(''); // Clear after save
    } catch (error) {
      alert('Lưu thất bại: ' + (error.message || 'Unknown error'));
    } finally {
      setAiSaving(false);
    }
  };

  const currentModel = AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[0];

  return (
    <div className="fu" style={{ maxWidth: 700 }}>
      {/* Database Config */}
      <div className="card" style={{ marginBottom: 14 }}>
        <Section icon={ic.db} title="PostgreSQL Configuration">
          <Dot on={dbOn} />
        </Section>
        
        {dbLoading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: T.textSec }}>
            <div className="spin" style={{ margin: '0 auto 10px' }} />
            Đang tải...
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8, marginBottom: 8 }}>
              <div>
                <span className="label-sm">HOST</span>
                <input
                  className="inp"
                  value={dbCfg.host}
                  onChange={e => setDbCfg(p => ({ ...p, host: e.target.value }))}
                  placeholder="localhost"
                />
              </div>
              <div>
                <span className="label-sm">PORT</span>
                <input
                  className="inp"
                  value={dbCfg.port}
                  onChange={e => setDbCfg(p => ({ ...p, port: e.target.value }))}
                  placeholder="5432"
                />
              </div>
            </div>
            
            <div style={{ marginBottom: 8 }}>
              <span className="label-sm">DATABASE</span>
              <input
                className="inp"
                value={dbCfg.database}
                onChange={e => setDbCfg(p => ({ ...p, database: e.target.value }))}
                placeholder="menas_dx_config"
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <div>
                <span className="label-sm">USER</span>
                <input
                  className="inp"
                  value={dbCfg.username}
                  onChange={e => setDbCfg(p => ({ ...p, username: e.target.value }))}
                  placeholder="postgres"
                />
              </div>
              <div>
                <span className="label-sm">PASSWORD</span>
                <input
                  className="inp"
                  type="password"
                  value={dbCfg.password}
                  onChange={e => setDbCfg(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Toggle on={dbCfg.ssl} onClick={() => setDbCfg(p => ({ ...p, ssl: !p.ssl }))} />
              <span style={{ fontSize: 12, color: T.textSec }}>SSL</span>
            </div>
            
            {dbError && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: T.danger + '18', color: T.danger, fontSize: 12, marginBottom: 12 }}>
                {dbError}
              </div>
            )}
            
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-p"
                onClick={handleSaveDb}
                disabled={dbLoading || !dbCfg.host || !dbCfg.database}
              >
                <Icon d={ic.check} s={13} /> Lưu cấu hình
              </button>
              <button
                className="btn btn-g"
                onClick={handleTestDb}
                disabled={dbTest || !dbCfg.host || !dbCfg.database}
              >
                {dbTest ? (
                  <>
                    <div className="spin" style={{ width: 14, height: 14 }} /> Testing...
                  </>
                ) : (
                  <>
                    <Icon d={ic.play} s={13} /> Test kết nối
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* AI Config */}
      <div className="card" style={{ marginBottom: 14, border: `1px solid ${T.purple}30` }}>
        <Section icon={ic.brain} title="AI Model Configuration" />
        
        {aiLoading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: T.textSec }}>
            <div className="spin" style={{ margin: '0 auto 10px' }} />
            Đang tải...
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 8 }}>
              <span className="label-sm">Default Model</span>
              <select
                className="inp"
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
              >
                {AI_MODELS.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            
            <div style={{ marginBottom: 8 }}>
              <span className="label-sm">API Key ({currentModel.provider})</span>
              <input
                className="inp"
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
              />
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>
                Để trống nếu không muốn thay đổi API key hiện tại
              </div>
            </div>
            
            {selectedModel === 'local' && (
              <div style={{ marginBottom: 8 }}>
                <span className="label-sm">Ollama Endpoint</span>
                <input
                  className="inp"
                  value={apiEndpoint}
                  onChange={e => setApiEndpoint(e.target.value)}
                  placeholder="http://localhost:11434"
                />
              </div>
            )}
            
            <div style={{ fontSize: 11, color: T.textSec, lineHeight: 1.5, marginBottom: 12 }}>
              Default: Claude (Anthropic). Hỗ trợ: OpenAI GPT-4o, Google Gemini, Local LLM (Ollama). 
              AI Chat sẽ sử dụng model được chọn.
            </div>
            
            <button
              className="btn btn-p"
              onClick={handleSaveAi}
              disabled={aiSaving}
            >
              {aiSaving ? (
                <>
                  <div className="spin" style={{ width: 14, height: 14 }} /> Đang lưu...
                </>
              ) : (
                <>
                  <Icon d={ic.check} s={13} /> Lưu cấu hình AI
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

import { memo } from 'react';
import { T, ic, AI_MODELS } from '../../../constants/index.js';
import { Icon } from '../../../components/Icon.jsx';
import { Section } from '../../../components/Section.jsx';

export const AiConfig = memo(({ 
  selectedModel, 
  setSelectedModel, 
  apiKey, 
  setApiKey, 
  apiEndpoint, 
  setApiEndpoint, 
  aiLoading, 
  aiSaving, 
  currentModel, 
  handleSaveAi 
}) => {
  return (
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
  );
});

AiConfig.displayName = 'AiConfig';

import { T } from './theme.js';

export const AI_MODELS = [
  { id: "claude", name: "Claude (Anthropic)", model: "claude-sonnet-4-20250514", provider: "anthropic", default: true, color: T.purple },
  { id: "gpt4", name: "GPT-4o (OpenAI)", model: "gpt-4o", provider: "openai", default: false, color: T.success },
  { id: "gemini", name: "Gemini Flash (Google)", model: "gemini-flash-latest", provider: "google", default: false, color: T.info },
  { id: "local", name: "Local LLM (Ollama)", model: "llama3", provider: "ollama", default: false, color: T.warning },
];

export const PRED_PERIODS = [
  { id: "1m", label: "1 tháng", m: 1 },
  { id: "3m", label: "Quý (3T)", m: 3 },
  { id: "6m", label: "6 tháng", m: 6 },
  { id: "12m", label: "12 tháng", m: 12 },
];

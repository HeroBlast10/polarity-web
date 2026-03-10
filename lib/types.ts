// Polarity Web Types

export type Persona = 'advocatus' | 'inquisitor';

export type DuelMode = 'court' | 'troll-fight' | 'praise-battle';

export interface PersonaPack {
  name: string;
  display_name: string;
  stance: 'support' | 'oppose';
  description: string;
  version: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  persona?: Persona;
  timestamp: number;
}

export interface DuelRound {
  round: number;
  advocatus: string;
  inquisitor: string;
}

export interface Settings {
  apiKey: string;
  provider: 'openai' | 'ollama' | 'litellm';
  model: string;
  baseUrl: string;
}

export interface ChatRequest {
  message: string;
  history: { role: string; content: string }[];
  pack: Persona;
  provider: string;
  model: string;
  base_url: string | null;
  api_key: string | null;
}

export interface ChatResponse {
  content: string;
  pack: string;
  stance: string;
  model: string;
}

export const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  provider: 'openai',
  model: 'gpt-4o-mini',
  baseUrl: '',
};

export const PROVIDER_MODELS: Record<string, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  ollama: ['llama3', 'llama3.1', 'mistral', 'codellama', 'phi3'],
  litellm: ['gpt-4o', 'claude-3-opus', 'gemini-pro', 'mistral-large'],
};

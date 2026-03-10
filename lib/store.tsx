'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Settings, ChatMessage, DEFAULT_SETTINGS, Persona, DuelState } from './types';

interface AppState {
  settings: Settings;
  messages: ChatMessage[];
  currentPersona: Persona;
  isLoading: boolean;
  duelState: DuelState;
}

type Action =
  | { type: 'SET_SETTINGS'; payload: Settings }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'SET_PERSONA'; payload: Persona }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'UPDATE_LAST_MESSAGE'; payload: string }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DUEL_STATE'; payload: DuelState }
  | { type: 'UPDATE_DUEL_STATE'; payload: Partial<DuelState> }
  | { type: 'CLEAR_DUEL_STATE' };

const initialState: AppState = {
  settings: DEFAULT_SETTINGS,
  messages: [],
  currentPersona: 'advocatus',
  isLoading: false,
  duelState: {
    round: 0,
    topic: '',
    mode: 'court',
    rounds: 3,
    advocatusText: '',
    inquisitorText: '',
    isThinking: null,
    history: [],
    started: false,
  },
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'SET_PERSONA':
      return { ...state, currentPersona: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'UPDATE_LAST_MESSAGE':
      if (state.messages.length === 0) return state;
      const lastMsg = state.messages[state.messages.length - 1];
      if (lastMsg.role !== 'assistant') return state;
      return {
        ...state,
        messages: [
          ...state.messages.slice(0, -1),
          { ...lastMsg, content: action.payload },
        ],
      };
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_DUEL_STATE':
      return { ...state, duelState: action.payload };
    case 'UPDATE_DUEL_STATE':
      return { ...state, duelState: { ...state.duelState, ...action.payload } };
    case 'CLEAR_DUEL_STATE':
      return {
        ...state,
        duelState: {
          round: 0,
          topic: '',
          mode: 'court',
          rounds: 3,
          advocatusText: '',
          inquisitorText: '',
          isThinking: null,
          history: [],
          started: false,
        },
      };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const SETTINGS_KEY = 'polarity_settings';
const CHAT_MESSAGES_KEY = 'polarity_chat_messages';
const CHAT_PERSONA_KEY = 'polarity_chat_persona';
const DUEL_STATE_KEY = 'polarity_duel_state';

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        dispatch({ type: 'SET_SETTINGS', payload: { ...DEFAULT_SETTINGS, ...settings } });
      } catch {
        // Ignore invalid JSON
      }
    }

    const savedMessages = localStorage.getItem(CHAT_MESSAGES_KEY);
    if (savedMessages) {
      try {
        const messages = JSON.parse(savedMessages);
        messages.forEach((msg: ChatMessage) => dispatch({ type: 'ADD_MESSAGE', payload: msg }));
      } catch {
        // Ignore invalid JSON
      }
    }

    const savedPersona = localStorage.getItem(CHAT_PERSONA_KEY);
    if (savedPersona && (savedPersona === 'advocatus' || savedPersona === 'inquisitor')) {
      dispatch({ type: 'SET_PERSONA', payload: savedPersona });
    }

    const savedDuelState = localStorage.getItem(DUEL_STATE_KEY);
    if (savedDuelState) {
      try {
        const duelState = JSON.parse(savedDuelState);
        dispatch({ type: 'SET_DUEL_STATE', payload: { ...initialState.duelState, ...duelState } });
      } catch {
        // Ignore invalid JSON
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
  }, [state.settings]);

  useEffect(() => {
    localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(state.messages));
  }, [state.messages]);

  useEffect(() => {
    localStorage.setItem(CHAT_PERSONA_KEY, state.currentPersona);
  }, [state.currentPersona]);

  useEffect(() => {
    localStorage.setItem(DUEL_STATE_KEY, JSON.stringify(state.duelState));
  }, [state.duelState]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export function useSettings() {
  const { state, dispatch } = useApp();
  return {
    settings: state.settings,
    updateSettings: (partial: Partial<Settings>) =>
      dispatch({ type: 'UPDATE_SETTINGS', payload: partial }),
  };
}

export function useChat() {
  const { state, dispatch } = useApp();
  return {
    messages: state.messages,
    currentPersona: state.currentPersona,
    isLoading: state.isLoading,
    setPersona: (persona: Persona) => dispatch({ type: 'SET_PERSONA', payload: persona }),
    addMessage: (message: ChatMessage) => dispatch({ type: 'ADD_MESSAGE', payload: message }),
    updateLastMessage: (content: string) => dispatch({ type: 'UPDATE_LAST_MESSAGE', payload: content }),
    clearMessages: () => dispatch({ type: 'CLEAR_MESSAGES' }),
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
  };
}

export function useDuel() {
  const { state, dispatch } = useApp();
  return {
    duelState: state.duelState,
    setDuelState: (duelState: typeof state.duelState) => dispatch({ type: 'SET_DUEL_STATE', payload: duelState }),
    updateDuelState: (partial: Partial<typeof state.duelState>) => dispatch({ type: 'UPDATE_DUEL_STATE', payload: partial }),
    clearDuelState: () => dispatch({ type: 'CLEAR_DUEL_STATE' }),
  };
}

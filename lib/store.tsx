'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Settings, ChatMessage, DEFAULT_SETTINGS, Persona } from './types';

interface AppState {
  settings: Settings;
  messages: ChatMessage[];
  currentPersona: Persona;
  isLoading: boolean;
}

type Action =
  | { type: 'SET_SETTINGS'; payload: Settings }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'SET_PERSONA'; payload: Persona }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'UPDATE_LAST_MESSAGE'; payload: string }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AppState = {
  settings: DEFAULT_SETTINGS,
  messages: [],
  currentPersona: 'advocatus',
  isLoading: false,
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
  }, []);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
  }, [state.settings]);

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

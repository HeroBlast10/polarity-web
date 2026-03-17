export const LIVE_DEMO_LIMIT = 5;

const LIVE_DEMO_KEY = 'polarity_live_demo';

export interface LiveDemoSession {
  active: boolean;
  messagesUsed: number;
  limit: number;
}

const DEFAULT_SESSION: LiveDemoSession = {
  active: false,
  messagesUsed: 0,
  limit: LIVE_DEMO_LIMIT,
};

export function getLiveDemoSession(): LiveDemoSession {
  if (typeof window === 'undefined') {
    return DEFAULT_SESSION;
  }

  const saved = localStorage.getItem(LIVE_DEMO_KEY);
  if (!saved) {
    return DEFAULT_SESSION;
  }

  try {
    const parsed = JSON.parse(saved) as Partial<LiveDemoSession>;
    return {
      active: Boolean(parsed.active),
      messagesUsed: Number.isFinite(parsed.messagesUsed) ? Math.max(0, Number(parsed.messagesUsed)) : 0,
      limit: Number.isFinite(parsed.limit) ? Math.max(1, Number(parsed.limit)) : LIVE_DEMO_LIMIT,
    };
  } catch {
    return DEFAULT_SESSION;
  }
}

export function saveLiveDemoSession(session: LiveDemoSession): LiveDemoSession {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LIVE_DEMO_KEY, JSON.stringify(session));
  }
  return session;
}

export function startLiveDemoSession(): LiveDemoSession {
  const existing = getLiveDemoSession();
  if (existing.active || existing.messagesUsed > 0) {
    return saveLiveDemoSession({ ...existing, active: true });
  }

  return saveLiveDemoSession({
    active: true,
    messagesUsed: 0,
    limit: LIVE_DEMO_LIMIT,
  });
}

export function incrementLiveDemoUsage(): LiveDemoSession {
  const current = getLiveDemoSession();
  return saveLiveDemoSession({
    ...current,
    active: true,
    messagesUsed: Math.min(current.limit, current.messagesUsed + 1),
  });
}

export function clearLiveDemoSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LIVE_DEMO_KEY);
  }
}

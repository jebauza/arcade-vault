'use client';

import { createContext, useContext, useSyncExternalStore } from 'react';

export type StoredUser = { name: string } | null;

type SessionContextValue = {
  user: StoredUser;
  login: (user: StoredUser) => void;
  logout: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

const listeners = new Set<() => void>();

function readUser(): StoredUser {
  try {
    return JSON.parse(localStorage.getItem('av_user') || 'null');
  } catch {
    return null;
  }
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

function notify() {
  for (const listener of listeners) listener();
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const user = useSyncExternalStore(subscribe, readUser, () => null);

  const login = (u: StoredUser) => {
    try {
      localStorage.setItem('av_user', JSON.stringify(u));
    } catch {}
    notify();
  };

  const logout = () => {
    try {
      localStorage.removeItem('av_user');
    } catch {}
    notify();
  };

  return (
    <SessionContext.Provider value={{ user, login, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
}

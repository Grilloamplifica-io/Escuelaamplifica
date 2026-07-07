import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { USERS } from '../data/mockData';
import type { Usuario } from '../types';

type Device = 'desktop' | 'mobile';

interface AppContextValue {
  currentUserId: string;
  setCurrentUserId: (id: string) => void;
  me: Usuario;
  device: Device;
  toggleDevice: () => void;
  simMode: boolean;
  toggleSimMode: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState('u1');
  const [device, setDevice] = useState<Device>('desktop');
  const [simMode, setSimMode] = useState(false);

  const value = useMemo<AppContextValue>(() => ({
    currentUserId,
    setCurrentUserId,
    me: USERS[currentUserId],
    device,
    toggleDevice: () => setDevice((d) => (d === 'mobile' ? 'desktop' : 'mobile')),
    simMode,
    toggleSimMode: () => setSimMode((s) => !s),
  }), [currentUserId, device, simMode]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>');
  return ctx;
}

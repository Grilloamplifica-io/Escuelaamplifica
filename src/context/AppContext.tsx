import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { CURSOS, USERS } from '../data/mockData';
import type { NuevoUsuarioInput, Usuario } from '../types';

type Device = 'desktop' | 'mobile';

interface AppContextValue {
  currentUserId: string;
  setCurrentUserId: (id: string) => void;
  me: Usuario;
  users: Record<string, Usuario>;
  addUser: (input: NuevoUsuarioInput) => Usuario;
  device: Device;
  toggleDevice: () => void;
  simMode: boolean;
  toggleSimMode: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

let nextUserSeq = 1;

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<Record<string, Usuario>>(USERS);
  const [currentUserId, setCurrentUserId] = useState('u1');
  const [device, setDevice] = useState<Device>('desktop');
  const [simMode, setSimMode] = useState(false);

  const value = useMemo<AppContextValue>(() => ({
    currentUserId,
    setCurrentUserId,
    me: users[currentUserId],
    users,
    addUser: (input) => {
      const id = `nuevo-${nextUserSeq++}`;
      // Simula el motor de reglas: onboarding obligatorio + cursos de su Escuela, ambos "pendiente".
      const cursosEscuela = CURSOS.filter((c) => c.escuela === input.escuela).map((c) => c.id);
      const asign: Usuario['asign'] = { c1: 'pendiente' };
      cursosEscuela.forEach((cid) => {
        if (cid !== 'c1') asign[cid] = 'pendiente';
      });
      const nuevo: Usuario = {
        id,
        nombre: input.nombre,
        cargo: input.cargo,
        rol: input.rol,
        contexto: input.contexto,
        escuela: input.escuela,
        color: input.color,
        asign,
        progreso: {},
        cert: [],
      };
      setUsers((prev) => ({ ...prev, [id]: nuevo }));
      return nuevo;
    },
    device,
    toggleDevice: () => setDevice((d) => (d === 'mobile' ? 'desktop' : 'mobile')),
    simMode,
    toggleSimMode: () => setSimMode((s) => !s),
  }), [currentUserId, users, device, simMode]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>');
  return ctx;
}

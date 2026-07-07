import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { CURSOS, USERS } from '../data/mockData';
import type { Curso, NuevoCursoInput, NuevoUsuarioInput, QuizPregunta, Usuario } from '../types';
import { claveInicialDeRut, mismoRut, soloDigitosRut } from '../utils/rut';

type Device = 'desktop' | 'mobile';

interface AppContextValue {
  currentUserId: string | null;
  me: Usuario | null;
  isAuthenticated: boolean;
  login: (rut: string, clave: string) => Usuario | null;
  logout: () => void;
  setCurrentUserId: (id: string) => void;
  users: Record<string, Usuario>;
  addUser: (input: NuevoUsuarioInput) => Usuario;
  cursos: Curso[];
  addCurso: (input: NuevoCursoInput) => Curso;
  editarCurso: (id: string, cambios: NuevoCursoInput) => void;
  addPreguntaACurso: (cursoId: string, pregunta: QuizPregunta) => void;
  device: Device;
  toggleDevice: () => void;
  simMode: boolean;
  toggleSimMode: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

let nextUserSeq = 1;
let nextCursoSeq = 1;

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<Record<string, Usuario>>(USERS);
  const [cursos, setCursos] = useState<Curso[]>(CURSOS);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [device, setDevice] = useState<Device>('desktop');
  const [simMode, setSimMode] = useState(false);

  const value = useMemo<AppContextValue>(() => ({
    currentUserId,
    me: currentUserId ? users[currentUserId] : null,
    isAuthenticated: currentUserId !== null,
    login: (rut, clave) => {
      const encontrado = Object.values(users).find((u) => mismoRut(u.rut, rut));
      if (!encontrado) return null;
      if (claveInicialDeRut(encontrado.rut) !== soloDigitosRut(clave)) return null;
      setCurrentUserId(encontrado.id);
      return encontrado;
    },
    logout: () => setCurrentUserId(null),
    setCurrentUserId,
    users,
    addUser: (input) => {
      const id = `nuevo-${nextUserSeq++}`;
      // Simula el motor de reglas: onboarding obligatorio + cursos de su Escuela, ambos "pendiente".
      const cursosEscuela = cursos.filter((c) => c.escuela === input.escuela).map((c) => c.id);
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
        rut: input.rut,
        asign,
        progreso: {},
        cert: [],
      };
      setUsers((prev) => ({ ...prev, [id]: nuevo }));
      return nuevo;
    },
    cursos,
    addCurso: (input) => {
      const id = `nuevo-curso-${nextCursoSeq++}`;
      const nuevo: Curso = { id, ...input };
      setCursos((prev) => [...prev, nuevo]);
      return nuevo;
    },
    editarCurso: (id, cambios) => {
      setCursos((prev) => prev.map((c) => (c.id === id ? { ...c, ...cambios } : c)));
    },
    addPreguntaACurso: (cursoId, pregunta) => {
      setCursos((prev) =>
        prev.map((c) => (c.id === cursoId ? { ...c, quiz: [...(c.quiz ?? []), pregunta] } : c)),
      );
    },
    device,
    toggleDevice: () => setDevice((d) => (d === 'mobile' ? 'desktop' : 'mobile')),
    simMode,
    toggleSimMode: () => setSimMode((s) => !s),
  }), [currentUserId, users, cursos, device, simMode]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>');
  return ctx;
}

export function useCurrentUser(): Usuario {
  const { me } = useApp();
  if (!me) throw new Error('No hay un usuario autenticado');
  return me;
}

export function useCurso(id: string): Curso {
  const { cursos } = useApp();
  const c = cursos.find((c) => c.id === id);
  if (!c) throw new Error(`Curso no encontrado: ${id}`);
  return c;
}

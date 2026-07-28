import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { CURSOS, REGLAS, USERS } from '../data/mockData';
import type { Certificado, CertificadoExterno, Curso, NuevaReglaInput, NuevoCertificadoExternoInput, NuevoCursoInput, NuevoUsuarioInput, QuizPregunta, Regla, Usuario } from '../types';
import { generarCodigoCertificado, formatearFechaCorta } from '../utils/certificado';
import { claveInicialDeRut, mismoRut, soloDigitosRut } from '../utils/rut';
import { clearState, loadState, saveState } from '../utils/storage';

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
  asignarCursoAUsuario: (userId: string, cursoId: string) => void;
  aprobarCurso: (userId: string, cursoId: string) => Certificado;
  addCertificadoExterno: (userId: string, input: NuevoCertificadoExternoInput) => CertificadoExterno;
  eliminarCertificadoExterno: (userId: string, certId: string) => void;
  reglas: Regla[];
  addRegla: (input: NuevaReglaInput) => Regla;
  cursos: Curso[];
  addCurso: (input: NuevoCursoInput) => Curso;
  editarCurso: (id: string, cambios: NuevoCursoInput) => void;
  eliminarCurso: (id: string) => void;
  addPreguntaACurso: (cursoId: string, pregunta: QuizPregunta) => void;
  device: Device;
  toggleDevice: () => void;
  simMode: boolean;
  toggleSimMode: () => void;
  resetDemo: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function nuevoId(): string {
  return crypto.randomUUID();
}

// Repara registros guardados en localStorage antes de que existiera algún campo
// (ej. certificadosExternos), para que el resto de la app pueda confiar en el tipo Usuario.
function normalizarUsuarios(users: Record<string, Usuario>): Record<string, Usuario> {
  return Object.fromEntries(
    Object.entries(users).map(([id, u]) => {
      const crudo = u as Partial<Usuario>;
      return [id, { certificadosExternos: [], ...crudo } as Usuario];
    }),
  );
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<Record<string, Usuario>>(() => normalizarUsuarios(loadState('users', USERS)));
  const [cursos, setCursos] = useState<Curso[]>(() => loadState('cursos', CURSOS));
  const [reglas, setReglas] = useState<Regla[]>(() => loadState('reglas', REGLAS));
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => loadState('currentUserId', null));
  const [device, setDevice] = useState<Device>('desktop');
  const [simMode, setSimMode] = useState(false);

  useEffect(() => saveState('users', users), [users]);
  useEffect(() => saveState('cursos', cursos), [cursos]);
  useEffect(() => saveState('reglas', reglas), [reglas]);
  useEffect(() => saveState('currentUserId', currentUserId), [currentUserId]);

  const value = useMemo<AppContextValue>(() => ({
    currentUserId,
    me: currentUserId ? users[currentUserId] ?? null : null,
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
      const id = nuevoId();
      // Motor de reglas: onboarding obligatorio + cursos de su Escuela base + cursos de las
      // Escuelas que el motor de reglas asigna según su rol, todos en "pendiente".
      const escuelasAAsignar = new Set([input.escuela]);
      reglas.filter((r) => r.rol === input.rol).forEach((r) => escuelasAAsignar.add(r.escuela));
      const asign: Usuario['asign'] = { c1: 'pendiente' };
      cursos
        .filter((c) => escuelasAAsignar.has(c.escuela))
        .forEach((c) => {
          if (c.id !== 'c1') asign[c.id] = 'pendiente';
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
        certificadosExternos: [],
      };
      setUsers((prev) => ({ ...prev, [id]: nuevo }));
      return nuevo;
    },
    asignarCursoAUsuario: (userId, cursoId) => {
      setUsers((prev) => {
        const u = prev[userId];
        if (!u || u.asign[cursoId]) return prev;
        return { ...prev, [userId]: { ...u, asign: { ...u.asign, [cursoId]: 'pendiente' } } };
      });
    },
    aprobarCurso: (userId, cursoId) => {
      const existente = users[userId]?.cert.find((c) => c.cursoId === cursoId);
      const certificado: Certificado = existente ?? {
        cursoId,
        codigo: generarCodigoCertificado(),
        fecha: formatearFechaCorta(new Date()),
      };
      setUsers((prev) => {
        const u = prev[userId];
        if (!u) return prev;
        const yaCertificado = u.cert.some((c) => c.cursoId === cursoId);
        return {
          ...prev,
          [userId]: {
            ...u,
            asign: { ...u.asign, [cursoId]: 'aprobado' },
            cert: yaCertificado ? u.cert : [...u.cert, certificado],
          },
        };
      });
      return certificado;
    },
    addCertificadoExterno: (userId, input) => {
      const nuevo: CertificadoExterno = { id: nuevoId(), ...input };
      setUsers((prev) => {
        const u = prev[userId];
        if (!u) return prev;
        return { ...prev, [userId]: { ...u, certificadosExternos: [...u.certificadosExternos, nuevo] } };
      });
      return nuevo;
    },
    eliminarCertificadoExterno: (userId, certId) => {
      setUsers((prev) => {
        const u = prev[userId];
        if (!u) return prev;
        return { ...prev, [userId]: { ...u, certificadosExternos: u.certificadosExternos.filter((c) => c.id !== certId) } };
      });
    },
    reglas,
    addRegla: (input) => {
      const nueva: Regla = { id: nuevoId(), ...input };
      setReglas((prev) => [...prev, nueva]);
      return nueva;
    },
    cursos,
    addCurso: (input) => {
      const id = nuevoId();
      const nuevo: Curso = { id, ...input };
      setCursos((prev) => [...prev, nuevo]);
      return nuevo;
    },
    editarCurso: (id, cambios) => {
      setCursos((prev) => prev.map((c) => (c.id === id ? { ...c, ...cambios } : c)));
    },
    eliminarCurso: (id) => {
      setCursos((prev) => prev.filter((c) => c.id !== id));
      // Limpia toda referencia al curso eliminado para no dejar datos huérfanos
      // que hagan fallar páginas que asumen que todo curso en `asign`/`cert` existe.
      setUsers((prev) =>
        Object.fromEntries(
          Object.entries(prev).map(([userId, u]) => {
            const { [id]: _asign, ...asign } = u.asign;
            const { [id]: _progreso, ...progreso } = u.progreso;
            return [
              userId,
              { ...u, asign, progreso, cert: u.cert.filter((c) => c.cursoId !== id) },
            ];
          }),
        ),
      );
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
    resetDemo: () => {
      clearState(['users', 'cursos', 'reglas', 'currentUserId']);
      setUsers(USERS);
      setCursos(CURSOS);
      setReglas(REGLAS);
      setCurrentUserId(null);
    },
  }), [currentUserId, users, cursos, reglas, device, simMode]);

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

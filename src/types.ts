export type ModuloTipo = 'video' | 'pdf' | 'checklist';

export interface Modulo {
  t: string;
  tipo: ModuloTipo;
  items?: string[];
}

export interface QuizPregunta {
  q: string;
  ops: string[];
  correcta: number;
  feedback: string;
}

export type CursoTipo = 'normativo' | 'interna';

export interface Curso {
  id: string;
  escuela: string;
  nombre: string;
  tipo: CursoTipo;
  duracion: string;
  nivel: string;
  modulos: Modulo[];
  quiz?: QuizPregunta[];
}

export interface Escuela {
  id: string;
  nombre: string;
  ini: string;
  color: string;
  owner: string;
}

export type EstadoAsignacion = 'aprobado' | 'pendiente' | 'desarrollo' | 'vencido';

export type Rol = 'colaborador' | 'lider' | 'people';

export interface Certificado {
  cursoId: string;
  codigo: string;
  fecha: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  cargo: string;
  rol: Rol;
  contexto: 'oficina' | 'bodega';
  escuela: string;
  color: string;
  rut: string;
  asign: Record<string, EstadoAsignacion>;
  progreso: Record<string, number>;
  cert: Certificado[];
}

export interface NuevoUsuarioInput {
  nombre: string;
  cargo: string;
  rol: Rol;
  contexto: 'oficina' | 'bodega';
  escuela: string;
  color: string;
  rut: string;
}

export interface NuevoCursoInput {
  escuela: string;
  nombre: string;
  tipo: CursoTipo;
  duracion: string;
  nivel: string;
  modulos: Modulo[];
}

export interface MiembroEquipo {
  nombre: string;
  cumplimiento: number;
  pendientes: number;
}

export interface Regla {
  id: string;
  rol: Rol;
  escuela: string;
}

export interface NuevaReglaInput {
  rol: Rol;
  escuela: string;
}

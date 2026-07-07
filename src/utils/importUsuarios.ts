import { ESCUELAS } from '../data/mockData';
import type { NuevoUsuarioInput, Rol } from '../types';

export const COLUMNAS_PLANTILLA = ['Nombre completo', 'Cargo', 'RUT', 'Rol', 'Contexto', 'Escuela base'];

export interface FilaImportada {
  fila: number;
  ok: boolean;
  input?: NuevoUsuarioInput;
  error?: string;
}

const ROL_ALIASES: Record<string, Rol> = {
  colaborador: 'colaborador',
  lider: 'lider',
  people: 'people',
};

const CONTEXTO_ALIASES: Record<string, 'oficina' | 'bodega'> = {
  oficina: 'oficina',
  bodega: 'bodega',
};

const DIACRITICOS = new RegExp('[\\u0300-\\u036f]', 'g');

function normalizar(valor: unknown): string {
  return String(valor ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICOS, '');
}

function buscarEscuela(valor: string) {
  const norm = normalizar(valor);
  return ESCUELAS.find((e) => normalizar(e.nombre) === norm || normalizar(e.id) === norm);
}

function celda(fila: Record<string, unknown>, ...claves: string[]): string {
  for (const clave of claves) {
    if (fila[clave] !== undefined && fila[clave] !== null && String(fila[clave]).trim() !== '') {
      return String(fila[clave]).trim();
    }
  }
  return '';
}

export async function leerUsuariosDesdeArchivo(file: File): Promise<FilaImportada[]> {
  const XLSX = await import('xlsx');
  const buffer = await file.arrayBuffer();
  const libro = XLSX.read(buffer, { type: 'array' });
  const hoja = libro.Sheets[libro.SheetNames[0]];
  const filas = XLSX.utils.sheet_to_json<Record<string, unknown>>(hoja, { defval: '' });

  const rutsVistos = new Set<string>();

  return filas.map((fila, idx) => {
    const numeroFila = idx + 2; // +1 por encabezado, +1 porque las filas de Excel parten en 1
    const nombre = celda(fila, 'Nombre completo', 'Nombre');
    const cargo = celda(fila, 'Cargo');
    const rut = celda(fila, 'RUT', 'Rut');
    const rolTexto = normalizar(celda(fila, 'Rol'));
    const contextoTexto = normalizar(celda(fila, 'Contexto'));
    const escuelaTexto = celda(fila, 'Escuela base', 'Escuela');

    if (!nombre || !cargo || !rut) {
      return { fila: numeroFila, ok: false, error: 'Faltan datos obligatorios (nombre, cargo o RUT).' };
    }
    if (rutsVistos.has(normalizar(rut))) {
      return { fila: numeroFila, ok: false, error: `RUT ${rut} repetido en el archivo.` };
    }
    const rol = ROL_ALIASES[rolTexto];
    if (!rol) {
      return { fila: numeroFila, ok: false, error: `Rol "${celda(fila, 'Rol')}" no reconocido (usa Colaborador, Líder o People).` };
    }
    const contexto = CONTEXTO_ALIASES[contextoTexto];
    if (!contexto) {
      return { fila: numeroFila, ok: false, error: `Contexto "${celda(fila, 'Contexto')}" no reconocido (usa Oficina o Bodega).` };
    }
    const escuelaEncontrada = buscarEscuela(escuelaTexto);
    if (!escuelaEncontrada) {
      return { fila: numeroFila, ok: false, error: `Escuela "${escuelaTexto}" no reconocida.` };
    }

    rutsVistos.add(normalizar(rut));
    return {
      fila: numeroFila,
      ok: true,
      input: { nombre, cargo, rut, rol, contexto, escuela: escuelaEncontrada.id, color: escuelaEncontrada.color },
    };
  });
}

export async function descargarPlantillaUsuarios(): Promise<void> {
  const XLSX = await import('xlsx');
  const ejemplo = ['Andrea Lagos', 'Ejecutiva de Ventas', '18.765.432-1', 'Colaborador', 'Oficina', 'Comercial'];
  const hoja = XLSX.utils.aoa_to_sheet([COLUMNAS_PLANTILLA, ejemplo]);
  hoja['!cols'] = COLUMNAS_PLANTILLA.map(() => ({ wch: 22 }));
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, 'Usuarios');
  XLSX.writeFile(libro, 'plantilla-usuarios-amplifica.xlsx');
}

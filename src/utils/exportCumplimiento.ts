import { escuela } from '../data/mockData';
import type { Curso, EstadoAsignacion, Usuario } from '../types';

export interface FilaCumplimientoExport {
  curso: Curso;
  asignados: number;
  aprobados: number;
  enDesarrollo: number;
  pendientes: number;
  vencidos: number;
  pctAprobado: number;
  usuariosPorEstado: Record<EstadoAsignacion, Usuario[]>;
}

const ETIQUETA_ESTADO: Record<EstadoAsignacion, string> = {
  aprobado: 'Aprobado',
  desarrollo: 'En desarrollo',
  pendiente: 'Pendiente',
  vencido: 'Vencido',
};

export async function exportarCumplimientoCursos(filas: FilaCumplimientoExport[]): Promise<void> {
  const XLSX = await import('xlsx');

  const resumen = filas.map((f) => ({
    Curso: f.curso.nombre,
    Escuela: escuela(f.curso.escuela).nombre,
    Habilitados: f.asignados,
    Aprobados: f.aprobados,
    'En desarrollo': f.enDesarrollo,
    Pendientes: f.pendientes,
    Vencidos: f.vencidos,
    '% Aprobado': f.pctAprobado,
  }));

  const detalle = filas.flatMap((f) =>
    (Object.keys(f.usuariosPorEstado) as EstadoAsignacion[]).flatMap((estado) =>
      f.usuariosPorEstado[estado].map((u) => ({
        Curso: f.curso.nombre,
        Escuela: escuela(f.curso.escuela).nombre,
        Colaborador: u.nombre,
        Cargo: u.cargo,
        RUT: u.rut,
        Estado: ETIQUETA_ESTADO[estado],
      })),
    ),
  );

  const hojaResumen = XLSX.utils.json_to_sheet(resumen);
  const hojaDetalle = XLSX.utils.json_to_sheet(detalle);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hojaResumen, 'Resumen por curso');
  XLSX.utils.book_append_sheet(libro, hojaDetalle, 'Detalle por persona');
  XLSX.writeFile(libro, 'cumplimiento-cursos-amplifica.xlsx');
}

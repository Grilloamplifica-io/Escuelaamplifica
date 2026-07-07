import { Link } from 'react-router-dom';
import type { Curso, EstadoAsignacion, Escuela, ModuloTipo, CursoTipo } from '../types';
import { escuela } from '../data/mockData';
import { useCurrentUser } from '../context/AppContext';

export function iconFor(tipo: ModuloTipo): string {
  return { video: '▶', pdf: '▤', checklist: '☑' }[tipo] || '▶';
}

export function Crest({ escuela: e, sm }: { escuela: Escuela; sm?: boolean }) {
  return (
    <div className={`crest${sm ? ' sm' : ''}`} style={{ background: e.color }}>
      {e.ini}
    </div>
  );
}

const ESTADO_MAP: Record<EstadoAsignacion, [string, string]> = {
  aprobado: ['badge-aprobado', 'Aprobado'],
  pendiente: ['badge-pendiente', 'Pendiente'],
  desarrollo: ['badge-desarrollo', 'En desarrollo'],
  vencido: ['badge-vencido', 'Vencido'],
};

export function BadgeEstado({ estado }: { estado: EstadoAsignacion }) {
  const [cls, label] = ESTADO_MAP[estado] || ESTADO_MAP.pendiente;
  return <span className={`badge ${cls}`}>{label}</span>;
}

export function BadgeTipo({ tipo }: { tipo: CursoTipo }) {
  return tipo === 'normativo' ? (
    <span className="badge badge-normativo">Normativo</span>
  ) : (
    <span className="badge badge-interna">Interna</span>
  );
}

export function CourseCard({ curso: c }: { curso: Curso }) {
  const me = useCurrentUser();
  const e = escuela(c.escuela);
  const estado = me.asign[c.id];
  return (
    <Link to={`/curso/${c.id}`} className="course-card">
      <div className="thumb" style={{ background: `linear-gradient(135deg, ${e.color}, var(--navy))` }}>
        {iconFor(c.modulos[0].tipo)}
      </div>
      <div className="body">
        <div className="title">{c.nombre}</div>
        <div className="muted" style={{ fontSize: 12 }}>
          {e.nombre} · {c.duracion}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <BadgeTipo tipo={c.tipo} /> {estado ? <BadgeEstado estado={estado} /> : null}
        </div>
      </div>
    </Link>
  );
}

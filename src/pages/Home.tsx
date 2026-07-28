import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp, useCurrentUser } from '../context/AppContext';
import { escuela } from '../data/mockData';
import { BadgeEstado, iconFor } from '../components/ui';
import type { EstadoAsignacion } from '../types';

export function Home() {
  const u = useCurrentUser();
  const { cursos } = useApp();
  const [avisoOculto, setAvisoOculto] = useState(false);
  const curso = (id: string) => cursos.find((c) => c.id === id)!;
  const asignEntries = Object.entries(u.asign) as [string, EstadoAsignacion][];
  const counts: Record<string, number> = { pendiente: 0, desarrollo: 0, aprobado: 0 };
  asignEntries.forEach(([, est]) => {
    if (counts[est] !== undefined) counts[est]++;
  });
  const obligatorios = asignEntries.filter(([id]) => curso(id).tipo === 'normativo').length;
  const enCurso = asignEntries.find(([, est]) => est === 'desarrollo');
  const cCurso = enCurso ? curso(enCurso[0]) : null;
  const vencimientos = asignEntries
    .filter(([id, est]) => est !== 'aprobado' && curso(id).tipo === 'normativo')
    .map(([id]) => curso(id));
  const pendientesUrgentes = asignEntries.filter(([, est]) => est === 'pendiente' || est === 'vencido');

  return (
    <div data-fade>
      <div className="eyebrow">{u.contexto === 'bodega' ? 'Vista bodega · mobile-first' : 'Hola de nuevo'}</div>
      <h1 className="h-title">Bienvenido/a, {u.nombre}</h1>
      <div className="divider" />

      {!avisoOculto && pendientesUrgentes.length > 0 && (
        <div
          className="card"
          style={{
            marginBottom: 20,
            background: 'var(--danger-bg, #fdecea)',
            border: '1px solid var(--danger, #d64545)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontWeight: 700 }}>
              Tienes {pendientesUrgentes.length} curso{pendientesUrgentes.length > 1 ? 's' : ''} pendiente
              {pendientesUrgentes.length > 1 ? 's' : ''} de completar
            </div>
            <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
              Revisa tu catálogo y complétalos antes de la fecha límite.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <Link className="btn btn-primary btn-sm" to="/catalogo">
              Ver cursos
            </Link>
            <button className="btn btn-outline btn-sm" onClick={() => setAvisoOculto(true)}>
              Ocultar
            </button>
          </div>
        </div>
      )}

      <div className="grid cols-4" style={{ marginBottom: 20 }}>
        <div className="card stat-card">
          <div className="stat-num">{counts.pendiente}</div>
          <div className="stat-label">Pendientes</div>
        </div>
        <div className="card stat-card">
          <div className="stat-num">{obligatorios}</div>
          <div className="stat-label">Obligatorios</div>
        </div>
        <div className="card stat-card">
          <div className="stat-num">{counts.desarrollo}</div>
          <div className="stat-label">En desarrollo</div>
        </div>
        <div className="card stat-card">
          <div className="stat-num">{counts.aprobado}</div>
          <div className="stat-label">Aprobados</div>
        </div>
      </div>

      <div className="grid cols-2">
        <div className="card">
          <div className="eyebrow">Continuar donde quedaste</div>
          {cCurso ? (
            <div className="continue-card">
              <div className="continue-thumb">{iconFor(cCurso.modulos[0].tipo)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{cCurso.nombre}</div>
                <div className="muted" style={{ fontSize: 12.5, margin: '4px 0 8px' }}>
                  {escuela(cCurso.escuela).nombre} · {u.progreso[cCurso.id] || 0}% completado
                </div>
                <div className="progress" style={{ marginBottom: 10 }}>
                  <span style={{ width: `${u.progreso[cCurso.id] || 0}%` }} />
                </div>
                <Link className="btn btn-primary btn-sm" to={`/curso/${cCurso.id}`}>
                  Continuar curso
                </Link>
              </div>
            </div>
          ) : (
            <div className="empty">No tienes cursos en desarrollo. Explora el catálogo.</div>
          )}
        </div>
        <div className="card">
          <div className="eyebrow">Próximos vencimientos</div>
          {vencimientos.length ? (
            vencimientos.map((c) => (
              <div className="venc-row" key={c.id}>
                <span>{c.nombre}</span>
                <BadgeEstado estado={u.asign[c.id]} />
              </div>
            ))
          ) : (
            <div className="muted" style={{ fontSize: 13 }}>
              Sin vencimientos próximos.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

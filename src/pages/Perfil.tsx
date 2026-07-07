import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ESCUELAS, curso, escuela } from '../data/mockData';
import { BadgeEstado } from '../components/ui';
import type { EstadoAsignacion } from '../types';

export function Perfil() {
  const { me: u } = useApp();
  const navigate = useNavigate();
  const asignEntries = Object.entries(u.asign) as [string, EstadoAsignacion][];
  const globalPct = Math.round(
    (asignEntries.filter(([, e]) => e === 'aprobado').length / Math.max(asignEntries.length, 1)) * 100,
  );
  const escuelasCompletadas = ESCUELAS.filter((e) =>
    asignEntries.some(([id, est]) => curso(id).escuela === e.id && est === 'aprobado'),
  );

  return (
    <div data-fade>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="profile-head">
          <div className="avatar" style={{ background: u.color }}>
            {u.nombre.split(' ').map((w) => w[0]).join('')}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{u.nombre}</div>
            <div className="muted" style={{ fontSize: 13 }}>
              {u.cargo} · Escuela base: {escuela(u.escuela).nombre}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="stat-num">{globalPct}%</div>
            <div className="stat-label">Progreso global</div>
          </div>
        </div>
      </div>

      <div className="grid cols-2">
        <div className="card">
          <div className="eyebrow">Bloque 1 · Mis cursos</div>
          {asignEntries.map(([id, est]) => (
            <div className="venc-row" key={id}>
              <span>{curso(id).nombre}</span>
              <BadgeEstado estado={est} />
            </div>
          ))}
        </div>
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="eyebrow">Bloque 2 · Mi progreso</div>
            <div className="grid cols-3" style={{ gap: 10, margin: '10px 0' }}>
              <div className="stat-card">
                <div className="stat-num" style={{ fontSize: 20 }}>
                  {(asignEntries.length * 0.6).toFixed(0)}h
                </div>
                <div className="stat-label">Horas</div>
              </div>
              <div className="stat-card">
                <div className="stat-num" style={{ fontSize: 20 }}>
                  {escuelasCompletadas.length}
                </div>
                <div className="stat-label">Insignias</div>
              </div>
              <div className="stat-card">
                <div className="stat-num" style={{ fontSize: 20 }}>
                  {u.cert.length}
                </div>
                <div className="stat-label">Certificados</div>
              </div>
            </div>
            <div className="divider" />
            <div className="eyebrow">Pasaporte Amplifica</div>
            <div className="passport">
              {ESCUELAS.slice(0, 6).map((e) => {
                const done = escuelasCompletadas.includes(e);
                return (
                  <div
                    className={`stamp${done ? '' : ' locked'}`}
                    style={{ borderColor: done ? e.color : undefined, color: done ? e.color : undefined }}
                    key={e.id}
                  >
                    <div className="ini">{e.ini}</div>
                    <div className="tag">{done ? 'aprobado' : 'pendiente'}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="card">
            <div className="eyebrow">Bloque 3 · Mis certificados</div>
            {u.cert.length ? (
              u.cert.map((cert) => (
                <div className="venc-row" key={cert.cursoId}>
                  <span>
                    {curso(cert.cursoId).nombre} <span className="muted">· {cert.fecha}</span>
                  </span>
                  <button className="btn btn-outline btn-sm" onClick={() => navigate(`/certificado/${cert.cursoId}`)}>
                    Ver
                  </button>
                </div>
              ))
            ) : (
              <div className="muted" style={{ fontSize: 13 }}>
                Aún no tienes certificados.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

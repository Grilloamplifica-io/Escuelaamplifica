import { useState } from 'react';
import { EQUIPO_DANIELA } from '../data/mockData';

export function Equipo() {
  const [rankingOn, setRankingOn] = useState(false);
  const total = EQUIPO_DANIELA.length;
  const avg = Math.round(EQUIPO_DANIELA.reduce((a, p) => a + p.cumplimiento, 0) / total);

  return (
    <div data-fade>
      <h1 className="h-title">Dashboard de tu equipo</h1>
      <div className="muted" style={{ margin: '6px 0 20px' }}>
        La jerarquía viene del HRIS — no requiere configuración adicional.
      </div>
      <div className="grid cols-4" style={{ marginBottom: 20 }}>
        <div className="card stat-card">
          <div className="stat-num">{avg}%</div>
          <div className="stat-label">Cumplimiento del equipo</div>
        </div>
        <div className="card stat-card">
          <div className="stat-num">{EQUIPO_DANIELA.reduce((a, p) => a + p.pendientes, 0)}</div>
          <div className="stat-label">Cursos pendientes</div>
        </div>
        <div className="card stat-card">
          <div className="stat-num">1</div>
          <div className="stat-label">Evaluaciones reprobadas</div>
        </div>
        <div className="card stat-card">
          <div className="stat-num">30 días</div>
          <div className="stat-label">Ventana de vencimiento</div>
        </div>
      </div>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="eyebrow">Cumplimiento por persona</div>
        <table>
          <tbody>
            <tr>
              <th>Colaborador</th>
              <th>Cumplimiento</th>
              <th>Pendientes</th>
              <th></th>
            </tr>
            {EQUIPO_DANIELA.map((p) => (
              <tr key={p.nombre}>
                <td>{p.nombre}</td>
                <td style={{ width: 160 }}>
                  <div className="progress">
                    <span style={{ width: `${p.cumplimiento}%`, background: p.cumplimiento < 60 ? 'var(--danger)' : 'var(--azul)' }} />
                  </div>
                </td>
                <td>{p.pendientes}</td>
                <td>{p.pendientes > 0 ? <button className="btn btn-outline btn-sm">Enviar recordatorio</button> : null}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 2 }}>
              Ranking del equipo
            </div>
            <div className="muted" style={{ fontSize: 12.5 }}>
              Desactivado por defecto — activable solo por decisión del líder, nunca comparado entre bodega y oficina.
            </div>
          </div>
          <div className={`toggle${rankingOn ? ' on' : ''}`} onClick={() => setRankingOn((v) => !v)}>
            <div className="knob" />
          </div>
        </div>
      </div>
    </div>
  );
}

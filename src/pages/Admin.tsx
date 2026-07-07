import { useState } from 'react';
import { CURSOS, ESCUELAS, REGLAS } from '../data/mockData';
import { Crest } from '../components/ui';

type Tab = 'reglas' | 'escuelas';

export function Admin() {
  const [tab, setTab] = useState<Tab>('reglas');

  return (
    <div data-fade>
      <h1 className="h-title">Administración</h1>
      <div className="tabs" style={{ marginTop: 14 }}>
        <div className={`tab${tab === 'reglas' ? ' active' : ''}`} onClick={() => setTab('reglas')}>
          Motor de reglas
        </div>
        <div className={`tab${tab === 'escuelas' ? ' active' : ''}`} onClick={() => setTab('escuelas')}>
          Escuelas
        </div>
      </div>
      {tab === 'reglas' ? <AdminReglas /> : <AdminEscuelas />}
    </div>
  );
}

function AdminReglas() {
  const [simMode, setSimMode] = useState(false);

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="eyebrow" style={{ margin: 0 }}>
          Reglas activas de enrolamiento automático
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="muted" style={{ fontSize: 12.5 }}>
            Modo simulación
          </span>
          <div className={`toggle${simMode ? ' on' : ''}`} onClick={() => setSimMode((v) => !v)}>
            <div className="knob" />
          </div>
        </div>
      </div>
      <div className="divider" />
      {REGLAS.map((r, i) => (
        <div className="rule-card" key={i}>
          <span className="rule-pill">SI</span>
          <span style={{ fontSize: 13.5 }}>{r.cond}</span>
          <span className="arrow">→</span>
          <span className="rule-pill" style={{ background: 'var(--azul)' }}>
            ENTONCES
          </span>
          <span style={{ fontSize: 13.5 }}>{r.accion}</span>
        </div>
      ))}
      <button className="btn btn-primary btn-sm">+ Nueva regla</button>
      {simMode && (
        <div className="card" style={{ marginTop: 14, background: 'var(--success-bg)', border: 'none' }}>
          <b style={{ color: 'var(--success)' }}>Simulación:</b> esta regla afectaría a <b>18 colaboradores</b> de
          Operaciones que aún no tienen la Escuela asignada. Ningún cambio se aplicará hasta activar la regla.
        </div>
      )}
    </div>
  );
}

function AdminEscuelas() {
  return (
    <div className="card">
      <div className="eyebrow">Escuelas de la Academia</div>
      <table>
        <tbody>
          <tr>
            <th>Escuela</th>
            <th>Owner</th>
            <th>Cursos</th>
            <th>Estado</th>
          </tr>
          {ESCUELAS.map((e) => (
            <tr key={e.id}>
              <td style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Crest escuela={e} sm /> {e.nombre}
              </td>
              <td>{e.owner}</td>
              <td>{CURSOS.filter((c) => c.escuela === e.id).length}</td>
              <td>
                <span className="badge badge-aprobado">Activa</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

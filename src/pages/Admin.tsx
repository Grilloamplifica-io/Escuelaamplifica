import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CURSOS, ESCUELAS, REGLAS, escuela } from '../data/mockData';
import { Crest } from '../components/ui';
import { useApp } from '../context/AppContext';
import type { NuevoUsuarioInput, Rol, Usuario } from '../types';

type Tab = 'reglas' | 'escuelas' | 'usuarios';

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
        <div className={`tab${tab === 'usuarios' ? ' active' : ''}`} onClick={() => setTab('usuarios')}>
          Usuarios
        </div>
      </div>
      {tab === 'reglas' ? <AdminReglas /> : tab === 'escuelas' ? <AdminEscuelas /> : <AdminUsuarios />}
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

const ROL_LABEL: Record<Rol, string> = {
  colaborador: 'Colaborador',
  lider: 'Líder',
  people: 'People',
};

const FORM_INICIAL: NuevoUsuarioInput = {
  nombre: '',
  cargo: '',
  rol: 'colaborador',
  contexto: 'oficina',
  escuela: ESCUELAS[0].id,
  color: ESCUELAS[0].color,
};

function AdminUsuarios() {
  const { users, addUser, setCurrentUserId } = useApp();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NuevoUsuarioInput>(FORM_INICIAL);
  const [ultimoCreado, setUltimoCreado] = useState<Usuario | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.cargo.trim()) return;
    const creado = addUser({ ...form, color: escuela(form.escuela).color });
    setUltimoCreado(creado);
    setForm(FORM_INICIAL);
    setShowForm(false);
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="eyebrow" style={{ margin: 0 }}>
            Colaboradores en la Academia
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cancelar' : '+ Nuevo colaborador'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
            <div className="divider" />
            <div className="form-grid">
              <div className="field">
                <label htmlFor="nombre">Nombre completo</label>
                <input
                  id="nombre"
                  required
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                  placeholder="Ej: Andrea Lagos"
                />
              </div>
              <div className="field">
                <label htmlFor="cargo">Cargo</label>
                <input
                  id="cargo"
                  required
                  value={form.cargo}
                  onChange={(e) => setForm((f) => ({ ...f, cargo: e.target.value }))}
                  placeholder="Ej: Ejecutiva de Ventas"
                />
              </div>
              <div className="field">
                <label htmlFor="rol">Rol en la plataforma</label>
                <select
                  id="rol"
                  value={form.rol}
                  onChange={(e) => setForm((f) => ({ ...f, rol: e.target.value as Rol }))}
                >
                  <option value="colaborador">Colaborador</option>
                  <option value="lider">Líder</option>
                  <option value="people">People</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="contexto">Contexto de trabajo</label>
                <select
                  id="contexto"
                  value={form.contexto}
                  onChange={(e) => setForm((f) => ({ ...f, contexto: e.target.value as 'oficina' | 'bodega' }))}
                >
                  <option value="oficina">Oficina</option>
                  <option value="bodega">Bodega</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="escuela">Escuela base</label>
                <select
                  id="escuela"
                  value={form.escuela}
                  onChange={(e) => setForm((f) => ({ ...f, escuela: e.target.value }))}
                >
                  {ESCUELAS.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="muted" style={{ fontSize: 12.5, margin: '12px 0' }}>
              Al crear el colaborador, el motor de reglas le asignará automáticamente el Onboarding Amplifica y los
              cursos de su Escuela base, en estado "Pendiente".
            </div>
            <button className="btn btn-accent" type="submit">
              Crear colaborador →
            </button>
          </form>
        )}
      </div>

      {ultimoCreado && (
        <div className="card" style={{ marginBottom: 16, background: 'var(--success-bg)', border: 'none' }}>
          <b style={{ color: 'var(--success)' }}>Colaborador creado:</b> {ultimoCreado.nombre} quedó enrolado en{' '}
          {Object.keys(ultimoCreado.asign).length} curso(s). Puedes revisarlo en la tabla o seleccionarlo desde el
          selector de usuario arriba.
        </div>
      )}

      <div className="card">
        <table>
          <tbody>
            <tr>
              <th>Colaborador</th>
              <th>Cargo</th>
              <th>Rol</th>
              <th>Escuela base</th>
              <th>Contexto</th>
              <th>Cursos asignados</th>
              <th></th>
            </tr>
            {Object.values(users).map((u) => (
              <tr key={u.id}>
                <td style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="avatar" style={{ background: u.color, width: 28, height: 28, fontSize: 11, borderRadius: 8 }}>
                    {u.nombre.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                  </div>
                  {u.nombre}
                </td>
                <td>{u.cargo}</td>
                <td>{ROL_LABEL[u.rol]}</td>
                <td>{escuela(u.escuela).nombre}</td>
                <td className="muted" style={{ textTransform: 'capitalize' }}>
                  {u.contexto}
                </td>
                <td>{Object.keys(u.asign).length}</td>
                <td>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setCurrentUserId(u.id);
                      navigate('/');
                    }}
                  >
                    Ver como
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

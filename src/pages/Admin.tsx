import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ESCUELAS, REGLAS, escuela } from '../data/mockData';
import { BadgeTipo, Crest } from '../components/ui';
import { useApp } from '../context/AppContext';
import { claveInicialDeRut } from '../utils/rut';
import type { Curso, CursoTipo, Modulo, NuevoCursoInput, NuevoUsuarioInput, Rol, Usuario } from '../types';

type Tab = 'reglas' | 'escuelas' | 'usuarios' | 'cursos';

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
        <div className={`tab${tab === 'cursos' ? ' active' : ''}`} onClick={() => setTab('cursos')}>
          Cursos
        </div>
      </div>
      {tab === 'reglas' && <AdminReglas />}
      {tab === 'escuelas' && <AdminEscuelas />}
      {tab === 'usuarios' && <AdminUsuarios />}
      {tab === 'cursos' && <AdminCursos />}
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
  const { cursos } = useApp();

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
              <td>{cursos.filter((c) => c.escuela === e.id).length}</td>
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

const USUARIO_FORM_INICIAL: NuevoUsuarioInput = {
  nombre: '',
  cargo: '',
  rol: 'colaborador',
  contexto: 'oficina',
  escuela: ESCUELAS[0].id,
  color: ESCUELAS[0].color,
  rut: '',
};

function AdminUsuarios() {
  const { users, addUser, setCurrentUserId } = useApp();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NuevoUsuarioInput>(USUARIO_FORM_INICIAL);
  const [ultimoCreado, setUltimoCreado] = useState<Usuario | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.cargo.trim() || !form.rut.trim()) return;
    const creado = addUser({ ...form, color: escuela(form.escuela).color });
    setUltimoCreado(creado);
    setForm(USUARIO_FORM_INICIAL);
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
                <label htmlFor="rut">RUT</label>
                <input
                  id="rut"
                  required
                  value={form.rut}
                  onChange={(e) => setForm((f) => ({ ...f, rut: e.target.value }))}
                  placeholder="Ej: 18.765.432-1"
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
              cursos de su Escuela base, en estado "Pendiente". Su usuario para ingresar será el RUT y su clave, los
              primeros 4 dígitos de ese mismo RUT.
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
          {Object.keys(ultimoCreado.asign).length} curso(s). Puede ingresar con RUT{' '}
          <span className="mono">{ultimoCreado.rut}</span> y clave{' '}
          <span className="mono">{claveInicialDeRut(ultimoCreado.rut)}</span>.
        </div>
      )}

      <div className="card">
        <table>
          <tbody>
            <tr>
              <th>Colaborador</th>
              <th>RUT</th>
              <th>Cargo</th>
              <th>Rol</th>
              <th>Escuela base</th>
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
                <td className="mono muted" style={{ fontSize: 12.5 }}>
                  {u.rut}
                </td>
                <td>{u.cargo}</td>
                <td>{ROL_LABEL[u.rol]}</td>
                <td>{escuela(u.escuela).nombre}</td>
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

const MODULO_INICIAL: Modulo = { t: '', tipo: 'video' };

const CURSO_FORM_INICIAL: NuevoCursoInput = {
  escuela: ESCUELAS[0].id,
  nombre: '',
  tipo: 'interna',
  duracion: '',
  nivel: '',
  modulos: [{ ...MODULO_INICIAL }],
};

function AdminCursos() {
  const { cursos, addCurso } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NuevoCursoInput>(CURSO_FORM_INICIAL);
  const [ultimoCreado, setUltimoCreado] = useState<Curso | null>(null);

  const updateModulo = (idx: number, patch: Partial<Modulo>) => {
    setForm((f) => ({ ...f, modulos: f.modulos.map((m, i) => (i === idx ? { ...m, ...patch } : m)) }));
  };
  const addModuloRow = () => setForm((f) => ({ ...f, modulos: [...f.modulos, { ...MODULO_INICIAL }] }));
  const removeModuloRow = (idx: number) =>
    setForm((f) => ({ ...f, modulos: f.modulos.filter((_, i) => i !== idx) }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const modulosValidos = form.modulos.filter((m) => m.t.trim());
    if (!form.nombre.trim() || !form.duracion.trim() || !form.nivel.trim() || modulosValidos.length === 0) return;
    const creado = addCurso({ ...form, modulos: modulosValidos });
    setUltimoCreado(creado);
    setForm(CURSO_FORM_INICIAL);
    setShowForm(false);
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="eyebrow" style={{ margin: 0 }}>
            Cursos por Escuela (materia)
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cancelar' : '+ Nuevo curso'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
            <div className="divider" />
            <div className="form-grid">
              <div className="field">
                <label htmlFor="curso-nombre">Nombre del curso</label>
                <input
                  id="curso-nombre"
                  required
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                  placeholder="Ej: Excel Intermedio"
                />
              </div>
              <div className="field">
                <label htmlFor="curso-escuela">Escuela (materia)</label>
                <select
                  id="curso-escuela"
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
              <div className="field">
                <label htmlFor="curso-tipo">Tipo</label>
                <select
                  id="curso-tipo"
                  value={form.tipo}
                  onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as CursoTipo }))}
                >
                  <option value="interna">Interna</option>
                  <option value="normativo">Normativo</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="curso-duracion">Duración</label>
                <input
                  id="curso-duracion"
                  required
                  value={form.duracion}
                  onChange={(e) => setForm((f) => ({ ...f, duracion: e.target.value }))}
                  placeholder="Ej: 30 min"
                />
              </div>
              <div className="field">
                <label htmlFor="curso-nivel">Nivel</label>
                <input
                  id="curso-nivel"
                  required
                  value={form.nivel}
                  onChange={(e) => setForm((f) => ({ ...f, nivel: e.target.value }))}
                  placeholder="Ej: Fundamentos"
                />
              </div>
            </div>

            <div className="eyebrow" style={{ marginTop: 18 }}>
              Módulos
            </div>
            {form.modulos.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                <input
                  style={{ flex: 1, padding: '9px 12px', borderRadius: 9, border: '1px solid var(--border)', fontSize: 13.5, fontFamily: 'inherit' }}
                  value={m.t}
                  onChange={(e) => updateModulo(i, { t: e.target.value })}
                  placeholder={`Título del módulo ${i + 1}`}
                />
                <select
                  style={{ padding: '9px 12px', borderRadius: 9, border: '1px solid var(--border)', fontSize: 13.5, fontFamily: 'inherit' }}
                  value={m.tipo}
                  onChange={(e) => updateModulo(i, { tipo: e.target.value as Modulo['tipo'] })}
                >
                  <option value="video">Video</option>
                  <option value="pdf">PDF</option>
                  <option value="checklist">Checklist</option>
                </select>
                {form.modulos.length > 1 && (
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => removeModuloRow(i)}>
                    ×
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="btn btn-outline btn-sm" onClick={addModuloRow} style={{ marginBottom: 14 }}>
              + Agregar módulo
            </button>

            <div className="muted" style={{ fontSize: 12.5, margin: '4px 0 14px' }}>
              El curso se crea sin evaluación de cierre (se puede sumar más adelante) y queda disponible de inmediato
              en el Catálogo, dentro de la Escuela elegida.
            </div>
            <button className="btn btn-accent" type="submit">
              Crear curso →
            </button>
          </form>
        )}
      </div>

      {ultimoCreado && (
        <div className="card" style={{ marginBottom: 16, background: 'var(--success-bg)', border: 'none' }}>
          <b style={{ color: 'var(--success)' }}>Curso creado:</b> "{ultimoCreado.nombre}" ya está disponible en el
          Catálogo, dentro de la Escuela de {escuela(ultimoCreado.escuela).nombre}.
        </div>
      )}

      <div className="card">
        <table>
          <tbody>
            <tr>
              <th>Curso</th>
              <th>Escuela</th>
              <th>Tipo</th>
              <th>Duración</th>
              <th>Módulos</th>
            </tr>
            {cursos.map((c) => (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Crest escuela={escuela(c.escuela)} sm /> {escuela(c.escuela).nombre}
                </td>
                <td>
                  <BadgeTipo tipo={c.tipo} />
                </td>
                <td>{c.duracion}</td>
                <td>{c.modulos.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

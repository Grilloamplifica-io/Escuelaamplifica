import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ESCUELAS, escuela } from '../data/mockData';
import { BadgeEstado, BadgeTipo, Crest } from '../components/ui';
import { useApp } from '../context/AppContext';
import { claveInicialDeRut, soloDigitosRut } from '../utils/rut';
import { COLUMNAS_PLANTILLA, descargarPlantillaUsuarios, leerUsuariosDesdeArchivo, type FilaImportada } from '../utils/importUsuarios';
import { exportarCumplimientoCursos, type FilaCumplimientoExport } from '../utils/exportCumplimiento';
import type { Curso, CursoTipo, EstadoAsignacion, Modulo, NuevaReglaCargoInput, NuevaReglaInput, NuevoCursoInput, NuevoUsuarioInput, QuizPregunta, Rol, Usuario } from '../types';

const PREGUNTAS_MINIMAS = 5;

const DIACRITICOS_ADMIN = new RegExp('[\\u0300-\\u036f]', 'g');

function normalizarTexto(valor: string): string {
  return valor.toLowerCase().normalize('NFD').replace(DIACRITICOS_ADMIN, '');
}

type Tab = 'reglas' | 'escuelas' | 'usuarios' | 'cursos' | 'ranking' | 'cumplimiento';

export function Admin() {
  const { resetDemo } = useApp();
  const [tab, setTab] = useState<Tab>('reglas');

  const handleReset = () => {
    if (window.confirm('¿Restablecer todos los datos de ejemplo? Se perderán los usuarios, cursos, preguntas y reglas creados durante esta sesión.')) {
      resetDemo();
    }
  };

  return (
    <div data-fade>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <h1 className="h-title">Administración</h1>
        <button className="btn btn-outline btn-sm" onClick={handleReset}>
          Restablecer datos de ejemplo
        </button>
      </div>
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
        <div className={`tab${tab === 'ranking' ? ' active' : ''}`} onClick={() => setTab('ranking')}>
          Ranking
        </div>
        <div className={`tab${tab === 'cumplimiento' ? ' active' : ''}`} onClick={() => setTab('cumplimiento')}>
          Cumplimiento por curso
        </div>
      </div>
      {tab === 'reglas' && (
        <>
          <AdminReglas />
          <ReglasPorCargo />
        </>
      )}
      {tab === 'escuelas' && <AdminEscuelas />}
      {tab === 'usuarios' && <AdminUsuarios />}
      {tab === 'cursos' && <AdminCursos />}
      {tab === 'ranking' && <AdminRanking />}
      {tab === 'cumplimiento' && <AdminCumplimientoCursos />}
    </div>
  );
}

type FilaCumplimientoCurso = FilaCumplimientoExport;

function AdminCumplimientoCursos() {
  const { cursos, users } = useApp();
  const usuarios = Object.values(users);
  const [exportando, setExportando] = useState(false);

  const filas: FilaCumplimientoCurso[] = cursos
    .map((curso) => {
      const asignadosCon = usuarios
        .map((u) => ({ usuario: u, estado: u.asign[curso.id] }))
        .filter((x): x is { usuario: Usuario; estado: EstadoAsignacion } => Boolean(x.estado));
      const usuariosPorEstado: Record<EstadoAsignacion, Usuario[]> = {
        aprobado: [],
        desarrollo: [],
        pendiente: [],
        vencido: [],
      };
      asignadosCon.forEach(({ usuario, estado }) => usuariosPorEstado[estado].push(usuario));
      (Object.keys(usuariosPorEstado) as EstadoAsignacion[]).forEach((estado) =>
        usuariosPorEstado[estado].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })),
      );
      const asignados = asignadosCon.length;
      const aprobados = usuariosPorEstado.aprobado.length;
      const enDesarrollo = usuariosPorEstado.desarrollo.length;
      const pendientes = usuariosPorEstado.pendiente.length;
      const vencidos = usuariosPorEstado.vencido.length;
      const pctAprobado = asignados > 0 ? Math.round((aprobados / asignados) * 100) : 0;
      return { curso, asignados, aprobados, enDesarrollo, pendientes, vencidos, pctAprobado, usuariosPorEstado };
    })
    .sort((a, b) => b.asignados - a.asignados || a.curso.nombre.localeCompare(b.curso.nombre, 'es'));

  const filasConDatos = filas.filter((f) => f.asignados > 0);

  const handleExportar = async () => {
    setExportando(true);
    try {
      await exportarCumplimientoCursos(filasConDatos);
    } finally {
      setExportando(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 4 }}>
        <div className="muted" style={{ fontSize: 12.5 }}>
          Para cada curso, de las personas que lo tienen habilitado/asignado, qué porcentaje ya lo aprobó. Los cursos
          sin nadie asignado no aparecen.
        </div>
        <button
          className="btn btn-outline btn-sm"
          onClick={handleExportar}
          disabled={exportando || filasConDatos.length === 0}
        >
          {exportando ? 'Exportando…' : 'Exportar a Excel'}
        </button>
      </div>
      <div style={{ marginBottom: 12 }} />
      {filasConDatos.length === 0 && (
        <div className="empty">Aún no hay cursos asignados para calcular cumplimiento.</div>
      )}
      {filasConDatos.map((f) => (
        <CumplimientoCurso fila={f} key={f.curso.id} />
      ))}
    </div>
  );
}

function CumplimientoCurso({ fila: f }: { fila: FilaCumplimientoCurso }) {
  const [expandido, setExpandido] = useState(false);

  return (
    <div className="card" style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <Crest escuela={escuela(f.curso.escuela)} sm />
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{f.curso.nombre}</div>
          <div className="muted" style={{ fontSize: 12 }}>
            {escuela(f.curso.escuela).nombre} · {f.asignados} habilitado{f.asignados === 1 ? '' : 's'}
          </div>
        </div>
        <BadgeTipo tipo={f.curso.tipo} />
        <div className="progress" style={{ width: 140 }}>
          <span style={{ width: `${f.pctAprobado}%`, background: f.pctAprobado >= 80 ? 'var(--success)' : 'var(--azul)' }} />
        </div>
        <b style={{ fontSize: 15, minWidth: 46, textAlign: 'right' }}>{f.pctAprobado}%</b>
        <button className="btn btn-outline btn-sm" onClick={() => setExpandido((v) => !v)}>
          {expandido ? 'Ocultar detalle' : 'Ver detalle'}
        </button>
      </div>
      <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
        {f.aprobados} aprobado{f.aprobados === 1 ? '' : 's'} · {f.enDesarrollo} en desarrollo · {f.pendientes} pendiente
        {f.pendientes === 1 ? '' : 's'}
        {f.vencidos > 0 ? ` · ${f.vencidos} vencido${f.vencidos === 1 ? '' : 's'}` : ''}
      </div>

      {expandido && (
        <>
          <div className="divider" />
          <div className="grid cols-3" style={{ gap: 14, alignItems: 'start' }}>
            <DetalleEstadoCurso titulo="Aprobados" usuarios={f.usuariosPorEstado.aprobado} estado="aprobado" />
            <DetalleEstadoCurso titulo="En desarrollo" usuarios={f.usuariosPorEstado.desarrollo} estado="desarrollo" />
            <DetalleEstadoCurso titulo="Pendientes (falta)" usuarios={f.usuariosPorEstado.pendiente} estado="pendiente" />
            {f.vencidos > 0 && (
              <DetalleEstadoCurso titulo="Vencidos (falta)" usuarios={f.usuariosPorEstado.vencido} estado="vencido" />
            )}
          </div>
        </>
      )}
    </div>
  );
}

function DetalleEstadoCurso({
  titulo,
  usuarios,
  estado,
}: {
  titulo: string;
  usuarios: Usuario[];
  estado: EstadoAsignacion;
}) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <BadgeEstado estado={estado} />
        <b style={{ fontSize: 12.5 }}>
          {titulo} ({usuarios.length})
        </b>
      </div>
      {usuarios.length === 0 ? (
        <div className="muted" style={{ fontSize: 12 }}>
          Nadie en este estado.
        </div>
      ) : (
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5 }}>
          {usuarios.map((u) => (
            <li key={u.id}>
              {u.nombre} <span className="muted">· {u.cargo}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface FilaRanking {
  usuario: Usuario;
  asignados: number;
  aprobados: number;
  pct: number;
}

function AdminRanking() {
  const { cursos, users } = useApp();
  const usuarios = Object.values(users);

  const rankingsPorEscuela = ESCUELAS.map((e) => {
    const cursosEscuela = cursos.filter((c) => c.escuela === e.id).map((c) => c.id);
    const filas: FilaRanking[] = usuarios
      .map((usuario) => {
        const asignados = cursosEscuela.filter((cid) => usuario.asign[cid]);
        const aprobados = asignados.filter((cid) => usuario.asign[cid] === 'aprobado');
        return { usuario, asignados: asignados.length, aprobados: aprobados.length, pct: 0 };
      })
      .filter((f) => f.asignados > 0)
      .map((f) => ({ ...f, pct: Math.round((f.aprobados / f.asignados) * 100) }))
      .sort((a, b) => b.pct - a.pct || b.aprobados - a.aprobados || a.usuario.nombre.localeCompare(b.usuario.nombre));
    return { escuela: e, filas };
  }).filter((r) => r.filas.length > 0);

  return (
    <div>
      <div className="muted" style={{ fontSize: 12.5, margin: '4px 0 16px' }}>
        Cumplimiento por Escuela: % de cursos aprobados entre los cursos de esa Escuela que cada colaborador tiene
        asignados. Solo aparecen colaboradores con al menos un curso asignado de la Escuela.
      </div>
      {rankingsPorEscuela.length === 0 && (
        <div className="empty">Aún no hay cursos asignados para calcular un ranking.</div>
      )}
      {rankingsPorEscuela.map(({ escuela: e, filas }) => (
        <div className="card" key={e.id} style={{ marginBottom: 16 }}>
          <div className="escuela-row-head" style={{ marginBottom: 12 }}>
            <Crest escuela={e} sm />
            <div className="h4 display" style={{ fontSize: 15 }}>
              {e.nombre}
            </div>
          </div>
          {filas.map((f, i) => (
            <div className="venc-row" key={f.usuario.id}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 22, textAlign: 'center' }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span className="muted">{i + 1}</span>}
                </span>
                <span
                  className="avatar"
                  style={{ background: f.usuario.color, width: 26, height: 26, fontSize: 10, borderRadius: 8 }}
                >
                  {f.usuario.nombre.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                </span>
                <span>
                  {f.usuario.nombre} <span className="muted" style={{ fontSize: 12 }}>· {f.usuario.cargo}</span>
                </span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="muted" style={{ fontSize: 12 }}>
                  {f.aprobados}/{f.asignados}
                </span>
                <div className="progress" style={{ width: 100 }}>
                  <span style={{ width: `${f.pct}%`, background: f.pct >= 80 ? 'var(--success)' : 'var(--azul)' }} />
                </div>
                <b style={{ fontSize: 13, minWidth: 34, textAlign: 'right' }}>{f.pct}%</b>
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const REGLA_FORM_INICIAL: NuevaReglaInput = { rol: 'lider', escuela: ESCUELAS[0].id };

function AdminReglas() {
  const { reglas, addRegla, users } = useApp();
  const [simMode, setSimMode] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NuevaReglaInput>(REGLA_FORM_INICIAL);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    addRegla(form);
    setForm(REGLA_FORM_INICIAL);
    setShowForm(false);
  };

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="eyebrow" style={{ margin: 0 }}>
          Reglas de enrolamiento automático por rol
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
      <div className="muted" style={{ fontSize: 12.5, margin: '6px 0 0' }}>
        Además de estas reglas, todo colaborador nuevo recibe automáticamente el Onboarding Amplifica y los cursos de
        su Escuela base.
      </div>
      <div className="divider" />
      {reglas.map((r) => {
        const afectados = users ? Object.values(users).filter((u) => u.rol === r.rol).length : 0;
        return (
          <div key={r.id}>
            <div className="rule-card">
              <span className="rule-pill">SI</span>
              <span style={{ fontSize: 13.5 }}>rol = {ROL_LABEL[r.rol]}</span>
              <span className="arrow">→</span>
              <span className="rule-pill" style={{ background: 'var(--azul)' }}>
                ENTONCES
              </span>
              <span style={{ fontSize: 13.5 }}>asigna cursos de Escuela {escuela(r.escuela).nombre}</span>
            </div>
            {simMode && (
              <div className="muted" style={{ fontSize: 12, margin: '-4px 0 10px 15px' }}>
                Afecta a {afectados} colaborador{afectados === 1 ? '' : 'es'} con rol {ROL_LABEL[r.rol]}.
              </div>
            )}
          </div>
        );
      })}

      {showForm ? (
        <form onSubmit={handleSubmit} style={{ marginTop: 10 }}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="regla-rol">SI rol =</label>
              <select id="regla-rol" value={form.rol} onChange={(e) => setForm((f) => ({ ...f, rol: e.target.value as Rol }))}>
                <option value="colaborador">Colaborador</option>
                <option value="lider">Líder</option>
                <option value="people">People</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="regla-escuela">ENTONCES asigna Escuela</label>
              <select id="regla-escuela" value={form.escuela} onChange={(e) => setForm((f) => ({ ...f, escuela: e.target.value }))}>
                {ESCUELAS.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button className="btn btn-accent" type="submit">
              Agregar regla
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
          + Nueva regla
        </button>
      )}
    </div>
  );
}

const REGLA_CARGO_FORM_INICIAL: NuevaReglaCargoInput = { cargo: '', cursoIds: [] };

function ReglasPorCargo() {
  const { reglasCargo, addReglaCargo, eliminarReglaCargo, users, cursos } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NuevaReglaCargoInput>(REGLA_CARGO_FORM_INICIAL);
  const [ultimaAplicada, setUltimaAplicada] = useState<{ cargo: string; afectados: number } | null>(null);
  const [error, setError] = useState('');

  const cargosDisponibles = useMemo(
    () => Array.from(new Set(Object.values(users).map((u) => u.cargo))).sort((a, b) => a.localeCompare(b, 'es')),
    [users],
  );

  const toggleCurso = (cursoId: string) => {
    setForm((f) => ({
      ...f,
      cursoIds: f.cursoIds.includes(cursoId) ? f.cursoIds.filter((id) => id !== cursoId) : [...f.cursoIds, cursoId],
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.cargo.trim() || form.cursoIds.length === 0) {
      setError('Elige el cargo y al menos un curso antes de aplicar la regla.');
      return;
    }
    setError('');
    const cargoNorm = normalizarTexto(form.cargo.trim());
    const afectados = Object.values(users).filter((u) => normalizarTexto(u.cargo) === cargoNorm).length;
    addReglaCargo({ cargo: form.cargo.trim(), cursoIds: form.cursoIds });
    setUltimaAplicada({ cargo: form.cargo.trim(), afectados });
    setForm(REGLA_CARGO_FORM_INICIAL);
    setShowForm(false);
  };

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="eyebrow" style={{ margin: 0 }}>
        Reglas por cargo (asigna varios cursos a la vez)
      </div>
      <div className="muted" style={{ fontSize: 12.5, margin: '6px 0 0' }}>
        Elige un cargo exacto (ej. "Operator", "Head of People") y los cursos que quieras habilitar para todas las
        personas con ese cargo, de una sola vez. Se aplica de inmediato a quienes ya tengan ese cargo hoy, y también
        a quien se cree a futuro con ese mismo cargo.
      </div>
      <div className="divider" />

      {reglasCargo.length === 0 && !showForm && (
        <div className="muted" style={{ fontSize: 12.5 }}>
          Aún no hay reglas por cargo.
        </div>
      )}
      {reglasCargo.map((r) => (
        <div className="rule-card" key={r.id}>
          <span className="rule-pill">SI</span>
          <span style={{ fontSize: 13.5 }}>cargo = {r.cargo}</span>
          <span className="arrow">→</span>
          <span className="rule-pill" style={{ background: 'var(--azul)' }}>
            ENTONCES
          </span>
          <span style={{ fontSize: 13.5, flex: 1 }}>
            asigna {r.cursoIds.length} curso{r.cursoIds.length === 1 ? '' : 's'}:{' '}
            {r.cursoIds.map((cid) => cursos.find((c) => c.id === cid)?.nombre ?? cid).join(', ')}
          </span>
          <button className="btn btn-outline btn-sm" onClick={() => eliminarReglaCargo(r.id)}>
            Eliminar
          </button>
        </div>
      ))}

      {ultimaAplicada && (
        <div className="muted" style={{ fontSize: 12.5, margin: '10px 0' }}>
          Regla aplicada: {ultimaAplicada.afectados} colaborador{ultimaAplicada.afectados === 1 ? '' : 'es'} con
          cargo "{ultimaAplicada.cargo}" recibió los cursos elegidos en estado pendiente.
        </div>
      )}

      {showForm ? (
        <form onSubmit={handleSubmit} style={{ marginTop: 10 }}>
          <div className="field" style={{ marginBottom: 12 }}>
            <label htmlFor="regla-cargo">SI cargo =</label>
            <input
              id="regla-cargo"
              list="cargos-existentes"
              required
              value={form.cargo}
              onChange={(e) => setForm((f) => ({ ...f, cargo: e.target.value }))}
              placeholder="Ej: Operator"
            />
            <datalist id="cargos-existentes">
              {cargosDisponibles.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div className="field">
            <label>ENTONCES asigna estos cursos</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
              {cursos.map((c) => (
                <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={form.cursoIds.includes(c.id)}
                    onChange={() => toggleCurso(c.id)}
                  />
                  {c.nombre} <span className="muted">· {escuela(c.escuela).nombre}</span>
                </label>
              ))}
            </div>
          </div>
          {error && (
            <div style={{ color: 'var(--danger)', fontSize: 12.5, margin: '10px 0 0' }}>{error}</div>
          )}
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button className="btn btn-accent" type="submit" disabled={!form.cargo.trim() || form.cursoIds.length === 0}>
              Aplicar regla ahora
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
          + Nueva regla por cargo
        </button>
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
  const { users, addUser } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NuevoUsuarioInput>(USUARIO_FORM_INICIAL);
  const [ultimoCreado, setUltimoCreado] = useState<Usuario | null>(null);
  const [importando, setImportando] = useState(false);
  const [resultadoImport, setResultadoImport] = useState<{ creados: number; errores: FilaImportada[] } | null>(null);
  const [busqueda, setBusqueda] = useState('');

  const usuariosOrdenados = useMemo(() => {
    const termino = normalizarTexto(busqueda.trim());
    return Object.values(users)
      .filter(
        (u) =>
          !termino ||
          [u.nombre, u.cargo, u.rut].some((valor) => normalizarTexto(valor).includes(termino)),
      )
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
  }, [users, busqueda]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.cargo.trim() || !form.rut.trim()) return;
    const creado = addUser({ ...form, color: escuela(form.escuela).color });
    setUltimoCreado(creado);
    setForm(USUARIO_FORM_INICIAL);
    setShowForm(false);
  };

  const handleArchivoImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImportando(true);
    setResultadoImport(null);
    try {
      const filas = await leerUsuariosDesdeArchivo(file);
      const rutsExistentes = new Set(Object.values(users).map((u) => soloDigitosRut(u.rut)));
      let creados = 0;
      const errores: FilaImportada[] = [];
      for (const fila of filas) {
        if (!fila.ok || !fila.input) {
          errores.push(fila);
          continue;
        }
        const rutLimpio = soloDigitosRut(fila.input.rut);
        if (rutsExistentes.has(rutLimpio)) {
          errores.push({ ...fila, ok: false, error: `RUT ${fila.input.rut} ya existe en la Academia.` });
          continue;
        }
        addUser(fila.input);
        rutsExistentes.add(rutLimpio);
        creados++;
      }
      setResultadoImport({ creados, errores });
    } catch {
      setResultadoImport({
        creados: 0,
        errores: [{ fila: 0, ok: false, error: 'No se pudo leer el archivo. Verifica que sea un Excel (.xlsx) válido.' }],
      });
    } finally {
      setImportando(false);
    }
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div className="eyebrow" style={{ margin: 0 }}>
            Colaboradores en la Academia
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-outline btn-sm" onClick={descargarPlantillaUsuarios}>
              Descargar plantilla
            </button>
            <label className="btn btn-outline btn-sm" style={{ margin: 0 }}>
              {importando ? 'Cargando…' : 'Carga masiva (Excel)'}
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleArchivoImport}
                disabled={importando}
                style={{ display: 'none' }}
              />
            </label>
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm((v) => !v)}>
              {showForm ? 'Cancelar' : '+ Nuevo colaborador'}
            </button>
          </div>
        </div>
        <div className="muted" style={{ fontSize: 12.5, marginTop: 8 }}>
          Para cargar varios colaboradores a la vez, descarga la plantilla, complétala en Excel (columnas:{' '}
          {COLUMNAS_PLANTILLA.join(' · ')}) y súbela con "Carga masiva".
        </div>

        {resultadoImport && (
          <div
            className="card"
            style={{
              marginTop: 14,
              background: resultadoImport.creados > 0 ? 'var(--success-bg)' : 'var(--danger-bg)',
              border: 'none',
            }}
          >
            <div>
              <b style={{ color: resultadoImport.creados > 0 ? 'var(--success)' : 'var(--danger)' }}>
                {resultadoImport.creados > 0
                  ? `Se crearon ${resultadoImport.creados} colaborador${resultadoImport.creados === 1 ? '' : 'es'}.`
                  : 'No se creó ningún colaborador.'}
              </b>
              {resultadoImport.errores.length > 0 && (
                <span> {resultadoImport.errores.length} fila{resultadoImport.errores.length === 1 ? '' : 's'} con errores:</span>
              )}
            </div>
            {resultadoImport.errores.length > 0 && (
              <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 12.5 }}>
                {resultadoImport.errores.map((e, i) => (
                  <li key={i}>
                    {e.fila > 0 ? `Fila ${e.fila}: ` : ''}
                    {e.error}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

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

      <div className="field" style={{ marginBottom: 12 }}>
        <label htmlFor="buscar-usuarios">Buscar colaborador</label>
        <input
          id="buscar-usuarios"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Busca por nombre, apellido, cargo o RUT…"
        />
      </div>
      <div className="muted" style={{ fontSize: 12.5, marginBottom: 12 }}>
        {usuariosOrdenados.length} de {Object.keys(users).length} colaborador
        {Object.keys(users).length === 1 ? '' : 'es'}, ordenados alfabéticamente.
      </div>

      {usuariosOrdenados.map((u) => (
        <UsuarioConCursos usuario={u} key={u.id} />
      ))}
    </div>
  );
}

function UsuarioConCursos({ usuario: u }: { usuario: Usuario }) {
  const { setCurrentUserId } = useApp();
  const navigate = useNavigate();
  const [gestionando, setGestionando] = useState(false);

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div className="avatar" style={{ background: u.color, width: 32, height: 32, fontSize: 12, borderRadius: 9 }}>
          {u.nombre.split(' ').map((w) => w[0]).slice(0, 2).join('')}
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{u.nombre}</div>
          <div className="muted" style={{ fontSize: 12 }}>
            {u.cargo} · {ROL_LABEL[u.rol]} · Escuela base: {escuela(u.escuela).nombre}
          </div>
        </div>
        <span className="mono muted" style={{ fontSize: 12 }}>
          {u.rut}
        </span>
        <span className="badge badge-interna">{Object.keys(u.asign).length} cursos</span>
        <button className="btn btn-outline btn-sm" onClick={() => setGestionando((v) => !v)}>
          {gestionando ? 'Ocultar cursos' : 'Gestionar cursos'}
        </button>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => {
            setCurrentUserId(u.id);
            navigate('/');
          }}
        >
          Ver como
        </button>
      </div>

      {gestionando && (
        <>
          <div className="divider" />
          <CursosDeUsuario usuario={u} />
        </>
      )}
    </div>
  );
}

function CursosDeUsuario({ usuario: u }: { usuario: Usuario }) {
  const { cursos, asignarCursoAUsuario } = useApp();
  const asignados = cursos.filter((c) => u.asign[c.id]);
  const disponibles = cursos.filter((c) => !u.asign[c.id]);

  return (
    <div>
      <div className="eyebrow">Cursos asignados</div>
      {asignados.length ? (
        asignados.map((c) => (
          <div className="venc-row" key={c.id}>
            <span>{c.nombre}</span>
            <BadgeEstado estado={u.asign[c.id]} />
          </div>
        ))
      ) : (
        <div className="muted" style={{ fontSize: 13 }}>
          Aún no tiene cursos asignados.
        </div>
      )}

      <div className="divider" />
      <div className="eyebrow">Cursos disponibles para asignar</div>
      {disponibles.length ? (
        disponibles.map((c) => (
          <div className="venc-row" key={c.id}>
            <span>
              {c.nombre} <span className="muted">· {escuela(c.escuela).nombre}</span>
            </span>
            <button className="btn btn-accent btn-sm" onClick={() => asignarCursoAUsuario(u.id, c.id)}>
              + Asignar
            </button>
          </div>
        ))
      ) : (
        <div className="muted" style={{ fontSize: 13 }}>
          Ya tiene todos los cursos del catálogo asignados.
        </div>
      )}
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
  const [ultimoCreado, setUltimoCreado] = useState<Curso | null>(null);

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
          <div style={{ marginTop: 16 }}>
            <div className="divider" />
            <CursoCamposForm
              idPrefix="nuevo-curso"
              valorInicial={CURSO_FORM_INICIAL}
              textoBoton="Crear curso →"
              notaAlPie="El curso se crea sin evaluación de cierre (se puede sumar más adelante) y queda disponible de inmediato en el Catálogo, dentro de la Escuela elegida."
              onSubmit={(input) => {
                const creado = addCurso(input);
                setUltimoCreado(creado);
                setShowForm(false);
              }}
            />
          </div>
        )}
      </div>

      {ultimoCreado && (
        <div className="card" style={{ marginBottom: 16, background: 'var(--success-bg)', border: 'none' }}>
          <b style={{ color: 'var(--success)' }}>Curso creado:</b> "{ultimoCreado.nombre}" ya está disponible en el
          Catálogo, dentro de la Escuela de {escuela(ultimoCreado.escuela).nombre}.
        </div>
      )}

      <div className="muted" style={{ fontSize: 12.5, margin: '4px 0 14px' }}>
        Cada evaluación toma {PREGUNTAS_MINIMAS} preguntas al azar del banco del curso. Despliega un curso para
        editarlo o cargar sus preguntas.
      </div>

      {cursos.map((c) => (
        <CursoConBanco curso={c} key={c.id} />
      ))}
    </div>
  );
}

function CursoConBanco({ curso: c }: { curso: Curso }) {
  const { editarCurso, eliminarCurso } = useApp();
  const [editando, setEditando] = useState(false);
  const [expandido, setExpandido] = useState(false);
  const numPreguntas = c.quiz?.length ?? 0;

  const handleEliminar = () => {
    if (window.confirm(`¿Eliminar el curso "${c.nombre}"? Esta acción no se puede deshacer.`)) {
      eliminarCurso(c.id);
    }
  };

  if (editando) {
    return (
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>
          Editando: {c.nombre}
        </div>
        <CursoCamposForm
          idPrefix={`editar-${c.id}`}
          valorInicial={{ escuela: c.escuela, nombre: c.nombre, tipo: c.tipo, duracion: c.duracion, nivel: c.nivel, modulos: c.modulos }}
          textoBoton="Guardar cambios"
          onSubmit={(input) => {
            editarCurso(c.id, input);
            setEditando(false);
          }}
          onCancel={() => setEditando(false)}
        />
      </div>
    );
  }

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <Crest escuela={escuela(c.escuela)} sm />
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{c.nombre}</div>
          <div className="muted" style={{ fontSize: 12 }}>
            {escuela(c.escuela).nombre} · {c.duracion} · {c.modulos.length} módulos
          </div>
        </div>
        <BadgeTipo tipo={c.tipo} />
        <span className={`badge ${numPreguntas >= PREGUNTAS_MINIMAS ? 'badge-aprobado' : 'badge-pendiente'}`}>
          {numPreguntas} / {PREGUNTAS_MINIMAS} preguntas
        </span>
        <button className="btn btn-outline btn-sm" onClick={() => setEditando(true)}>
          Editar
        </button>
        <button className="btn btn-outline btn-sm" onClick={() => setExpandido((v) => !v)}>
          {expandido ? 'Ocultar preguntas' : 'Gestionar preguntas'}
        </button>
        <button className="btn btn-outline btn-sm" style={{ color: '#c0392b', borderColor: '#c0392b' }} onClick={handleEliminar}>
          Eliminar
        </button>
      </div>

      {expandido && (
        <>
          <div className="divider" />
          <BancoPreguntasCurso curso={c} />
        </>
      )}
    </div>
  );
}

function CursoCamposForm({
  idPrefix,
  valorInicial,
  textoBoton,
  notaAlPie,
  onSubmit,
  onCancel,
}: {
  idPrefix: string;
  valorInicial: NuevoCursoInput;
  textoBoton: string;
  notaAlPie?: string;
  onSubmit: (input: NuevoCursoInput) => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<NuevoCursoInput>(valorInicial);

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
    onSubmit({ ...form, modulos: modulosValidos });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="field">
          <label htmlFor={`${idPrefix}-nombre`}>Nombre del curso</label>
          <input
            id={`${idPrefix}-nombre`}
            required
            value={form.nombre}
            onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            placeholder="Ej: Excel Intermedio"
          />
        </div>
        <div className="field">
          <label htmlFor={`${idPrefix}-escuela`}>Escuela (materia)</label>
          <select
            id={`${idPrefix}-escuela`}
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
          <label htmlFor={`${idPrefix}-tipo`}>Tipo</label>
          <select
            id={`${idPrefix}-tipo`}
            value={form.tipo}
            onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as CursoTipo }))}
          >
            <option value="interna">Interna</option>
            <option value="normativo">Normativo</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor={`${idPrefix}-duracion`}>Duración</label>
          <input
            id={`${idPrefix}-duracion`}
            required
            value={form.duracion}
            onChange={(e) => setForm((f) => ({ ...f, duracion: e.target.value }))}
            placeholder="Ej: 30 min"
          />
        </div>
        <div className="field">
          <label htmlFor={`${idPrefix}-nivel`}>Nivel</label>
          <input
            id={`${idPrefix}-nivel`}
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
        <div key={i} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              required
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
          {(m.tipo === 'video' || m.tipo === 'pdf') && (
            <div style={{ marginTop: 8 }}>
              <input
                style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1px solid var(--border)', fontSize: 13, fontFamily: 'inherit' }}
                value={m.archivoUrl ?? ''}
                onChange={(e) => updateModulo(i, { archivoUrl: e.target.value })}
                placeholder={
                  m.tipo === 'video'
                    ? 'Link del video (YouTube o Google Drive)'
                    : 'Link del documento (Google Drive o URL directa al PDF)'
                }
              />
            </div>
          )}
        </div>
      ))}
      <button type="button" className="btn btn-outline btn-sm" onClick={addModuloRow} style={{ marginBottom: 14 }}>
        + Agregar módulo
      </button>

      {notaAlPie && (
        <div className="muted" style={{ fontSize: 12.5, margin: '4px 0 14px' }}>
          {notaAlPie}
        </div>
      )}
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-accent" type="submit">
          {textoBoton}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

const PREGUNTA_FORM_INICIAL = { q: '', ops: ['', ''], correcta: 0, feedback: '' };

function BancoPreguntasCurso({ curso: c }: { curso: Curso }) {
  const { addPreguntaACurso } = useApp();
  const [form, setForm] = useState(PREGUNTA_FORM_INICIAL);
  const banco = c.quiz ?? [];

  const updateOpcion = (idx: number, valor: string) => {
    setForm((f) => ({ ...f, ops: f.ops.map((op, i) => (i === idx ? valor : op)) }));
  };
  const addOpcion = () => setForm((f) => ({ ...f, ops: [...f.ops, ''] }));
  const removeOpcion = (idx: number) =>
    setForm((f) => ({
      ...f,
      ops: f.ops.filter((_, i) => i !== idx),
      correcta: f.correcta === idx ? 0 : f.correcta > idx ? f.correcta - 1 : f.correcta,
    }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const opsValidas = form.ops.map((o) => o.trim()).filter(Boolean);
    if (!form.q.trim() || !form.feedback.trim() || opsValidas.length < 2) return;
    const pregunta: QuizPregunta = { q: form.q.trim(), ops: opsValidas, correcta: form.correcta, feedback: form.feedback.trim() };
    addPreguntaACurso(c.id, pregunta);
    setForm(PREGUNTA_FORM_INICIAL);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span className={`badge ${banco.length >= PREGUNTAS_MINIMAS ? 'badge-aprobado' : 'badge-pendiente'}`}>
          {banco.length} pregunta{banco.length === 1 ? '' : 's'} en el banco
        </span>
        {banco.length < PREGUNTAS_MINIMAS && (
          <span className="muted" style={{ fontSize: 12 }}>
            Faltan {PREGUNTAS_MINIMAS - banco.length} para el mínimo recomendado
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="field" style={{ marginBottom: 12 }}>
          <label htmlFor={`pregunta-texto-${c.id}`}>Pregunta</label>
          <input
            id={`pregunta-texto-${c.id}`}
            required
            value={form.q}
            onChange={(e) => setForm((f) => ({ ...f, q: e.target.value }))}
            placeholder="Ej: ¿Cuál es el primer paso ante...?"
          />
        </div>

        <div className="eyebrow" style={{ marginTop: 4 }}>
          Alternativas (marca la correcta)
        </div>
        {form.ops.map((op, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
            <input
              type="radio"
              name={`pregunta-correcta-${c.id}`}
              checked={form.correcta === i}
              onChange={() => setForm((f) => ({ ...f, correcta: i }))}
            />
            <input
              required={i < 2}
              style={{ flex: 1, padding: '9px 12px', borderRadius: 9, border: '1px solid var(--border)', fontSize: 13.5, fontFamily: 'inherit' }}
              value={op}
              onChange={(e) => updateOpcion(i, e.target.value)}
              placeholder={`Alternativa ${i + 1}`}
            />
            {form.ops.length > 2 && (
              <button type="button" className="btn btn-outline btn-sm" onClick={() => removeOpcion(i)}>
                ×
              </button>
            )}
          </div>
        ))}
        <button type="button" className="btn btn-outline btn-sm" onClick={addOpcion} style={{ marginBottom: 14 }}>
          + Agregar alternativa
        </button>

        <div className="field" style={{ marginBottom: 14 }}>
          <label htmlFor={`pregunta-feedback-${c.id}`}>Feedback (se muestra tras responder)</label>
          <input
            id={`pregunta-feedback-${c.id}`}
            required
            value={form.feedback}
            onChange={(e) => setForm((f) => ({ ...f, feedback: e.target.value }))}
            placeholder="Ej: Correcto: la prioridad es..."
          />
        </div>
        <button className="btn btn-accent" type="submit">
          + Agregar pregunta al banco
        </button>
      </form>

      <div className="divider" />
      <div className="eyebrow">Preguntas cargadas</div>
      {banco.length ? (
        banco.map((p, i) => (
          <div key={i} style={{ padding: '10px 0', borderBottom: i < banco.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>
              {i + 1}. {p.q}
            </div>
            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
              Correcta: {p.ops[p.correcta]}
            </div>
          </div>
        ))
      ) : (
        <div className="muted" style={{ fontSize: 13 }}>
          Este curso aún no tiene preguntas cargadas.
        </div>
      )}
    </div>
  );
}

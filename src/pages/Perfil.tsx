import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, useCurrentUser } from '../context/AppContext';
import { ESCUELAS, escuela } from '../data/mockData';
import { BadgeEstado } from '../components/ui';
import { formatearFechaISO } from '../utils/certificado';
import { leerArchivoComoDataUrl } from '../utils/archivo';
import type { EstadoAsignacion, Usuario } from '../types';

const TAMANO_MAXIMO_ARCHIVO = 3 * 1024 * 1024;

export function Perfil() {
  const u = useCurrentUser();
  const { cursos } = useApp();
  const curso = (id: string) => cursos.find((c) => c.id === id)!;
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
                  {u.cert.length + u.certificadosExternos.length}
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
          <div className="card" style={{ marginBottom: 16 }}>
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
          <CertificadosExternos usuario={u} />
        </div>
      </div>
    </div>
  );
}

const FORM_INICIAL = { nombre: '', institucion: '', fecha: '', codigo: '' };

function CertificadosExternos({ usuario: u }: { usuario: Usuario }) {
  const { addCertificadoExterno, eliminarCertificadoExterno } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(FORM_INICIAL);
  const [archivo, setArchivo] = useState<{ nombre: string; dataUrl: string } | null>(null);
  const [cargandoArchivo, setCargandoArchivo] = useState(false);

  const handleArchivo = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > TAMANO_MAXIMO_ARCHIVO) {
      alert('El archivo es muy pesado para este prototipo (máx. 3 MB).');
      e.target.value = '';
      return;
    }
    setCargandoArchivo(true);
    const dataUrl = await leerArchivoComoDataUrl(file);
    setArchivo({ nombre: file.name, dataUrl });
    setCargandoArchivo(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.institucion.trim() || !form.fecha) return;
    addCertificadoExterno(u.id, {
      nombre: form.nombre.trim(),
      institucion: form.institucion.trim(),
      fecha: formatearFechaISO(form.fecha),
      codigo: form.codigo.trim() || undefined,
      archivoNombre: archivo?.nombre,
      archivoDataUrl: archivo?.dataUrl,
    });
    setForm(FORM_INICIAL);
    setArchivo(null);
    setShowForm(false);
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="eyebrow" style={{ margin: 0 }}>
          Bloque 4 · Certificados externos
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancelar' : '+ Agregar'}
        </button>
      </div>
      <div className="muted" style={{ fontSize: 12.5, margin: '6px 0 0' }}>
        Respalda aquí certificaciones tomadas fuera de Amplifica (mutualidad, ACHS, IST, etc.).
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginTop: 14 }}>
          <div className="divider" />
          <div className="form-grid">
            <div className="field">
              <label htmlFor="ext-nombre">Nombre de la capacitación</label>
              <input
                id="ext-nombre"
                required
                value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                placeholder="Ej: Manejo Manual de Carga"
              />
            </div>
            <div className="field">
              <label htmlFor="ext-institucion">Institución que lo emite</label>
              <input
                id="ext-institucion"
                required
                value={form.institucion}
                onChange={(e) => setForm((f) => ({ ...f, institucion: e.target.value }))}
                placeholder="Ej: Mutual de Seguridad CChC"
              />
            </div>
            <div className="field">
              <label htmlFor="ext-fecha">Fecha de aprobación</label>
              <input
                id="ext-fecha"
                type="date"
                required
                value={form.fecha}
                onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
              />
            </div>
            <div className="field">
              <label htmlFor="ext-codigo">Código del certificado (opcional)</label>
              <input
                id="ext-codigo"
                value={form.codigo}
                onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
                placeholder="Ej: MUT-2026-4471"
              />
            </div>
          </div>
          <div className="field" style={{ marginTop: 12, marginBottom: 4 }}>
            <label htmlFor="ext-archivo">Adjuntar respaldo (PDF o imagen, opcional)</label>
            <input id="ext-archivo" type="file" accept="application/pdf,image/*" onChange={handleArchivo} />
            {cargandoArchivo && <span className="muted" style={{ fontSize: 12 }}>Cargando archivo…</span>}
            {archivo && !cargandoArchivo && (
              <span className="muted" style={{ fontSize: 12 }}>Adjunto: {archivo.nombre}</span>
            )}
          </div>
          <button className="btn btn-accent" type="submit" style={{ marginTop: 10 }}>
            Guardar certificado
          </button>
        </form>
      )}

      <div className="divider" />
      {u.certificadosExternos.length ? (
        u.certificadosExternos.map((cert) => (
          <div className="venc-row" key={cert.id}>
            <span>
              {cert.nombre}
              <span className="muted">
                {' '}
                · {cert.institucion} · {cert.fecha}
                {cert.codigo ? ` · ${cert.codigo}` : ''}
              </span>
            </span>
            <span style={{ display: 'flex', gap: 8 }}>
              {cert.archivoDataUrl && (
                <a
                  className="btn btn-outline btn-sm"
                  href={cert.archivoDataUrl}
                  download={cert.archivoNombre || `${cert.nombre}.pdf`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver archivo
                </a>
              )}
              <button
                className="btn btn-outline btn-sm"
                onClick={() => eliminarCertificadoExterno(u.id, cert.id)}
              >
                Quitar
              </button>
            </span>
          </div>
        ))
      ) : (
        <div className="muted" style={{ fontSize: 13 }}>
          Aún no has respaldado certificados externos.
        </div>
      )}
    </div>
  );
}

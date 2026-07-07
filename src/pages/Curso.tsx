import { Link, useNavigate, useParams } from 'react-router-dom';
import { curso, escuela } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { BadgeEstado, BadgeTipo, Crest } from '../components/ui';

export function CursoPage() {
  const { id = '' } = useParams();
  const { me } = useApp();
  const navigate = useNavigate();
  const c = curso(id);
  const e = escuela(c.escuela);
  const estado = me.asign[c.id];

  return (
    <div data-fade>
      <button className="btn btn-outline btn-sm" style={{ marginBottom: 16 }} onClick={() => navigate('/catalogo')}>
        ← Volver al catálogo
      </button>
      <div className="grid cols-2">
        <div className="card">
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Crest escuela={e} />
            <div>
              <div className="eyebrow">{e.nombre}</div>
              <h1 className="h-title">{c.nombre}</h1>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                <BadgeTipo tipo={c.tipo} /> {estado ? <BadgeEstado estado={estado} /> : null}
                <span className="muted" style={{ fontSize: 13 }}>
                  · {c.duracion} · Nivel {c.nivel}
                </span>
              </div>
            </div>
          </div>
          <div className="divider" />
          <div className="eyebrow">Temario</div>
          {c.modulos.map((m, i) => (
            <div className="module-row" key={i}>
              <div className="dot">{i + 1}</div>
              <div>{m.t}</div>
            </div>
          ))}
          <div className="divider" />
          <Link className="btn btn-accent" to={`/reproductor/${c.id}`}>
            {estado === 'desarrollo' ? 'Continuar curso' : 'Comenzar curso'} →
          </Link>
        </div>
        <div className="card">
          <div className="eyebrow">Responsable de la Escuela</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', margin: '10px 0 16px' }}>
            <div className="avatar" style={{ background: e.color, width: 44, height: 44, fontSize: 15, borderRadius: 12 }}>
              {e.owner.split(' ').map((w) => w[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{e.owner}</div>
              <div className="muted" style={{ fontSize: 12 }}>
                Head-Owner · Escuela de {e.nombre}
              </div>
            </div>
          </div>
          <div className="divider" />
          <div className="eyebrow">Este curso incluye</div>
          <div className="muted" style={{ fontSize: 13, lineHeight: 1.7 }}>
            {c.modulos.length} módulos · {c.quiz ? 'Evaluación de cierre' : 'Sin evaluación en este prototipo'} · Certificado con
            código QR al aprobar
          </div>
        </div>
      </div>
    </div>
  );
}

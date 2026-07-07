import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp, useCurrentUser, useCurso } from '../context/AppContext';
import { iconFor } from '../components/ui';

export function Reproductor() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const me = useCurrentUser();
  const { aprobarCurso } = useApp();
  const c = useCurso(id);
  const [moduloIdx, setModuloIdx] = useState(0);
  const [checklistDone, setChecklistDone] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setModuloIdx(0);
    setChecklistDone({});
  }, [id]);

  const idx = Math.min(moduloIdx, c.modulos.length - 1);
  const m = c.modulos[idx];
  const isLast = idx === c.modulos.length - 1;

  const goToModulo = (next: number) => {
    setModuloIdx(next);
    setChecklistDone({});
  };

  return (
    <div data-fade>
      <button className="btn btn-outline btn-sm" style={{ marginBottom: 16 }} onClick={() => navigate(`/curso/${c.id}`)}>
        ← Volver al curso
      </button>
      <div className="grid cols-2">
        <div>
          <div className="eyebrow">{c.nombre}</div>
          <h2 style={{ marginBottom: 14 }}>{m.t}</h2>

          {m.tipo === 'checklist' ? (
            <div className="card" style={{ textAlign: 'left' }}>
              <div className="eyebrow">Checklist · {m.t}</div>
              {m.items!.map((it, i) => (
                <label className="checklist-item" key={i}>
                  <input
                    type="checkbox"
                    checked={!!checklistDone[i]}
                    onChange={(e) => setChecklistDone((prev) => ({ ...prev, [i]: e.target.checked }))}
                  />
                  <span>{it}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="player-stage">
              <div style={{ fontSize: 34 }}>{iconFor(m.tipo)}</div>
              <div style={{ fontSize: 13, opacity: 0.75 }}>
                {m.tipo === 'video' ? 'Reproduciendo cápsula (simulado)' : 'Visor de documento (simulado)'}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
            <button className="btn btn-outline" disabled={idx === 0} onClick={() => goToModulo(Math.max(0, idx - 1))}>
              ← Anterior
            </button>
            {isLast ? (
              c.quiz ? (
                <button className="btn btn-accent" onClick={() => navigate(`/evaluacion/${c.id}`)}>
                  Ir a la evaluación →
                </button>
              ) : (
                <button
                  className="btn btn-accent"
                  onClick={() => {
                    aprobarCurso(me.id, c.id);
                    navigate(`/certificado/${c.id}`);
                  }}
                >
                  Marcar completado →
                </button>
              )
            ) : (
              <button className="btn btn-primary" onClick={() => goToModulo(idx + 1)}>
                Marcar como visto y continuar →
              </button>
            )}
          </div>
        </div>
        <div className="card">
          <div className="eyebrow">Módulos del curso</div>
          {c.modulos.map((mm, i) => (
            <div className={`module-row${i === idx ? ' active' : ''}${i < idx ? ' done' : ''}`} key={i}>
              <div className="dot">{i < idx ? '✓' : i + 1}</div>
              <div style={{ fontSize: 13.5 }}>{mm.t}</div>
            </div>
          ))}
          <div className="progress" style={{ marginTop: 12 }}>
            <span style={{ width: `${Math.round(((idx + 1) / c.modulos.length) * 100)}%` }} />
          </div>
          <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
            {idx + 1} de {c.modulos.length} módulos
          </div>
        </div>
      </div>
    </div>
  );
}

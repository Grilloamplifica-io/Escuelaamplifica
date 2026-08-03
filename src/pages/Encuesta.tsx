import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp, useCurrentUser, useCurso } from '../context/AppContext';

const ESTRELLAS = [1, 2, 3, 4, 5];

export function Encuesta() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const me = useCurrentUser();
  const { aprobarCurso, responderEncuesta, configEncuesta } = useApp();
  const c = useCurso(id);
  const [puntaje, setPuntaje] = useState(0);
  const [recomendaria, setRecomendaria] = useState<boolean | null>(null);
  const [comentario, setComentario] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = () => {
    if (!puntaje || recomendaria === null) return;
    responderEncuesta(me.id, c.id, { puntaje, recomendaria, comentario: comentario.trim() || undefined });
    aprobarCurso(me.id, c.id);
    setEnviado(true);
  };

  if (enviado) {
    return (
      <div data-fade style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        <div className="card" style={{ background: 'var(--success-bg)', border: 'none' }}>
          <div style={{ fontSize: 34, marginBottom: 8 }}>✓</div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>¡Gracias por tu opinión!</div>
          <div className="muted" style={{ fontSize: 13, marginBottom: 18 }}>
            Nos ayuda a mejorar los próximos cursos.
          </div>
          <button className="btn btn-accent" onClick={() => navigate(`/certificado/${c.id}`)}>
            Ver mi certificado →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div data-fade style={{ maxWidth: 480, margin: '0 auto' }}>
      <div className="eyebrow">{c.nombre}</div>
      <h1 className="h-title" style={{ marginBottom: 4 }}>
        ¿Cómo te fue con este curso?
      </h1>
      <div className="muted" style={{ fontSize: 12.5, marginBottom: 20 }}>
        Responde estas preguntas para obtener tu certificado — toma menos de un minuto.
      </div>

      <div className="card" style={{ textAlign: 'left', marginBottom: 16 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>
          {configEncuesta.preguntaSatisfaccion}
        </div>
        <div style={{ display: 'flex', gap: 8, fontSize: 28 }}>
          {ESTRELLAS.map((n) => (
            <span
              key={n}
              onClick={() => setPuntaje(n)}
              style={{ cursor: 'pointer', color: n <= puntaje ? 'var(--amber)' : 'var(--border)' }}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      <div className="card" style={{ textAlign: 'left', marginBottom: 16 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>
          {configEncuesta.preguntaRecomendacion}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className={`btn btn-sm ${recomendaria === true ? 'btn-accent' : 'btn-outline'}`}
            onClick={() => setRecomendaria(true)}
          >
            Sí
          </button>
          <button
            type="button"
            className={`btn btn-sm ${recomendaria === false ? 'btn-accent' : 'btn-outline'}`}
            onClick={() => setRecomendaria(false)}
          >
            No
          </button>
        </div>
      </div>

      <div className="card" style={{ textAlign: 'left', marginBottom: 20 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>
          Comentario (opcional)
        </div>
        <textarea
          rows={3}
          style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1px solid var(--border)', fontSize: 13.5, fontFamily: 'inherit' }}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder={configEncuesta.preguntaComentario}
        />
      </div>

      <button className="btn btn-primary" style={{ width: '100%' }} disabled={!puntaje || recomendaria === null} onClick={handleSubmit}>
        Enviar y ver certificado →
      </button>
      {(!puntaje || recomendaria === null) && (
        <div className="muted" style={{ fontSize: 12, marginTop: 8, textAlign: 'center' }}>
          Responde ambas preguntas para poder continuar.
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp, useCurrentUser, useCurso } from '../context/AppContext';
import type { PreguntaEncuesta, TipoRespuesta } from '../types';

const ESTRELLAS = [1, 2, 3, 4, 5];

function PreguntaCampo({
  pregunta,
  valor,
  onChange,
}: {
  pregunta: PreguntaEncuesta;
  valor: TipoRespuesta | undefined;
  onChange: (valor: TipoRespuesta) => void;
}) {
  if (pregunta.tipo === 'estrellas') {
    const puntaje = typeof valor === 'number' ? valor : 0;
    return (
      <div style={{ display: 'flex', gap: 8, fontSize: 28 }}>
        {ESTRELLAS.map((n) => (
          <span key={n} onClick={() => onChange(n)} style={{ cursor: 'pointer', color: n <= puntaje ? 'var(--amber)' : 'var(--border)' }}>
            ★
          </span>
        ))}
      </div>
    );
  }
  if (pregunta.tipo === 'si_no') {
    return (
      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" className={`btn btn-sm ${valor === true ? 'btn-accent' : 'btn-outline'}`} onClick={() => onChange(true)}>
          Sí
        </button>
        <button type="button" className={`btn btn-sm ${valor === false ? 'btn-accent' : 'btn-outline'}`} onClick={() => onChange(false)}>
          No
        </button>
      </div>
    );
  }
  return (
    <textarea
      rows={3}
      style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1px solid var(--border)', fontSize: 13.5, fontFamily: 'inherit' }}
      value={typeof valor === 'string' ? valor : ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={pregunta.obligatoria ? undefined : 'Opcional'}
    />
  );
}

function respuestaValida(pregunta: PreguntaEncuesta, valor: TipoRespuesta | undefined): boolean {
  if (!pregunta.obligatoria) return true;
  if (pregunta.tipo === 'texto') return typeof valor === 'string' && valor.trim().length > 0;
  return valor !== undefined && valor !== null;
}

export function Encuesta() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const me = useCurrentUser();
  const { aprobarCurso, responderEncuesta, configEncuesta } = useApp();
  const c = useCurso(id);
  const [respuestas, setRespuestas] = useState<Record<string, TipoRespuesta>>({});
  const [enviado, setEnviado] = useState(false);

  const todasValidas = configEncuesta.preguntas.every((p) => respuestaValida(p, respuestas[p.id]));

  const handleSubmit = () => {
    if (!todasValidas) return;
    responderEncuesta(me.id, c.id, { respuestas });
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

      {configEncuesta.preguntas.map((p) => (
        <div className="card" style={{ textAlign: 'left', marginBottom: 16 }} key={p.id}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            {p.texto}
            {!p.obligatoria && <span className="muted" style={{ textTransform: 'none', fontWeight: 400 }}> (opcional)</span>}
          </div>
          <PreguntaCampo
            pregunta={p}
            valor={respuestas[p.id]}
            onChange={(valor) => setRespuestas((prev) => ({ ...prev, [p.id]: valor }))}
          />
        </div>
      ))}

      <button className="btn btn-primary" style={{ width: '100%' }} disabled={!todasValidas} onClick={handleSubmit}>
        Enviar y ver certificado →
      </button>
      {!todasValidas && (
        <div className="muted" style={{ fontSize: 12, marginTop: 8, textAlign: 'center' }}>
          Responde las preguntas obligatorias para poder continuar.
        </div>
      )}
    </div>
  );
}

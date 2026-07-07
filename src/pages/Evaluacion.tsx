import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { escuela } from '../data/mockData';
import { useCurso } from '../context/AppContext';

export function Evaluacion() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const c = useCurso(id);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
  }, [id]);

  if (!c.quiz) {
    return <div className="empty">Este curso no tiene evaluación configurada en el prototipo.</div>;
  }

  let correctCount = 0;
  if (submitted) {
    c.quiz.forEach((p, qi) => {
      if (answers[qi] === p.correcta) correctCount++;
    });
  }
  const scorePct = submitted ? Math.round((correctCount / c.quiz.length) * 100) : null;
  const aprobado = scorePct !== null && scorePct >= 80;

  return (
    <div data-fade>
      <div className="eyebrow">{escuela(c.escuela).nombre} · Evaluación de cierre</div>
      <h1 className="h-title" style={{ marginBottom: 16 }}>
        {c.nombre}
      </h1>

      {c.quiz.map((p, qi) => {
        const chosen = answers[qi];
        return (
          <div className="card" style={{ marginBottom: 14 }} key={qi}>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>
              {qi + 1}. {p.q}
            </div>
            {p.ops.map((op, oi) => {
              let cls = '';
              if (submitted) {
                if (oi === p.correcta) cls = 'correct';
                else if (oi === chosen) cls = 'incorrect';
              } else if (chosen === oi) {
                cls = 'correct';
              }
              return (
                <div
                  className={`opt ${cls}`}
                  key={oi}
                  onClick={submitted ? undefined : () => setAnswers((prev) => ({ ...prev, [qi]: oi }))}
                >
                  <span>{op}</span>
                </div>
              );
            })}
            {submitted && (
              <div className="muted" style={{ fontSize: 12.5, marginTop: 8 }}>
                {p.feedback}
              </div>
            )}
          </div>
        );
      })}

      {!submitted ? (
        <button
          className="btn btn-primary"
          disabled={Object.keys(answers).length < c.quiz.length}
          onClick={() => setSubmitted(true)}
        >
          Enviar evaluación
        </button>
      ) : (
        <div
          className="card"
          style={{ textAlign: 'center', background: aprobado ? 'var(--success-bg)' : 'var(--danger-bg)', border: 'none' }}
        >
          <div className="display" style={{ fontSize: 22, color: aprobado ? 'var(--success)' : 'var(--danger)' }}>
            {aprobado ? '¡Aprobado!' : 'Aún no aprueba'} · {scorePct}%
          </div>
          <div className="muted" style={{ margin: '6px 0 14px' }}>
            Puntaje mínimo de aprobación: 80%
          </div>
          {aprobado ? (
            <button className="btn btn-accent" onClick={() => navigate(`/certificado/${c.id}`)}>
              Ver mi certificado →
            </button>
          ) : (
            <button
              className="btn btn-outline"
              onClick={() => {
                setAnswers({});
                setSubmitted(false);
              }}
            >
              Reintentar evaluación
            </button>
          )}
        </div>
      )}
    </div>
  );
}

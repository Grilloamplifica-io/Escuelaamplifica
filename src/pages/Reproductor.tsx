import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp, useCurrentUser, useCurso } from '../context/AppContext';
import { iconFor } from '../components/ui';
import { esArchivoDeVideoDirecto, idDeYoutube, urlEmbebida } from '../utils/embedUrl';

const SEGUNDOS_MINIMOS_VIDEO_SIMULADO = 8;

declare global {
  interface Window {
    YT?: { Player: new (el: string, opts: unknown) => { destroy: () => void }; PlayerState: { ENDED: number } };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export function Reproductor() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const me = useCurrentUser();
  const { aprobarCurso } = useApp();
  const c = useCurso(id);
  const [moduloIdx, setModuloIdx] = useState(0);
  const [checklistDone, setChecklistDone] = useState<Record<number, boolean>>({});
  const [videoListo, setVideoListo] = useState(false);
  const [segundosRestantes, setSegundosRestantes] = useState(0);

  useEffect(() => {
    setModuloIdx(0);
    setChecklistDone({});
  }, [id]);

  const idx = Math.min(moduloIdx, c.modulos.length - 1);
  const m = c.modulos[idx];
  const isLast = idx === c.modulos.length - 1;
  const ytId = m.tipo === 'video' && m.archivoUrl ? idDeYoutube(m.archivoUrl) : null;
  const esVideoDirecto = m.tipo === 'video' && !!m.archivoUrl && esArchivoDeVideoDirecto(m.archivoUrl);

  const goToModulo = (next: number) => {
    setModuloIdx(next);
    setChecklistDone({});
  };

  // Cada módulo de video exige haberlo visto completo antes de habilitar "continuar"/
  // "completado". Para un archivo real usamos el evento onEnded; para YouTube, la
  // IFrame Player API; para cualquier otro caso (Drive u modo simulado, donde no hay
  // forma de saber si realmente se vio) exigimos al menos unos segundos en la pantalla.
  useEffect(() => {
    setVideoListo(m.tipo !== 'video');
    if (m.tipo !== 'video') return;

    if (esVideoDirecto) return; // se resuelve con el onEnded del <video>

    if (ytId) {
      let player: { destroy: () => void } | undefined;
      let cancelado = false;
      const contenedorId = `yt-player-${idx}`;
      const crearPlayer = () => {
        if (cancelado || !window.YT) return;
        player = new window.YT.Player(contenedorId, {
          videoId: ytId,
          events: {
            onStateChange: (e: { data: number }) => {
              if (window.YT && e.data === window.YT.PlayerState.ENDED) setVideoListo(true);
            },
          },
        });
      };
      if (window.YT?.Player) {
        crearPlayer();
      } else {
        const previo = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          previo?.();
          crearPlayer();
        };
        if (!document.getElementById('youtube-iframe-api')) {
          const tag = document.createElement('script');
          tag.id = 'youtube-iframe-api';
          tag.src = 'https://www.youtube.com/iframe_api';
          document.body.appendChild(tag);
        }
      }
      return () => {
        cancelado = true;
        player?.destroy();
      };
    }

    // Drive u otro link no verificable, o modo simulado sin link: gate por tiempo mínimo.
    setSegundosRestantes(SEGUNDOS_MINIMOS_VIDEO_SIMULADO);
    const interval = setInterval(() => {
      setSegundosRestantes((s) => {
        if (s <= 1) {
          clearInterval(interval);
          setVideoListo(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, m.tipo, m.archivoUrl]);

  const puedeAvanzar = m.tipo !== 'video' || videoListo;

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
          ) : m.tipo === 'video' && esVideoDirecto ? (
            <video
              key={idx}
              src={m.archivoUrl}
              controls
              onEnded={() => setVideoListo(true)}
              style={{ width: '100%', borderRadius: 12, background: '#000' }}
            />
          ) : m.tipo === 'video' && ytId ? (
            <div id={`yt-player-${idx}`} style={{ width: '100%', height: 340, borderRadius: 12, overflow: 'hidden' }} />
          ) : m.tipo === 'video' && m.archivoUrl ? (
            <div>
              <iframe
                src={urlEmbebida(m.archivoUrl)}
                title={m.t}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                style={{ width: '100%', height: 340, border: 'none', borderRadius: 12 }}
              />
              {!videoListo && (
                <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
                  Podrás continuar en {segundosRestantes}s (no se puede confirmar automáticamente que este tipo de
                  link se vio completo).
                </div>
              )}
            </div>
          ) : m.tipo === 'pdf' && m.archivoUrl ? (
            <div>
              <iframe
                src={urlEmbebida(m.archivoUrl)}
                title={m.t}
                style={{ width: '100%', height: 460, border: '1px solid var(--border)', borderRadius: 12 }}
              />
              <a href={m.archivoUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ marginTop: 10 }}>
                Abrir en pestaña nueva
              </a>
            </div>
          ) : (
            <div className="player-stage">
              <div style={{ fontSize: 34 }}>{iconFor(m.tipo)}</div>
              <div style={{ fontSize: 13, opacity: 0.75 }}>
                {m.tipo === 'video' ? 'Reproduciendo cápsula (simulado)' : 'Visor de documento (simulado)'}
              </div>
              {m.tipo === 'video' && !videoListo && (
                <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
                  Podrás continuar en {segundosRestantes}s
                </div>
              )}
            </div>
          )}

          {m.tipo === 'video' && !videoListo && (
            <div className="muted" style={{ fontSize: 12.5, marginTop: 10 }}>
              Debes terminar de ver el video para poder continuar.
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
            <button className="btn btn-outline" disabled={idx === 0} onClick={() => goToModulo(Math.max(0, idx - 1))}>
              ← Anterior
            </button>
            {isLast ? (
              c.quiz ? (
                <button className="btn btn-accent" disabled={!puedeAvanzar} onClick={() => navigate(`/evaluacion/${c.id}`)}>
                  Ir a la evaluación →
                </button>
              ) : (
                <button
                  className="btn btn-accent"
                  disabled={!puedeAvanzar}
                  onClick={() => {
                    aprobarCurso(me.id, c.id);
                    navigate(`/certificado/${c.id}`);
                  }}
                >
                  Marcar completado →
                </button>
              )
            ) : (
              <button className="btn btn-primary" disabled={!puedeAvanzar} onClick={() => goToModulo(idx + 1)}>
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

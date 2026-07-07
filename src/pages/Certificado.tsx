import { useNavigate, useParams } from 'react-router-dom';
import { curso, escuela } from '../data/mockData';
import { useApp } from '../context/AppContext';

export function Certificado() {
  const { id = '' } = useParams();
  const { me: u } = useApp();
  const navigate = useNavigate();
  const c = curso(id);
  const codigo = 'AMP-' + id.toUpperCase() + '-DEMO';

  let qrCells = [];
  for (let i = 0; i < 49; i++) {
    const on = (i * 7 + id.length * 3 + (i % 5)) % 3 !== 0;
    qrCells.push(<span className={on ? '' : 'off'} key={i} />);
  }

  return (
    <div data-fade style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="cert">
        <div className="cert-top">
          <div className="display" style={{ fontSize: 15, letterSpacing: 1, textTransform: 'uppercase' }}>
            Academia Amplifica
          </div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>Certificado de aprobación</div>
        </div>
        <div className="cert-body">
          <div className="muted" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.4 }}>
            Se certifica que
          </div>
          <div className="cert-name">{u.nombre}</div>
          <div className="muted" style={{ marginBottom: 18 }}>
            aprobó el curso
          </div>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{c.nombre}</div>
          <div className="muted" style={{ fontSize: 13, marginBottom: 24 }}>
            Escuela de {escuela(c.escuela).nombre} · {c.tipo === 'normativo' ? 'Vigencia anual' : 'Sin vencimiento'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 26, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="qr">{qrCells}</div>
            <div style={{ textAlign: 'left' }}>
              <div className="muted" style={{ fontSize: 11, textTransform: 'uppercase' }}>
                Código de validación
              </div>
              <div className="mono" style={{ fontSize: 14, marginBottom: 8 }}>
                {codigo}
              </div>
              <div className="muted" style={{ fontSize: 11, textTransform: 'uppercase' }}>
                Verificar en
              </div>
              <div className="mono" style={{ fontSize: 12.5 }}>
                amplifica.io/verificar/{codigo}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: 18 }}>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/perfil')}>
          Ver mis certificados
        </button>
      </div>
    </div>
  );
}

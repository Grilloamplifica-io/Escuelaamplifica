import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function Login() {
  const { login, isAuthenticated, sincronizando } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [rut, setRut] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (sincronizando) {
      setError('Todavía estamos sincronizando los datos, espera un momento e intenta de nuevo.');
      return;
    }
    const usuario = login(rut, clave);
    if (!usuario) {
      setError('RUT o clave incorrectos.');
      return;
    }
    const from = (location.state as { from?: Location } | null)?.from?.pathname || '/';
    navigate(from, { replace: true });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, var(--navy), var(--navy-2))',
        padding: 16,
      }}
    >
      <div className="card" style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: 3,
              background: 'var(--amber)',
              display: 'inline-block',
              transform: 'rotate(45deg)',
            }}
          />
          <span className="brand-title" style={{ color: 'var(--ink)' }}>
            Amplifica Academy
          </span>
        </div>
        <div className="muted" style={{ textAlign: 'center', fontSize: 12.5, marginBottom: 22 }}>
          Ingresa a Amplifica Academy
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field" style={{ marginBottom: 14 }}>
            <label htmlFor="rut">RUT</label>
            <input
              id="rut"
              autoFocus
              required
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              placeholder="Ej: 11.111.111-1"
            />
          </div>
          <div className="field" style={{ marginBottom: 14 }}>
            <label htmlFor="clave">Clave</label>
            <input
              id="clave"
              type="password"
              required
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              placeholder="4 primeros dígitos de tu RUT"
            />
          </div>
          {error && (
            <div style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 12 }}>{error}</div>
          )}
          {sincronizando && !error && (
            <div className="muted" style={{ fontSize: 12.5, marginBottom: 12 }}>
              Sincronizando datos…
            </div>
          )}
          <button
            className="btn btn-primary"
            type="submit"
            disabled={sincronizando}
            style={{ width: '100%', justifyContent: 'center', opacity: sincronizando ? 0.6 : 1 }}
          >
            Ingresar
          </button>
        </form>

        <div className="muted" style={{ fontSize: 11.5, marginTop: 16, textAlign: 'center', lineHeight: 1.5 }}>
          Tu clave inicial son los primeros 4 dígitos de tu RUT.
        </div>
      </div>
    </div>
  );
}

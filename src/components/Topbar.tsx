import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp, useCurrentUser } from '../context/AppContext';
import logoAmplifica from '../assets/brand/logo.png';
import { RUT_ADMINISTRADOR } from '../config/admin';
import { mismoRut } from '../utils/rut';

function titleForPath(pathname: string): string {
  if (pathname === '/') return 'Home';
  if (pathname.startsWith('/catalogo')) return 'Catálogo';
  if (pathname.startsWith('/curso/')) return 'Curso';
  if (pathname.startsWith('/reproductor/')) return 'Reproductor';
  if (pathname.startsWith('/evaluacion/')) return 'Evaluación';
  if (pathname.startsWith('/encuesta/')) return 'Encuesta de satisfacción';
  if (pathname.startsWith('/certificado/')) return 'Certificado';
  if (pathname.startsWith('/perfil')) return 'Mi perfil';
  if (pathname.startsWith('/equipo')) return 'Dashboard de equipo';
  if (pathname.startsWith('/admin')) return 'Administración';
  return '';
}

export function Topbar() {
  const { currentUserId, setCurrentUserId, users, device, toggleDevice, logout } = useApp();
  const me = useCurrentUser();
  const esAdministrador = mismoRut(me.rut, RUT_ADMINISTRADOR);
  const location = useLocation();
  const navigate = useNavigate();

  const usuariosOrdenados = useMemo(
    () => Object.values(users).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })),
    [users],
  );

  return (
    <div id="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <img src={logoAmplifica} alt="Amplifica" style={{ height: 20, width: 'auto' }} />
        <div className="crumb">
          Amplifica Academy / <b>{titleForPath(location.pathname)}</b>
        </div>
      </div>
      <div className="topbar-right">
        {esAdministrador ? (
          <select
            className="picker"
            value={currentUserId ?? ''}
            onChange={(e) => {
              setCurrentUserId(e.target.value);
              navigate('/');
            }}
          >
            {usuariosOrdenados.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre} — {u.cargo}
              </option>
            ))}
          </select>
        ) : (
          <span className="muted" style={{ fontSize: 12.5 }}>
            {me.nombre} — {me.cargo}
          </span>
        )}
        <button
          className={`icon-btn${device === 'mobile' ? ' on' : ''}`}
          title="Vista móvil (bodega)"
          onClick={toggleDevice}
        >
          📱
        </button>
        <button className="icon-btn" title="Notificaciones">
          🔔
        </button>
        <button
          className="icon-btn"
          title="Cerrar sesión"
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          🚪
        </button>
      </div>
    </div>
  );
}

import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import logoAmplifica from '../assets/brand/logo.png';

function titleForPath(pathname: string): string {
  if (pathname === '/') return 'Home';
  if (pathname.startsWith('/catalogo')) return 'Catálogo';
  if (pathname.startsWith('/curso/')) return 'Curso';
  if (pathname.startsWith('/reproductor/')) return 'Reproductor';
  if (pathname.startsWith('/evaluacion/')) return 'Evaluación';
  if (pathname.startsWith('/certificado/')) return 'Certificado';
  if (pathname.startsWith('/perfil')) return 'Mi perfil';
  if (pathname.startsWith('/equipo')) return 'Dashboard de equipo';
  if (pathname.startsWith('/admin')) return 'Administración';
  return '';
}

export function Topbar() {
  const { currentUserId, setCurrentUserId, users, device, toggleDevice, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div id="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <img src={logoAmplifica} alt="Amplifica" style={{ height: 20, width: 'auto' }} />
        <div className="crumb">
          Academia Corporativa / <b>{titleForPath(location.pathname)}</b>
        </div>
      </div>
      <div className="topbar-right">
        <select
          className="picker"
          value={currentUserId ?? ''}
          onChange={(e) => {
            setCurrentUserId(e.target.value);
            navigate('/');
          }}
        >
          {Object.values(users).map((u) => (
            <option key={u.id} value={u.id}>
              {u.nombre} — {u.cargo}
            </option>
          ))}
        </select>
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

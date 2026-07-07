import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { USERS } from '../data/mockData';

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
  const { currentUserId, setCurrentUserId, device, toggleDevice } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div id="topbar">
      <div className="crumb">
        Academia Amplifica / <b>{titleForPath(location.pathname)}</b>
      </div>
      <div className="topbar-right">
        <select
          className="picker"
          value={currentUserId}
          onChange={(e) => {
            setCurrentUserId(e.target.value);
            navigate('/');
          }}
        >
          {Object.values(USERS).map((u) => (
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
      </div>
    </div>
  );
}

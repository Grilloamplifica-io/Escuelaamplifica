import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '../nav';
import { useCurrentUser } from '../context/AppContext';

export function Sidebar() {
  const me = useCurrentUser();
  const items = NAV_ITEMS.filter((i) => !i.roles || i.roles.includes(me.rol));

  return (
    <aside id="sidebar">
      <div className="brand">
        <span className="mark" />
        <div>
          <div className="brand-title">Amplifica Academy</div>
          <div className="brand-sub">Plataforma de Capacitación</div>
        </div>
      </div>
      <div className="navgroup-label">Navegación</div>
      {items.map((i) => (
        <NavLink
          key={i.path}
          to={i.path}
          end={i.path === '/'}
          className={({ isActive }) => `navitem${isActive ? ' active' : ''}`}
        >
          <span className="ico">{i.ico}</span> {i.label}
        </NavLink>
      ))}
      <div className="sidebar-foot">
        Prototipo de la Plataforma de
        <br />
        Capacitación Amplifica · PRD Julio 2026
      </div>
    </aside>
  );
}

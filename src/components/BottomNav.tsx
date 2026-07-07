import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '../nav';
import { useCurrentUser } from '../context/AppContext';

export function BottomNav() {
  const me = useCurrentUser();
  const items = NAV_ITEMS.filter((i) => !i.roles || i.roles.includes(me.rol));

  return (
    <nav id="bottomnav">
      {items.map((i) => (
        <NavLink
          key={i.path}
          to={i.path}
          end={i.path === '/'}
          className={({ isActive }) => `navitem${isActive ? ' active' : ''}`}
        >
          <span className="ico">{i.ico}</span>
          {i.label}
        </NavLink>
      ))}
    </nav>
  );
}

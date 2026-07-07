import { Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Topbar } from './Topbar';

export function Shell() {
  const { device } = useApp();

  return (
    <div id="shell" className={device === 'mobile' ? 'mobile-preview' : ''}>
      <Sidebar />
      <div id="main">
        <Topbar />
        <div id="view">
          <Outlet />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

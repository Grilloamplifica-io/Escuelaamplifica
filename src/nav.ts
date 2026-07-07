import type { Rol } from './types';

export interface NavItem {
  path: string;
  label: string;
  ico: string;
  roles?: Rol[];
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Home', ico: '⌂' },
  { path: '/catalogo', label: 'Catálogo', ico: '▣' },
  { path: '/perfil', label: 'Mi perfil', ico: '◎' },
  { path: '/equipo', label: 'Equipo', ico: '▤', roles: ['lider', 'people'] },
  { path: '/admin', label: 'Administración', ico: '⚙', roles: ['people'] },
];

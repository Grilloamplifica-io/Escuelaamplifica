import { useMemo, useState } from 'react';
import { escuela } from '../data/mockData';
import { useApp, useCurrentUser } from '../context/AppContext';
import { Crest, CourseCard } from '../components/ui';
import type { Curso, CursoTipo } from '../types';

const DIACRITICOS_CATALOGO = new RegExp('[\\u0300-\\u036f]', 'g');
function normalizarTexto(valor: string): string {
  return valor.toLowerCase().normalize('NFD').replace(DIACRITICOS_CATALOGO, '');
}

type Filtro = 'todos' | CursoTipo;

export function Catalogo() {
  const { cursos } = useApp();
  const me = useCurrentUser();
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');

  const todosCursos = useMemo(() => cursos.filter((c) => !!me.asign[c.id]), [cursos, me.asign]);

  const cursosFiltrados = useMemo(() => {
    const termino = normalizarTexto(busqueda.trim());
    return todosCursos.filter((c) => {
      if (filtro !== 'todos' && c.tipo !== filtro) return false;
      if (!termino) return true;
      return [c.nombre, escuela(c.escuela).nombre].some((v) => normalizarTexto(v).includes(termino));
    });
  }, [todosCursos, busqueda, filtro]);

  const grupos: Record<string, Curso[]> = {};
  cursosFiltrados.forEach((c) => {
    (grupos[c.escuela] = grupos[c.escuela] || []).push(c);
  });

  return (
    <div data-fade>
      <h1 className="h-title">Catálogo de la Academia</h1>
      <div className="muted" style={{ margin: '6px 0 20px' }}>
        Organizado por Escuela — cada módulo pertenece a un área específica del negocio.
      </div>
      <div className="search-bar">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar curso, escuela o palabra clave…"
        />
        <div className={`chip${filtro === 'todos' ? ' active' : ''}`} onClick={() => setFiltro('todos')}>
          Todos
        </div>
        <div className={`chip${filtro === 'normativo' ? ' active' : ''}`} onClick={() => setFiltro('normativo')}>
          Normativo
        </div>
        <div className={`chip${filtro === 'interna' ? ' active' : ''}`} onClick={() => setFiltro('interna')}>
          Interna
        </div>
      </div>
      {Object.keys(grupos).length === 0 && (
        <div className="empty">
          {todosCursos.length === 0
            ? 'Todavía no tienes cursos habilitados. Cuando te asignen uno, aparecerá aquí.'
            : 'No hay cursos que calcen con la búsqueda o filtro elegido.'}
        </div>
      )}
      {Object.entries(grupos).map(([eid, cursos]) => {
        const e = escuela(eid);
        return (
          <div className="escuela-row" key={eid}>
            <div className="escuela-row-head">
              <Crest escuela={e} />
              <div className="h4 display">{e.nombre}</div>
              <div className="muted" style={{ fontSize: 12.5 }}>
                Owner: {e.owner}
              </div>
            </div>
            <div className="hscroll">
              {cursos.map((c) => (
                <CourseCard curso={c} key={c.id} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

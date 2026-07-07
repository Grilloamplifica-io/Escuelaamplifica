import { escuela } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { Crest, CourseCard } from '../components/ui';
import type { Curso } from '../types';

export function Catalogo() {
  const { cursos: todosCursos } = useApp();
  const grupos: Record<string, Curso[]> = {};
  todosCursos.forEach((c) => {
    (grupos[c.escuela] = grupos[c.escuela] || []).push(c);
  });

  return (
    <div data-fade>
      <h1 className="h-title">Catálogo de la Academia</h1>
      <div className="muted" style={{ margin: '6px 0 20px' }}>
        Organizado por Escuela — cada módulo pertenece a un área específica del negocio.
      </div>
      <div className="search-bar">
        <input placeholder="Buscar curso, escuela o palabra clave…" />
        <div className="chip active">Todos</div>
        <div className="chip">Normativo</div>
        <div className="chip">Interna</div>
      </div>
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

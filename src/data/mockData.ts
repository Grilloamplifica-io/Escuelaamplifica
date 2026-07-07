import type { Curso, Escuela, MiembroEquipo, Regla, Usuario } from '../types';

export const ESCUELAS: Escuela[] = [
  { id: 'com', nombre: 'Comercial', ini: 'CO', color: '#2952E3', owner: 'Head Comercial' },
  { id: 'ope', nombre: 'Operaciones', ini: 'OP', color: '#57708C', owner: 'Osvaldo Salinas' },
  { id: 'per', nombre: 'Personas', ini: 'PE', color: '#7C5CBF', owner: 'Head of People' },
  { id: 'cul', nombre: 'Cultura', ini: 'CU', color: '#C99A2E', owner: 'Head of People / CEO' },
  { id: 'tec', nombre: 'Tecnología', ini: 'TI', color: '#2FA8A0', owner: 'Head de Tecnología' },
  { id: 'mkt', nombre: 'Marketing', ini: 'MK', color: '#E0685A', owner: 'Head de Marketing' },
  { id: 'pro', nombre: 'Producto', ini: 'PR', color: '#2952E3', owner: 'Product Manager' },
  { id: 'cs', nombre: 'Customer Success', ini: 'CS', color: '#2FA8A0', owner: 'Head de Customer Success' },
  { id: 'fin', nombre: 'Finanzas', ini: 'FI', color: '#57708C', owner: 'Head de Finanzas' },
  { id: 'pdr', nombre: 'Prevención de Riesgos', ini: 'PDR', color: '#D64545', owner: 'Encargado(a) de Prevención' },
  { id: 'lid', nombre: 'Liderazgo', ini: 'LI', color: '#C99A2E', owner: 'Head of People' },
];

export function escuela(id: string): Escuela {
  const e = ESCUELAS.find((e) => e.id === id);
  if (!e) throw new Error(`Escuela no encontrada: ${id}`);
  return e;
}

export const CURSOS: Curso[] = [
  {
    id: 'c1', escuela: 'cul', nombre: 'Onboarding Amplifica', tipo: 'interna', duracion: '45 min', nivel: 'Bienvenida',
    modulos: [
      { t: 'Bienvenida a Amplifica', tipo: 'video' },
      { t: 'Nuestra historia y propósito', tipo: 'video' },
      { t: 'Cómo trabajamos', tipo: 'pdf' },
    ],
  },
  {
    id: 'c2', escuela: 'pdr', nombre: 'Ley Karin: Prevención y Actuación', tipo: 'normativo', duracion: '40 min', nivel: 'Fundamentos',
    modulos: [
      { t: '¿Qué es la Ley Karin?', tipo: 'video' },
      { t: 'Cómo reconocer una situación', tipo: 'video' },
      { t: 'Cómo denunciar', tipo: 'pdf' },
    ],
    quiz: [
      {
        q: '¿Qué protege principalmente la Ley Karin?',
        ops: ['El acoso laboral, sexual y la violencia en el trabajo', 'Los horarios de colación', 'El uso de EPP en bodega'],
        correcta: 0,
        feedback: 'Correcto: la Ley Karin regula la prevención, investigación y sanción del acoso laboral y sexual, y la violencia en el trabajo.',
      },
      {
        q: 'Si presencias una situación de acoso, ¿qué debes hacer primero?',
        ops: ['Resolverlo directamente con la otra persona sin informar a nadie', 'Denunciarlo por el canal formal definido por la empresa', 'Esperar a que la persona afectada actúe sola'],
        correcta: 1,
        feedback: 'Correcto: toda situación debe canalizarse por el conducto formal de denuncia, para asegurar registro e investigación.',
      },
      {
        q: '¿Quién puede presentar una denuncia por Ley Karin?',
        ops: ['Solo la persona afectada directamente', 'La persona afectada o quien tenga conocimiento de los hechos', 'Solo un representante sindical'],
        correcta: 1,
        feedback: 'Correcto: puede denunciar la persona afectada o cualquiera que tenga conocimiento de los hechos.',
      },
      {
        q: '¿Cuál es el plazo legal para que la empresa investigue una denuncia por Ley Karin?',
        ops: ['30 días corridos', '10 días hábiles', 'No existe plazo legal'],
        correcta: 0,
        feedback: 'Correcto: la empresa tiene un plazo de 30 días corridos para investigar y remitir el caso a la Dirección del Trabajo.',
      },
      {
        q: '¿La denuncia por Ley Karin puede ser confidencial?',
        ops: ['No, siempre debe ser pública', 'Sí, debe resguardarse la confidencialidad de todas las partes', 'Solo si lo pide el gerente'],
        correcta: 1,
        feedback: 'Correcto: el proceso debe resguardar la confidencialidad de todas las partes involucradas.',
      },
      {
        q: '¿Qué medida NO corresponde tomar mientras se investiga una denuncia?',
        ops: ['Separar a las partes si es necesario', 'Exponer públicamente la denuncia entre compañeros', 'Mantener la reserva del proceso'],
        correcta: 1,
        feedback: 'Correcto: exponer la denuncia públicamente vulnera la confidencialidad y puede constituir una nueva falta.',
      },
    ],
  },
  {
    id: 'c3', escuela: 'pdr', nombre: 'Seguridad en Bodega: EPP y Rutas de Evacuación', tipo: 'normativo', duracion: '25 min', nivel: 'Fundamentos',
    modulos: [
      { t: 'Elementos de Protección Personal', tipo: 'video' },
      { t: 'Rutas de evacuación de tu sucursal', tipo: 'pdf' },
      {
        t: 'Qué hacer ante una emergencia', tipo: 'checklist', items: [
          'Conozco la ruta de evacuación de mi sector',
          'Sé dónde está el punto de encuentro',
          'Sé dónde están los extintores de mi área',
        ],
      },
    ],
    quiz: [
      {
        q: '¿Cuál es el primer paso ante una alarma de evacuación?',
        ops: ['Terminar la tarea que tengo en curso', 'Dirigirme de inmediato a la ruta de evacuación de mi sector', 'Buscar mis pertenencias personales'],
        correcta: 1,
        feedback: 'Correcto: ante la alarma, la prioridad es dirigirse de inmediato a la ruta de evacuación, sin detenerse a terminar tareas.',
      },
      {
        q: '¿Qué elemento de protección personal es obligatorio al operar una grúa horquilla?',
        ops: ['Casco y chaleco reflectante', 'Solo guantes', 'Ninguno si es un trayecto corto'],
        correcta: 0,
        feedback: 'Correcto: casco y chaleco reflectante son obligatorios al operar o circular cerca de una grúa horquilla.',
      },
      {
        q: '¿Qué debes hacer si el extintor de tu área está descargado?',
        ops: ['Usarlo igual en caso de emergencia', 'Reportarlo de inmediato a tu supervisor', 'Esperar a la próxima revisión programada'],
        correcta: 1,
        feedback: 'Correcto: cualquier anomalía en un extintor debe reportarse de inmediato, sin esperar la revisión periódica.',
      },
      {
        q: '¿Dónde debes dirigirte después de evacuar tu sector?',
        ops: ['A tu vehículo para retirarte', 'Al punto de encuentro designado', 'A buscar tus pertenencias personales'],
        correcta: 1,
        feedback: 'Correcto: siempre debes dirigirte al punto de encuentro designado para el conteo de personal.',
      },
      {
        q: '¿Qué corresponde hacer si detectas un riesgo de accidente en tu área (ej. un cable suelto)?',
        ops: ['Ignorarlo si no es tu tarea', 'Reportarlo de inmediato aunque no sea tu área', 'Esperar a que otra persona lo note'],
        correcta: 1,
        feedback: 'Correcto: todo riesgo detectado debe reportarse de inmediato, sin importar si corresponde a tu área de trabajo.',
      },
    ],
  },
  {
    id: 'c4', escuela: 'ope', nombre: 'Fundamentos de Picking y Packing', tipo: 'interna', duracion: '55 min', nivel: 'Fundamentos',
    modulos: [
      { t: 'El flujo logístico B2B y B2C', tipo: 'video' },
      { t: 'Picking: buenas prácticas', tipo: 'video' },
      { t: 'Packing y control de calidad', tipo: 'video' },
      { t: 'Checklist de cierre de turno', tipo: 'checklist', items: ['Zona de trabajo ordenada', 'Pedidos del turno escaneados', 'Incidencias registradas'] },
    ],
  },
  {
    id: 'c5', escuela: 'com', nombre: 'Manejo de Objeciones en Venta B2B', tipo: 'interna', duracion: '35 min', nivel: 'Especialización',
    modulos: [
      { t: 'Objeciones más comunes', tipo: 'video' },
      { t: 'Técnica de respuesta', tipo: 'video' },
      { t: 'Casos prácticos', tipo: 'pdf' },
    ],
  },
  {
    id: 'c6', escuela: 'mkt', nombre: 'Storytelling de Marca Amplifica', tipo: 'interna', duracion: '30 min', nivel: 'Fundamentos',
    modulos: [{ t: 'La voz de marca Amplifica', tipo: 'video' }, { t: 'Ejemplos aplicados', tipo: 'pdf' }],
  },
  {
    id: 'c7', escuela: 'lid', nombre: 'Nuevo Líder: Primeros 90 Días', tipo: 'interna', duracion: '50 min', nivel: 'Liderazgo',
    modulos: [{ t: 'De colaborador a líder', tipo: 'video' }, { t: 'Tus primeras conversaciones 1:1', tipo: 'video' }, { t: 'Errores comunes al liderar', tipo: 'pdf' }],
  },
  {
    id: 'c8', escuela: 'fin', nombre: 'Cómo Gana Dinero Amplifica', tipo: 'interna', duracion: '20 min', nivel: 'Fundamentos',
    modulos: [{ t: 'El modelo de negocio', tipo: 'video' }, { t: 'KPIs financieros clave', tipo: 'pdf' }],
  },
  {
    id: 'c9', escuela: 'cs', nombre: 'Ciclo de Vida del Cliente', tipo: 'interna', duracion: '25 min', nivel: 'Fundamentos',
    modulos: [{ t: 'De onboarding a renovación', tipo: 'video' }, { t: 'Señales de riesgo de fuga', tipo: 'video' }],
  },
];

export const USERS: Record<string, Usuario> = {
  u1: {
    id: 'u1', nombre: 'Camila Soto', cargo: 'Analista Comercial', rol: 'colaborador', contexto: 'oficina', escuela: 'com', color: '#2952E3',
    rut: '11.111.111-1',
    asign: { c1: 'aprobado', c5: 'desarrollo', c2: 'pendiente', c6: 'aprobado' },
    progreso: { c5: 60 },
    cert: [{ cursoId: 'c1', codigo: 'AMP-9K2L-0091', fecha: '12 may 2026' }, { cursoId: 'c6', codigo: 'AMP-7T4Q-0142', fecha: '02 jun 2026' }],
    certificadosExternos: [],
  },
  u2: {
    id: 'u2', nombre: 'Luis Paredes', cargo: 'Operario de Bodega', rol: 'colaborador', contexto: 'bodega', escuela: 'ope', color: '#57708C',
    rut: '22.222.222-2',
    asign: { c1: 'aprobado', c3: 'pendiente', c4: 'desarrollo', c2: 'aprobado' },
    progreso: { c4: 40 },
    cert: [{ cursoId: 'c1', codigo: 'AMP-3B7X-0055', fecha: '03 may 2026' }, { cursoId: 'c2', codigo: 'AMP-1M9D-0076', fecha: '20 may 2026' }],
    certificadosExternos: [
      { id: 'ext-1', nombre: 'Manejo Manual de Carga', institucion: 'Mutual de Seguridad CChC', fecha: '15 mar 2026', codigo: 'MUT-2026-4471' },
    ],
  },
  u3: {
    id: 'u3', nombre: 'Daniela Vidal', cargo: 'Jefa de Sucursal', rol: 'lider', contexto: 'oficina', escuela: 'ope', color: '#C99A2E',
    rut: '33.333.333-3',
    asign: { c1: 'aprobado', c2: 'aprobado', c7: 'desarrollo' },
    progreso: { c7: 20 },
    cert: [{ cursoId: 'c1', codigo: 'AMP-5H1C-0032', fecha: '28 abr 2026' }],
    certificadosExternos: [],
  },
  u4: {
    id: 'u4', nombre: 'Rosangel Rincón', cargo: 'People Partner', rol: 'people', contexto: 'oficina', escuela: 'per', color: '#7C5CBF',
    rut: '44.444.444-4',
    asign: { c1: 'aprobado', c2: 'aprobado' },
    progreso: {},
    cert: [],
    certificadosExternos: [],
  },
};

export const EQUIPO_DANIELA: MiembroEquipo[] = [
  { nombre: 'Luis Paredes', cumplimiento: 72, pendientes: 1 },
  { nombre: 'Patricia Vera', cumplimiento: 95, pendientes: 0 },
  { nombre: 'Jorge Muñoz', cumplimiento: 48, pendientes: 2 },
];

export const REGLAS: Regla[] = [
  { id: 'r1', rol: 'lider', escuela: 'lid' },
  { id: 'r2', rol: 'people', escuela: 'per' },
];

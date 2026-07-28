import { DB_URL, obtenerIdToken } from '../config/firebase';

const RUTA = 'academia';

export async function cargarRemoto<T>(): Promise<T | null> {
  try {
    const token = await obtenerIdToken();
    const r = await fetch(`${DB_URL}/${RUTA}.json?auth=${token}&nocache=${Date.now()}`);
    if (!r.ok) return null;
    const datos = await r.json();
    return (datos ?? null) as T | null;
  } catch (e) {
    console.error('cargarRemoto:', e);
    return null;
  }
}

export async function guardarRemoto(datos: unknown): Promise<void> {
  try {
    const token = await obtenerIdToken();
    const r = await fetch(`${DB_URL}/${RUTA}.json?auth=${token}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
    if (!r.ok) console.error('guardarRemoto: HTTP', r.status, await r.text());
  } catch (e) {
    console.error('guardarRemoto:', e);
  }
}

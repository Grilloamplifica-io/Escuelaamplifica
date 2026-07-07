const PREFIX = 'academia-amplifica:';

export function loadState<T>(key: string, valorPorDefecto: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return valorPorDefecto;
    return JSON.parse(raw) as T;
  } catch {
    return valorPorDefecto;
  }
}

export function saveState<T>(key: string, valor: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(valor));
  } catch {
    // localStorage no disponible (modo privado, cuota excedida, etc.) — se ignora silenciosamente.
  }
}

export function clearState(keys: string[]): void {
  keys.forEach((key) => {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {
      // no-op
    }
  });
}

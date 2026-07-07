export function soloDigitosRut(valor: string): string {
  return valor.replace(/[^0-9kK]/g, '').toUpperCase();
}

export function claveInicialDeRut(rut: string): string {
  return soloDigitosRut(rut).slice(0, 4);
}

export function mismoRut(a: string, b: string): boolean {
  return soloDigitosRut(a) === soloDigitosRut(b);
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function formatearFechaCorta(fecha: Date): string {
  return `${fecha.getDate()} ${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`;
}

export function generarCodigoCertificado(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let sufijo = '';
  for (let i = 0; i < 4; i++) sufijo += chars[Math.floor(Math.random() * chars.length)];
  const numero = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `AMP-${sufijo}-${numero}`;
}

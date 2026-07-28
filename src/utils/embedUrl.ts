// Convierte links "normales" que la gente pega (YouTube, Google Drive) al formato
// que se puede embeber en un <iframe>. Si no reconoce el link, lo deja tal cual
// (asumiendo que ya es una URL directa de archivo, ej. un .mp4 o .pdf público).

export function idDeYoutube(url: string): string | null {
  const patrones = [
    /youtube\.com\/watch\?v=([\w-]+)/,
    /youtu\.be\/([\w-]+)/,
    /youtube\.com\/embed\/([\w-]+)/,
    /youtube\.com\/shorts\/([\w-]+)/,
  ];
  for (const patron of patrones) {
    const match = url.match(patron);
    if (match) return match[1];
  }
  return null;
}

function idDeDrive(url: string): string | null {
  const match = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  return match ? match[1] : null;
}

export function urlEmbebida(url: string): string {
  const yt = idDeYoutube(url);
  if (yt) return `https://www.youtube.com/embed/${yt}`;
  const drive = idDeDrive(url);
  if (drive) return `https://drive.google.com/file/d/${drive}/preview`;
  return url;
}

export function esArchivoDeVideoDirecto(url: string): boolean {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url) && !idDeYoutube(url) && !idDeDrive(url);
}

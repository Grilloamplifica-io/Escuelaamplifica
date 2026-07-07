export function AmplificaLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-label="Amplifica" role="img" style={{ flexShrink: 0 }}>
      <circle cx="50" cy="50" r="50" fill="var(--amber)" />
      <g transform="rotate(15 50 50)">
        <path d="M50 18 L26 74 L34 74 L50 36 L66 74 L74 74 Z" fill="var(--azul)" />
        <path d="M50 42 L38 68 L44 68 L50 56 L56 68 L62 68 Z" fill="var(--azul)" />
        <path d="M50 58 L45.5 68 L54.5 68 Z" fill="#fff" />
      </g>
    </svg>
  );
}

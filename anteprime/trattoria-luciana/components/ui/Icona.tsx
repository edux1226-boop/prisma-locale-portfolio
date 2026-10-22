/* Icone a filo, disegnate sullo stesso tratto (1.3) dei segni del sito. */

const PERCORSI = {
  freccia: <path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" />,
  obliqua: <path d="M7 17 17 7M8.5 7H17v8.5" />,
  giu: <path d="M12 4v15M6.5 13.5 12 19l5.5-5.5" />,
  chiudi: <path d="m6 6 12 12M18 6 6 18" />,
  telefono: (
    <path d="M6.6 3.8h2.6l1.4 4-1.9 1.3a10.5 10.5 0 0 0 6.2 6.2l1.3-1.9 4 1.4v2.6a1.8 1.8 0 0 1-1.9 1.8C11 18.7 5.3 13 4.8 5.7a1.8 1.8 0 0 1 1.8-1.9Z" />
  ),
  whatsapp: (
    <>
      <path d="M4.5 19.5 5.6 16A8 8 0 1 1 8.4 18.6Z" />
      <path d="M9.3 8.4c.2-.5.6-.6.9-.6h.4c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .5-.1.6l-.5.6c.6 1.1 1.5 2 2.6 2.6l.6-.5c.2-.2.4-.2.6-.1l1.6.7c.3.1.4.3.4.5v.4c0 .3-.1.7-.6.9-.6.3-1.6.4-3.4-.5a9 9 0 0 1-3.5-3.5c-.9-1.8-.8-2.8-.5-3.4Z" />
    </>
  ),
  modulo: <path d="M5 4.5h14v15H5zM8.5 9h7M8.5 12.5h7M8.5 16h4" />,
  mappa: <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />,
  onda: <path d="M2 13c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2" />,
} as const;

export type NomeIcona = keyof typeof PERCORSI;

export function Icona({ nome, className }: { nome: NomeIcona; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PERCORSI[nome]}
    </svg>
  );
}

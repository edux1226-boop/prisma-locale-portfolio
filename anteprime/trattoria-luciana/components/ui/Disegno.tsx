import type { Disegno as NomeDisegno } from '@/content/schema';

/* Disegni a filo: tengono il posto delle fotografie non ancora scattate e
   restano come segni del sito anche dopo. Un solo tratto, come le icone. */

const DISEGNI: Record<NomeDisegno, React.ReactNode> = {
  pesce: (
    <>
      <path d="M14 60c16-21 48-27 76-6l14-11-3 17 3 17-14-11c-28 21-60 15-76-6Z" />
      <path d="M40 47c4 8 4 18 0 26M58 44c3 10 3 22 0 32" />
      <circle cx="27" cy="57" r="1.8" />
      <path d="M62 40c6-6 14-8 22-6M64 80c6 5 13 6 20 4" />
    </>
  ),
  vongola: (
    <>
      <path d="M18 72c1-27 21-44 42-44s41 17 42 44c-14 11-70 11-84 0Z" />
      <path d="M28 70c2-20 16-33 32-33s30 13 32 33M39 69c2-13 10-22 21-22s19 9 21 22M50 69c1-7 5-12 10-12s9 5 10 12" />
      <path d="M50 82c3 6 17 6 20 0" />
    </>
  ),
  pentola: (
    <>
      <path d="M26 56h68v24c0 8-5 12-12 12H38c-7 0-12-4-12-12V56Z" />
      <path d="M20 56h80M26 64h-8M94 64h8M52 56c2-6 14-6 16 0" />
      <path d="M44 42c-4-5 4-9 0-16M60 40c-4-5 4-9 0-16M76 42c-4-5 4-9 0-16" />
    </>
  ),
  piatto: (
    <>
      <circle cx="56" cy="60" r="34" />
      <circle cx="56" cy="60" r="23" />
      <path d="M104 26v68M99 26v13c0 5 2 7 5 7s5-2 5-7V26" />
    </>
  ),
  calice: (
    <>
      <path d="M43 20h34c2 23-4 38-17 40-13-2-19-17-17-40Z" />
      <path d="M45 36c10 3 20 3 30 0M60 60v32M46 96c9-5 19-5 28 0" />
    </>
  ),
  barca: (
    <>
      <path d="M14 74h92l-11 16H27L14 74Z" />
      <path d="M58 74V58h22v16M44 74V24M44 26l46 44M44 26 22 68" />
      <path d="M8 100c6-5 12-5 18 0s12 5 18 0 12-5 18 0 12 5 18 0 12-5 18 0 12 5 18 0" />
    </>
  ),
  ritratto: (
    <>
      <path d="M24 16h72v88H24z" />
      <path d="M31 23h58v74H31z" />
      <circle cx="60" cy="50" r="11" />
      <path d="M40 97c2-17 10-24 20-24s18 7 20 24" />
    </>
  ),
  tavola: (
    <>
      <circle cx="60" cy="62" r="22" />
      <circle cx="60" cy="62" r="14" />
      <path d="M26 42v40M22 42v9c0 4 2 6 4 6s4-2 4-6v-9M94 42v40M94 42c5 4 5 16 0 20" />
      <circle cx="90" cy="28" r="7" />
    </>
  ),
};

export function Disegno({ nome, className }: { nome: NomeDisegno; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {DISEGNI[nome]}
    </svg>
  );
}

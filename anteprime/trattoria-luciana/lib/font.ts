import localFont from 'next/font/local';

/* Instrument Serif (titoli, numerazioni, momenti) e Instrument Sans
   (navigazione, menu, prezzi, moduli). Self-hosted, solo latino:
   copre italiano, inglese e tedesco. Licenza OFL in assets/fonts/. */

export const serif = localFont({
  src: [
    { path: '../assets/fonts/instrument-serif.woff2', weight: '400', style: 'normal' },
    { path: '../assets/fonts/instrument-serif-italic.woff2', weight: '400', style: 'italic' },
  ],
  variable: '--font-serif',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
});

export const sans = localFont({
  src: '../assets/fonts/instrument-sans.woff2',
  weight: '400 700',
  variable: '--font-sans',
  display: 'swap',
  adjustFontFallback: 'Arial',
});

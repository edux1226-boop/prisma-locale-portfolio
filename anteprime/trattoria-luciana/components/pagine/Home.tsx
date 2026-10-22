import type { Lingua } from '@/lib/rotte';
import { Hero } from '@/components/home/Hero';
import { Intro } from '@/components/home/Intro';
import { Territorio } from '@/components/home/Territorio';
import { Storia } from '@/components/home/Storia';
import { Cucina } from '@/components/home/Cucina';
import { MenuAssaggio } from '@/components/home/MenuAssaggio';
import { Pranzo } from '@/components/home/Pranzo';
import { Atmosfera } from '@/components/home/Atmosfera';
import { Voci } from '@/components/home/Voci';
import { Dove } from '@/components/home/Dove';
import { Cta } from '@/components/home/Cta';
import { NotaAnteprima } from '@/components/home/NotaAnteprima';

/* MARE → ROSETO → FAMIGLIA → PESCA → CUCINA → TAVOLA → PRENOTAZIONE
   Una sola narrazione, una scena dopo l'altra. */
export function Home({ lingua }: { lingua: Lingua }) {
  return (
    <main id="contenuto" tabIndex={-1} data-pagina="home">
      <Hero lingua={lingua} />
      <Intro lingua={lingua} />
      <Territorio lingua={lingua} />
      <Storia lingua={lingua} />
      <Cucina lingua={lingua} />
      <MenuAssaggio lingua={lingua} />
      <Pranzo lingua={lingua} />
      <Atmosfera lingua={lingua} />
      <Voci lingua={lingua} />
      <Dove lingua={lingua} />
      <Cta lingua={lingua} />
      {lingua === 'it' && <NotaAnteprima />}
    </main>
  );
}

import Link from 'next/link';
import { dizionario } from '@/i18n';
import { percorso, type Lingua } from '@/lib/rotte';
import { telefono, attesa } from '@/lib/recapiti';
import { Icona } from '@/components/ui/Icona';
import s from './BarraPrenota.module.css';

/** Su telefono la prenotazione è sempre a un tocco: chiamare o chiedere un tavolo. */
export function BarraPrenota({ lingua }: { lingua: Lingua }) {
  const d = dizionario(lingua);
  const tel = telefono();
  return (
    <nav className={s.barra} aria-label={d.barra.prenota} data-barra>
      {tel ? (
        <a className={s.chiama} href={tel.valore.href} aria-label={`${d.barra.chiama} ${tel.valore.testo}`}>
          <Icona nome="telefono" />
          <span>{d.barra.chiama}</span>
        </a>
      ) : attesa.telefono() ? (
        <span className={s.chiama} aria-disabled="true" title={d.comune.daConfermare}>
          <Icona nome="telefono" />
          <span>{d.barra.chiama}</span>
        </span>
      ) : null}
      <Link className={s.prenota} href={percorso(lingua, 'prenota')}>
        {d.barra.prenota} <Icona nome="freccia" />
      </Link>
    </nav>
  );
}

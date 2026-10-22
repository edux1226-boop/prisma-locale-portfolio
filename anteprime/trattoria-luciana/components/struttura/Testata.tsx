'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { analizza, percorso, LINGUE, NOME_LINGUA, type Lingua } from '@/lib/rotte';
import { fermaScorrimento } from '@/components/regia/scorrimento';
import { Icona } from '@/components/ui/Icona';
import type { VociTestata } from './voci';
import s from './Testata.module.css';

export function Testata({ lingua, voci }: { lingua: Lingua; voci: VociTestata }) {
  const pathname = usePathname();
  const qui = analizza(pathname);
  const pagina = qui?.pagina ?? 'home';
  const [sopra, setSopra] = useState(true);
  const [nascosta, setNascosta] = useState(false);
  const [aperto, setAperto] = useState(false);
  const menu = useRef<HTMLDialogElement>(null);

  // trasparente sopra l'apertura, piena dopo; si ritira scendendo, torna salendo
  useEffect(() => {
    let ultimo = window.scrollY;
    let attesa = 0;
    const aggiorna = () => {
      attesa = 0;
      const y = window.scrollY;
      setSopra(y < 40);
      if (Math.abs(y - ultimo) > 6) {
        setNascosta(y > ultimo && y > window.innerHeight * 0.6);
        ultimo = y;
      }
    };
    const suScroll = () => { if (!attesa) attesa = requestAnimationFrame(aggiorna); };
    aggiorna();
    window.addEventListener('scroll', suScroll, { passive: true });
    return () => { window.removeEventListener('scroll', suScroll); cancelAnimationFrame(attesa); };
  }, []);

  // il menu si chiude quando si cambia pagina
  useEffect(() => { menu.current?.close(); }, [pathname]);

  useEffect(() => { fermaScorrimento(aperto); }, [aperto]);

  // chi sta sotto la testata (l'indice del menu) sale quando lei si ritira
  useEffect(() => {
    const r = document.documentElement;
    if (nascosta && !aperto) r.setAttribute('data-testata-via', '');
    else r.removeAttribute('data-testata-via');
  }, [nascosta, aperto]);

  const apri = () => { menu.current?.showModal(); setAperto(true); };
  const chiudi = () => { menu.current?.close(); };

  const lingue = LINGUE.map((l) => ({ l, href: percorso(l, pagina) }));

  return (
    <>
      <header className={s.testata} data-sopra={sopra || undefined} data-nascosta={(nascosta && !aperto) || undefined} data-testata>
        <Link className={s.marchio} href={voci.home}>
          <span className={s.marchioSopra}>Trattoria</span>{' '}
          <span className={s.marchioNome}>Luciana</span>
          <span className="sr-only">, {voci.casa}</span>
        </Link>

        <nav className={s.nav} aria-label={voci.etichette.menu}>
          <ul role="list">
            {voci.nav.map((v) => (
              <li key={v.pagina}>
                <Link href={v.href} aria-current={v.pagina === pagina ? 'page' : undefined}>{v.testo}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <ul className={s.lingue} role="list" aria-label={voci.etichette.lingua}>
          {lingue.map(({ l, href }) => (
            <li key={l}>
              <Link href={href} hrefLang={l} lang={l} aria-current={l === lingua ? 'true' : undefined} prefetch={false}>
                <abbr title={NOME_LINGUA[l]}>{l.toUpperCase()}</abbr>
              </Link>
            </li>
          ))}
        </ul>

        <Link className={`btn btn--accento ${s.cta}`} href={voci.prenota.href} aria-current={pagina === 'prenota' ? 'page' : undefined}>
          {voci.prenota.breve}
        </Link>

        <button className={s.apri} type="button" aria-haspopup="dialog" aria-controls="menu-mobile" aria-expanded={aperto} onClick={apri}>
          <span>{voci.etichette.menu}</span>
          <span className={s.linee} aria-hidden="true"><span /><span /></span>
        </button>
      </header>

      <dialog
        className={`${s.menu} tono-adriatico`}
        id="menu-mobile"
        data-lenis-prevent
        ref={menu}
        aria-label={voci.etichette.menu}
        onClose={() => setAperto(false)}
        onClick={(e) => { if (e.target === e.currentTarget) chiudi(); }}
      >
        <div className={s.menuTesta}>
          <p className={s.marchio} aria-hidden="true">
            <span className={s.marchioSopra}>Trattoria</span>
            <span className={s.marchioNome}>Luciana</span>
          </p>
          <button className={s.chiudi} type="button" onClick={chiudi}>
            {voci.etichette.chiudi} <Icona nome="chiudi" />
          </button>
        </div>
        <nav aria-label={voci.etichette.menu}>
          <ol className={s.menuVoci} role="list">
            {voci.nav.map((v, i) => (
              <li key={v.pagina}>
                <Link href={v.href} onClick={chiudi} aria-current={v.pagina === pagina ? 'page' : undefined}>
                  <span className={s.menuNum} aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  {v.testo}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        <div className={s.menuPiede}>
          <Link className="btn btn--accento" href={voci.prenota.href} onClick={chiudi}>
            {voci.prenota.testo} <Icona nome="freccia" />
          </Link>
          {voci.telefono ? (
            <a className="btn btn--linea" href={voci.telefono.href}>
              <Icona nome="telefono" /> {voci.telefono.testo}
              {voci.telefono.daConfermare && <span className="dc">{voci.etichette.daConfermare}</span>}
            </a>
          ) : voci.telefonoInAttesa ? (
            <span className="btn btn--linea" aria-disabled="true">
              {voci.etichette.chiama} <span className="dc">{voci.etichette.daConfermare}</span>
            </span>
          ) : null}
          <ul className={s.menuLingue} role="list" aria-label={voci.etichette.lingua}>
            {lingue.map(({ l, href }) => (
              <li key={l}>
                <Link href={href} hrefLang={l} lang={l} aria-current={l === lingua ? 'true' : undefined} prefetch={false} onClick={chiudi}>
                  {NOME_LINGUA[l]}
                </Link>
              </li>
            ))}
          </ul>
          <p className={s.menuIndirizzo}>{voci.indirizzo[0]}<br />{voci.indirizzo[1]}</p>
        </div>
      </dialog>
    </>
  );
}

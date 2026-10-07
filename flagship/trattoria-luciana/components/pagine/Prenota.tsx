import { dizionario } from '@/i18n';
import { percorso, LOCALE, type Lingua } from '@/lib/rotte';
import { orari, leggi, orariVisibili } from '@/lib/contenuti';
import { ANTEPRIMA, BASE_PATH } from '@/lib/sito';
import { TestaPagina } from '@/components/ui/TestaPagina';
import { Percorsi } from '@/components/ui/Percorsi';
import { Orari } from '@/components/ui/Orari';
import { ModuloPrenotazione } from '@/components/prenota/ModuloPrenotazione';
import s from './Prenota.module.css';

/* /prenota — tre strade per lo stesso tavolo. Il modulo è una richiesta. */
export function Prenota({ lingua }: { lingua: Lingua }) {
  const d = dizionario(lingua);
  const pranzo = leggi(orari.pranzo);
  const cena = leggi(orari.cena);
  const chiusi = leggi(orari.giornoChiusura);
  return (
    <main id="contenuto" tabIndex={-1} data-pagina="prenota">
      <TestaPagina lingua={lingua} sopra={d.prenota.sopra} titolo={d.prenota.titolo} intro={d.prenota.intro} foto="notte" />

      <section className={`${s.percorsi} tono-avorio`} aria-label={d.prenota.titolo} data-tono="avorio">
        <Percorsi lingua={lingua} ancoraModulo="richiesta" livello="h2" />
      </section>

      <section className={`${s.richiesta} tono-avorio`} id="richiesta" aria-labelledby="richiesta-titolo" data-tono="avorio">
        <div className={s.lato}>
          <h2 className="titolo-xl" id="richiesta-titolo" data-righe>{d.prenota.modulo.titolo}</h2>
          {orariVisibili() && (
            <div className={s.orari}>
              <h3 className="etichetta">{d.orari.titolo}</h3>
              <Orari lingua={lingua} />
            </div>
          )}
        </div>
        <div className={s.modulo}>
          <ModuloPrenotazione
            testi={d.prenota.modulo}
            servizi={{
              pranzo: pranzo ? { nome: d.orari.pranzo, orari: pranzo.valore } : undefined,
              cena: cena ? { nome: d.orari.cena, orari: cena.valore } : undefined,
            }}
            giorniChiusi={chiusi?.valore ?? []}
            anteprima={ANTEPRIMA}
            azione={`${BASE_PATH}${percorso(lingua, 'prenota')}`}
            persone={12}
            locale={LOCALE[lingua]}
            daCollegare={d.comune.daCollegare}
          />
        </div>
      </section>
    </main>
  );
}

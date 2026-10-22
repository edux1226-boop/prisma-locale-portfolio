import { voceMedia, visibile } from '@/lib/contenuti';
import { ANTEPRIMA, asset } from '@/lib/sito';
import { dizionario, t } from '@/i18n';
import type { Lingua } from '@/lib/rotte';
import type { Variante } from '@/content/schema';
import { Disegno } from './Disegno';
import s from './Foto.module.css';

type Props = {
  id: string;
  lingua: Lingua;
  /** Attributo sizes dell'immagine. */
  sizes: string;
  /** Quando usare la variante verticale (art direction). */
  verticaleQuando?: string;
  priorita?: boolean;
  /** Immagine decorativa (alt vuoto), quando il testo accanto dice già tutto. */
  decorativa?: boolean;
  className?: string;
  /** Proporzioni del segnaposto, se non c'è un'immagine: "4 / 5" */
  proporzioni?: string;
};

function srcset(v: Variante, formato: 'avif' | 'webp') {
  return v.larghezze.map((w) => `${asset(`/media/${v.file}-${w}.${formato}`)} ${w}w`).join(', ');
}

/* Le foto caricate dal CMS non hanno varianti pronte: su Netlify le
   ridimensiona e converte l'Image CDN (/.netlify/images), altrove si usa
   l'originale così com'è. */
const CDN = process.env.NEXT_PUBLIC_IMAGE_CDN === 'netlify';
const LARGHEZZE_CDN = [640, 960, 1440, 2000, 2600];
function cdn(originale: string, w: number, formato: 'avif' | 'webp') {
  return `/.netlify/images?url=${encodeURIComponent(asset(originale))}&w=${w}&fm=${formato}&q=72`;
}

/** Un'immagine del CMS: AVIF e WebP responsive, orizzontale e verticale.
    Senza fotografia (o non ancora confermata in produzione) disegna una
    tavola di regia: il disegno a filo e, in anteprima, le note per lo scatto. */
export function Foto({ id, lingua, sizes, verticaleQuando = '(max-width: 47.99em)', priorita, decorativa, className, proporzioni }: Props) {
  const voce = voceMedia(id);
  if (!voce) return null;
  const o = voce.orizzontale;
  const v = voce.verticale;

  if (voce.tipo === 'foto' && voce.originale && visibile(voce)) {
    const alt = decorativa ? '' : t(voce.alt, lingua);
    const caricamento = { loading: priorita ? 'eager' : 'lazy', fetchPriority: priorita ? 'high' : undefined, decoding: 'async' } as const;
    if (!CDN) return <picture className={`${s.foto} ${className ?? ''}`}><img src={asset(voce.originale)} alt={alt} {...caricamento} /></picture>;
    const set = (f: 'avif' | 'webp') => LARGHEZZE_CDN.map((w) => `${cdn(voce.originale!, w, f)} ${w}w`).join(', ');
    return (
      <picture className={`${s.foto} ${className ?? ''}`}>
        <source type="image/avif" srcSet={set('avif')} sizes={sizes} />
        <img src={cdn(voce.originale, 1440, 'webp')} srcSet={set('webp')} sizes={sizes} alt={alt} {...caricamento} />
      </picture>
    );
  }

  if (voce.tipo !== 'segnaposto' && o && visibile(voce)) {
    const media = o.larghezze[Math.min(1, o.larghezze.length - 1)];
    return (
      <picture className={`${s.foto} ${className ?? ''}`}>
        {v && <source media={verticaleQuando} type="image/avif" srcSet={srcset(v, 'avif')} sizes={sizes} />}
        {v && <source media={verticaleQuando} type="image/webp" srcSet={srcset(v, 'webp')} sizes={sizes} />}
        <source type="image/avif" srcSet={srcset(o, 'avif')} sizes={sizes} />
        <img
          src={asset(`/media/${o.file}-${media}.webp`)}
          srcSet={srcset(o, 'webp')}
          sizes={sizes}
          width={o.larghezza}
          height={o.altezza}
          alt={decorativa ? '' : t(voce.alt, lingua)}
          loading={priorita ? 'eager' : 'lazy'}
          fetchPriority={priorita ? 'high' : undefined}
          decoding="async"
        />
      </picture>
    );
  }

  // in produzione, senza foto e senza disegno, resta il tono della sezione
  if (!ANTEPRIMA && !voce.disegno) return null;
  const d = dizionario(lingua);
  const etichetta = voce.categoria === 'archive' ? d.foto.archivio : d.foto.daScattare;
  return (
    <div
      className={`${s.tavola} ${className ?? ''}`}
      style={proporzioni ? { aspectRatio: proporzioni } : undefined}
      {...(ANTEPRIMA && !decorativa
        ? { role: 'img', 'aria-label': `${etichetta}: ${t(voce.alt, lingua)}` }
        : { 'aria-hidden': true })}
      data-tavola
    >
      <span className={s.riflessi} aria-hidden="true" />
      {voce.disegno && <Disegno nome={voce.disegno} className={s.disegno} />}
      {ANTEPRIMA && (
        <span className={s.regia} lang="it" aria-hidden="true">
          <span className={`${s.regiaEtichetta} etichetta`}>{etichetta}</span>
          <span className={s.regiaTesto}>{t(voce.regia, lingua)}</span>
        </span>
      )}
    </div>
  );
}

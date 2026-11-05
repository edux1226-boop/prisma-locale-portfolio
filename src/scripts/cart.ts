// Carrello: stato locale persistente, personalizzatore piatto, invio ordine su WhatsApp.
// Vanilla, niente framework: dialog nativo, WAAPI, BroadcastChannel, Web Share, Intl. Nessun innerHTML (Trusted Types).
const PHONE = '393515928775';
const KEY = 'gb-cart-v1';

type Opt = { label: string; delta: number };
type Group = { id: string; label: string; required: boolean; options: Opt[] };
type Dish = {
  id: string; name: string; price: number; desc: string;
  ingredients: { label: string; removable: boolean }[];
  groups: Group[]; extras: { max: number; options: { label: string; price: number }[] } | null;
};
type Line = {
  key: string; id: string; name: string; img: string; unit: number; qty: number;
  choices: string[]; removed: string[]; extras: string[]; allergens: string[]; note: string;
};

const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];
const reduced = () => document.documentElement.dataset.motion === 'reduced' || matchMedia('(prefers-reduced-motion: reduce)').matches && document.documentElement.dataset.motion !== 'full';
const f0 = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
const f2 = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });
const eur = (n: number) => { const r = Math.round(n * 100) / 100; return (Number.isInteger(r) ? f0 : f2).format(r).replace(/s/g, ' '); };
const imgPath = (s: string) => { try { const p = new URL(s, location.href).pathname; return /^\/_astro\/[\w.-]+$/.test(p) ? p : ''; } catch { return ''; } };
const buzz = (ms = 10) => { if (!reduced()) navigator.vibrate?.(ms); };

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', text = ''): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}

/* ---------- stato ---------- */
const clampStr = (v: unknown, n: number) => (typeof v === 'string' ? v.slice(0, n) : '');
const strArr = (v: unknown, n = 20) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string').map((x) => x.slice(0, 80)).slice(0, n) : []);
function validLine(l: any): Line | null {
  if (!l || typeof l !== 'object' || typeof l.unit !== 'number' || !isFinite(l.unit) || l.unit < 0 || l.unit > 500) return null;
  const qty = Math.round(Number(l.qty));
  if (!(qty >= 1)) return null;
  return {
    key: clampStr(l.key, 400), id: clampStr(l.id, 12), name: clampStr(l.name, 80), img: /^\/_astro\/[\w.\-]+$/.test(l.img) ? l.img : '',
    unit: l.unit, qty: Math.min(qty, 30), choices: strArr(l.choices), removed: strArr(l.removed), extras: strArr(l.extras),
    allergens: strArr(l.allergens, 14), note: clampStr(l.note, 200),
  };
}
let lines: Line[] = load();
function load(): Line[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(raw) ? raw.map(validLine).filter((l): l is Line => !!l).slice(0, 60) : [];
  } catch { return []; }
}
const chan = 'BroadcastChannel' in window ? new BroadcastChannel('gb-cart') : null;
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch { /* storage bloccato: il carrello vive solo in questa pagina */ }
  chan?.postMessage('sync');
  renderCart();
}
chan?.addEventListener('message', () => { lines = load(); renderCart(); });

const total = () => lines.reduce((s, l) => s + l.unit * l.qty, 0);
const count = () => lines.reduce((s, l) => s + l.qty, 0);

/* ---------- dati menu (caricati una volta, alla prima necessita') ---------- */
let dishes: Map<string, Dish> | null = null;
let pending: Promise<Map<string, Dish>> | null = null;
function loadMenu() {
  pending ??= fetch('/menu.json').then((r) => r.json() as Promise<Dish[]>).then((a) => (dishes = new Map(a.map((d) => [d.id, d]))));
  return pending;
}
addEventListener('pointerdown', () => void loadMenu(), { once: true, passive: true });
if ('requestIdleCallback' in window) requestIdleCallback(() => void loadMenu(), { timeout: 4000 });

/* ---------- riepilogo opzioni ---------- */
const summary = (l: Pick<Line, 'choices' | 'removed' | 'extras' | 'allergens' | 'note'>) => {
  const out: string[] = [];
  if (l.choices.length) out.push(l.choices.join(' · '));
  if (l.removed.length) out.push('Senza: ' + l.removed.join(', '));
  if (l.extras.length) out.push('Extra: ' + l.extras.join(', '));
  if (l.allergens.length) out.push('⚠ Allergie: ' + l.allergens.join(', '));
  if (l.note) out.push('Nota: ' + l.note);
  return out;
};
const keyOf = (l: Omit<Line, 'key' | 'qty'>) => [l.id, l.choices, l.removed, l.extras, l.allergens, l.note].map((x) => JSON.stringify(x)).join('|');

/* ---------- aggiunta con animazione "vola nel carrello" ---------- */
function cartTarget() {
  return $$('[data-cart-open]').find((b) => b.offsetParent !== null) ?? null;
}
function fly(from: Element | null, src: string) {
  const to = cartTarget();
  if (!from || !to || reduced() || !src) return;
  const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
  const ghost = el('img', 'fly');
  ghost.src = src; ghost.alt = '';
  ghost.style.setProperty('left', a.left + 'px'); ghost.style.setProperty('top', a.top + 'px');
  ghost.style.setProperty('width', a.width + 'px'); ghost.style.setProperty('height', a.height + 'px');
  document.body.append(ghost);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const s = Math.max(0.12, 28 / a.width);
  ghost.animate(
    [{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${dx * 0.55}px,${dy * 0.35 - 40}px) scale(.6)`, opacity: 1, offset: 0.55 }, { transform: `translate(${dx}px,${dy}px) scale(${s})`, opacity: 0.15 }],
    { duration: 620, easing: 'cubic-bezier(.5,0,.2,1)' },
  ).finished.then(() => { ghost.remove(); bump(); }, () => ghost.remove());
}
function bump() {
  $$('[data-cart-count]').forEach((n) => { n.classList.remove('bump'); void n.offsetWidth; n.classList.add('bump'); });
}
function toast(msg: string) {
  const t = $('[data-toast]'); if (!t) return;
  t.textContent = msg; t.classList.add('on');
  clearTimeout((toast as any).t); (toast as any).t = setTimeout(() => t.classList.remove('on'), 2200);
}
function addLine(base: Omit<Line, 'key'>, srcEl: Element | null) {
  const key = keyOf(base);
  const ex = lines.find((l) => l.key === key);
  if (ex) ex.qty = Math.min(30, ex.qty + base.qty); else lines.push({ ...base, key });
  save(); buzz(); fly(srcEl, base.img); toast(`${base.name} aggiunto`);
}

/* ---------- personalizzatore ---------- */
const sheet = $<HTMLDialogElement>('#sheet');
let cur: { d: Dish; img: string; srcEl: Element | null; qty: number; edit?: Line } | null = null;

function chip(type: 'radio' | 'checkbox', name: string, value: string, label: string, extra = '', checked = false) {
  const l = el('label', 'chip');
  const i = el('input'); i.type = type; i.name = name; i.value = value; i.checked = checked;
  const s = el('span'); s.append(document.createTextNode(label));
  if (extra) s.append(el('em', '', extra));
  l.append(i, s);
  return l;
}
const sign = (n: number) => (n > 0 ? '+' : '−') + eur(Math.abs(n));

function openSheet(id: string, card: Element | null, edit?: Line) {
  if (!sheet) return;
  void loadMenu().then((m) => {
    const d = m.get(id); if (!d) return;
    const imgSrc = edit?.img ?? card?.querySelector('img')?.currentSrc ?? card?.querySelector('img')?.src ?? '';
    cur = { d, img: imgSrc, srcEl: card?.querySelector('img') ?? card, qty: edit?.qty ?? 1, edit };
    $('#sheet-title')!.textContent = d.name;
    $('.sheet-desc', sheet)!.textContent = d.desc;
    const im = $<HTMLImageElement>('.sheet-img', sheet)!;
    if (imgSrc) { im.src = imgSrc; im.hidden = false; } else im.hidden = true;
    const box = $('.sheet-sections', sheet)!; box.replaceChildren();

    for (const g of d.groups) {
      const fs = el('fieldset', 'sec'); fs.append(el('legend', '', g.label));
      const w = el('div', 'chips-wrap');
      g.options.forEach((o, i) => {
        const checked = edit ? edit.choices.includes(o.label) : i === 0;
        w.append(chip('radio', 'g-' + g.id, o.label, o.label, o.delta ? sign(o.delta) : '', checked));
      });
      fs.append(w); box.append(fs);
    }
    const rem = d.ingredients.filter((x) => x.removable);
    if (rem.length) {
      const fs = el('fieldset', 'sec ingr'); fs.append(el('legend', '', 'Ingredienti'));
      fs.append(el('p', 'hint', 'Tocca per togliere un ingrediente.'));
      const w = el('div', 'chips-wrap');
      for (const x of rem) w.append(chip('checkbox', 'ing', x.label, x.label, '', !edit?.removed.includes(x.label)));
      fs.append(w); box.append(fs);
    }
    if (d.extras) {
      const fs = el('fieldset', 'sec extras'); fs.append(el('legend', '', `Aggiungi (fino a ${d.extras.max})`));
      const w = el('div', 'chips-wrap');
      for (const x of d.extras.options) w.append(chip('checkbox', 'extra', x.label, x.label, '+' + eur(x.price), !!edit?.extras.includes(x.label)));
      fs.append(w); box.append(fs);
    }
    $$<HTMLInputElement>('input[name=allergen]', sheet).forEach((i) => (i.checked = !!edit?.allergens.includes(i.value)));
    $<HTMLTextAreaElement>('#sheet-note', sheet)!.value = edit?.note ?? '';
    $('[data-confirm]', sheet)!.firstChild!.textContent = edit ? 'Salva ' : 'Aggiungi ';
    refreshSheet();
    sheet.showModal();
    sheet.scrollTop = 0; $('.sheet-scroll', sheet)!.scrollTop = 0;
  });
}
function readSheet() {
  const d = cur!.d;
  const choices = d.groups.map((g) => $<HTMLInputElement>(`input[name="g-${g.id}"]:checked`, sheet!)?.value ?? g.options[0].label);
  const removed = $$<HTMLInputElement>('input[name=ing]', sheet!).filter((i) => !i.checked).map((i) => i.value);
  const extras = $$<HTMLInputElement>('input[name=extra]:checked', sheet!).map((i) => i.value);
  const allergens = $$<HTMLInputElement>('input[name=allergen]:checked', sheet!).map((i) => i.value);
  const note = $<HTMLTextAreaElement>('#sheet-note', sheet!)!.value.trim().slice(0, 200);
  let unit = d.price;
  d.groups.forEach((g, i) => { unit += g.options.find((o) => o.label === choices[i])?.delta ?? 0; });
  for (const x of extras) unit += d.extras?.options.find((o) => o.label === x)?.price ?? 0;
  return { choices, removed, extras, allergens, note, unit: Math.round(unit * 100) / 100 };
}
function refreshSheet() {
  if (!cur || !sheet) return;
  const max = cur.d.extras?.max ?? 0;
  const ex = $$<HTMLInputElement>('input[name=extra]', sheet);
  const n = ex.filter((i) => i.checked).length;
  ex.forEach((i) => { i.disabled = !i.checked && n >= max; });
  const r = readSheet();
  $('[data-qty-out]', sheet)!.textContent = String(cur.qty);
  $('[data-total]', sheet)!.textContent = '· ' + eur(r.unit * cur.qty);
}
sheet?.addEventListener('input', refreshSheet);
sheet?.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  if (t === sheet) return sheet.close();
  const q = t.closest<HTMLElement>('[data-qty]');
  if (q && cur) { cur.qty = Math.min(20, Math.max(1, cur.qty + Number(q.dataset.qty))); buzz(6); refreshSheet(); }
  if (t.closest('[data-confirm]') && cur) {
    const r = readSheet();
    const base = { id: cur.d.id, name: cur.d.name, img: imgPath(cur.img), unit: r.unit, qty: cur.qty, choices: r.choices, removed: r.removed, extras: r.extras, allergens: r.allergens, note: r.note };
    if (cur.edit) {
      const i = lines.indexOf(cur.edit);
      if (i >= 0) lines[i] = { ...base, key: keyOf(base) };
      save(); buzz(); toast('Modifica salvata');
    } else addLine(base, cur.srcEl);
    sheet.close();
  }
});
sheet?.addEventListener('close', () => { cur = null; });

/* ---------- carrello ---------- */
const drawer = $<HTMLDialogElement>('#cart');
function renderCart() {
  const n = count(), t = total();
  $$('[data-cart-count]').forEach((e) => { e.textContent = String(n); e.hidden = n === 0; });
  $$('[data-cart-total]').forEach((e) => { e.textContent = n ? eur(t) : ''; });
  document.documentElement.classList.toggle('has-cart', n > 0);
  if (!drawer) return;
  $('[data-sum]', drawer)!.textContent = eur(t);
  $('[data-empty]', drawer)!.hidden = n > 0;
  $('[data-checkout]', drawer)!.hidden = n === 0;
  $('[data-foot]', drawer)!.hidden = n === 0;
  const ul = $('[data-lines]', drawer)!; ul.replaceChildren();
  for (const l of lines) {
    const li = el('li', 'line');
    if (l.img) { const im = el('img'); im.src = l.img; im.alt = ''; im.width = 56; im.height = 56; li.append(im); }
    const mid = el('div', 'line-mid');
    mid.append(el('strong', '', l.name));
    for (const s of summary(l)) mid.append(el('span', s.startsWith('⚠') ? 'sub warn' : 'sub', s));
    const act = el('div', 'line-act');
    const edit = el('button', 'link', 'Modifica'); edit.type = 'button'; edit.dataset.edit = l.key;
    const del = el('button', 'link', 'Rimuovi'); del.type = 'button'; del.dataset.del = l.key;
    act.append(edit, del); mid.append(act);
    const right = el('div', 'line-right');
    const q = el('div', 'qty sm');
    const m = el('button', '', '−'); m.type = 'button'; m.dataset.lq = l.key + '|-1'; m.setAttribute('aria-label', `Meno ${l.name}`);
    const o = el('output', '', String(l.qty));
    const p = el('button', '', '+'); p.type = 'button'; p.dataset.lq = l.key + '|1'; p.setAttribute('aria-label', `Più ${l.name}`);
    q.append(m, o, p);
    right.append(q, el('span', 'line-price', eur(l.unit * l.qty)));
    li.append(mid, right); ul.append(li);
  }
}
const byKey = (k: string) => lines.find((l) => l.key === k);
drawer?.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  if (t === drawer) return drawer.close();
  const lq = t.closest<HTMLElement>('[data-lq]');
  if (lq) {
    const [k, d] = lq.dataset.lq!.split('|'); const l = byKey(k);
    if (l) { l.qty += Number(d); if (l.qty < 1) lines = lines.filter((x) => x !== l); else l.qty = Math.min(30, l.qty); save(); buzz(6); }
    return;
  }
  const del = t.closest<HTMLElement>('[data-del]');
  if (del) { lines = lines.filter((l) => l.key !== del.dataset.del); save(); buzz(); return; }
  const ed = t.closest<HTMLElement>('[data-edit]');
  if (ed) { const l = byKey(ed.dataset.edit!); if (l) { drawer.close(); openSheet(l.id, null, l); } return; }
  if (t.closest('[data-clear]')) { if (confirm('Svuotare il carrello?')) { lines = []; save(); } return; }
  if (t.closest('[data-copy]')) { void copyOrder(); return; }
  if (t.closest('[data-share]')) { void shareOrder(); return; }
  if (t.closest('[data-send]')) sendOrder();
});

function orderText() {
  const f = $<HTMLFormElement>('[data-checkout]', drawer!)!;
  const name = (f.elements.namedItem('name') as HTMLInputElement).value.trim();
  const how = (f.elements.namedItem('how') as HTMLTextAreaElement).value.trim();
  const out = ['Ciao Grill Burger, vorrei ordinare:', ''];
  if (name) out.push(`*Nome:* ${name}`);
  if (how) out.push(`*Ritiro / consegna / tavolo:* ${how}`);
  out.push('');
  for (const l of lines) {
    out.push(`${l.qty}× ${l.name} — ${eur(l.unit * l.qty)}`);
    for (const s of summary(l)) out.push(`   ${s.startsWith('⚠') ? s.toUpperCase() : '• ' + s}`);
  }
  out.push('', `*Totale: ${eur(total())}*`);
  if (lines.some((l) => l.allergens.length)) out.push('', '⚠ Ci sono allergie nell\'ordine: confermatemi gli ingredienti, grazie.');
  return out.join('\n');
}
function needName() {
  const f = $<HTMLInputElement>('#c-name', drawer!)!;
  if (!f.value.trim()) { f.focus(); f.classList.add('err'); setStatus('Scrivi il tuo nome, così il locale sa a chi rispondere.'); return true; }
  f.classList.remove('err'); return false;
}
const setStatus = (m: string) => { const s = $('[data-status]', drawer!); if (s) s.textContent = m; };
function sendOrder() {
  if (!lines.length || needName()) return;
  const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(orderText())}`;
  setStatus('Apro WhatsApp: premi invia per mandare l’ordine al locale.'); buzz(15);
  const w = window.open(url, '_blank', 'noopener');
  if (!w) location.href = url;
}
async function copyOrder() {
  if (!lines.length) return;
  try { await navigator.clipboard.writeText(orderText()); setStatus('Ordine copiato.'); } catch { setStatus('Copia non disponibile su questo browser.'); }
}
async function shareOrder() {
  if (!lines.length || needName()) return;
  try { await navigator.share({ text: orderText() }); } catch { /* annullato */ }
}
if ('share' in navigator) $('[data-share]', drawer!)?.removeAttribute('hidden');

/* ---------- eventi pagina ---------- */
document.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  if (t.closest('[data-cart-open]')) { e.preventDefault(); setStatus(''); drawer?.showModal(); return; }
  const card = t.closest<HTMLElement>('.dish');
  if (!card) return;
  const id = card.dataset.id!;
  if (t.closest('[data-add]') && card.dataset.simple === '1') {
    const im = card.querySelector('img');
    void loadMenu().then((m) => {
      const d = m.get(id); if (!d) return;
      const src = im?.currentSrc ?? '';
      addLine({ id, name: d.name, img: imgPath(src), unit: d.price, qty: 1, choices: [], removed: [], extras: [], allergens: [], note: '' }, im ?? card);
    });
    return;
  }
  if (t.closest('[data-add]') || t.closest('[data-open]')) openSheet(id, card);
});
renderCart();

export {};

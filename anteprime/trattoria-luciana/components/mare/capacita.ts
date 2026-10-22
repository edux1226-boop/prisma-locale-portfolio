/* WebGL solo dove ha senso: schermo grande, puntatore fine, movimento
   consentito, scheda grafica vera (non un rasterizzatore software), niente
   risparmio dati. Altrove resta il fermo immagine con il movimento CSS. */

export function puoUsareWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  // per le verifiche: ?webgl=no lo spegne, ?webgl=forza salta i controlli sull'hardware
  const forza = new URLSearchParams(window.location.search).get('webgl');
  if (forza === 'no') return false;
  if (forza === 'forza') return Boolean(document.createElement('canvas').getContext('webgl2') ?? document.createElement('canvas').getContext('webgl'));
  if (!window.matchMedia('(min-width: 64em) and (pointer: fine)').matches) return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return false;
  if ((nav.hardwareConcurrency ?? 4) < 4) return false;
  if ((nav.deviceMemory ?? 8) < 4) return false;
  try {
    const tela = document.createElement('canvas');
    const gl = tela.getContext('webgl2') ?? tela.getContext('webgl');
    if (!gl) return false;
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const scheda = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    if (/swiftshader|llvmpipe|software|basic render/i.test(scheda)) return false;
  } catch {
    return false;
  }
  return true;
}

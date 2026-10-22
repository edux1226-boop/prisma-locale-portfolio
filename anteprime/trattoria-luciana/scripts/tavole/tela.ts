/* Una pagina minima che disegna uno shader a schermo intero in WebGL 1 e
   ne restituisce i pixel. La usa render.ts con Playwright: le tavole e il
   fermo immagine del mare nascono dagli stessi shader del sito. */

export type Uniformi = Record<string, number | number[]>;

export function pagina(frammento: string, larghezza: number, altezza: number, uniformi: Uniformi): string {
  return `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#000}canvas{display:block}</style></head><body>
<canvas id="c" width="${larghezza}" height="${altezza}"></canvas>
<script>
(() => {
const c = document.getElementById('c');
const gl = c.getContext('webgl', { preserveDrawingBuffer: true, antialias: false });
const vs = 'attribute vec2 p; varying vec2 vUv; void main(){ vUv = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }';
const fs = ${JSON.stringify(frammento)};
function sh(t, s) { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; }
const pr = gl.createProgram();
gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs));
gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs));
gl.linkProgram(pr);
if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
gl.useProgram(pr);
const b = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, b);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
const loc = gl.getAttribLocation(pr, 'p');
gl.enableVertexAttribArray(loc);
gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
const u = ${JSON.stringify(uniformi)};
u.uRis = [${larghezza}, ${altezza}];
for (const [k, v] of Object.entries(u)) {
  const l = gl.getUniformLocation(pr, k);
  if (!l) continue;
  if (Array.isArray(v)) gl['uniform' + v.length + 'fv'](l, v); else gl.uniform1f(l, v);
}
gl.viewport(0, 0, ${larghezza}, ${altezza});
gl.drawArrays(gl.TRIANGLES, 0, 3);
window.pronto = true;
})();
</script></body></html>`;
}

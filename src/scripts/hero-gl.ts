// Sfondo dell'hero: griglia prospettica e punti, in bianco e nero. Un solo shader, nessuna libreria.
// Reagisce al mouse (punto di fuga) e allo scroll (avanzamento). Si ferma fuori schermo e con la tab nascosta.
const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const FRAG = `precision mediump float;
uniform vec2 uRes;uniform vec2 uMouse;uniform float uTime;uniform float uScroll;
float h(vec2 g){return fract(sin(dot(g,vec2(127.1,311.7)))*43758.5453);}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec2 p=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  p.x-=(uMouse.x-.5)*.18;
  float hz=.04+(uMouse.y-.5)*.06;
  float c=0.;
  if(p.y<hz){
    float z=.35/(hz-p.y);
    float x=p.x*z*2.;
    float w=z+uTime*.35+uScroll*6.;
    vec2 g=abs(fract(vec2(x,w))-.5);
    float l=smoothstep(.47,.5,max(g.x,g.y));
    c+=l*exp(-z*.16)*.5;
  }
  vec2 cell=floor(uv*vec2(70.,40.)+vec2(0.,-uScroll*10.));
  float r=h(cell);
  if(r>.985){
    vec2 f=fract(uv*vec2(70.,40.)+vec2(0.,-uScroll*10.))-.5;
    float tw=.5+.5*sin(uTime*1.5+r*60.);
    c+=smoothstep(.12,.0,length(f))*tw*.45*smoothstep(hz,hz+.35,p.y);
  }
  c*=smoothstep(1.05,.2,length(uv-.5)*1.3);
  gl_FragColor=vec4(vec3(c*.85),1.);
}`;

export function initHeroGL(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) return;
  const sh = (t: number, s: string) => { const o = gl.createShader(t)!; gl.shaderSource(o, s); gl.compileShader(o); return o; };
  const pr = gl.createProgram()!;
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
  gl.useProgram(pr);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const u = (n: string) => gl.getUniformLocation(pr, n);
  const uRes = u('uRes'), uMouse = u('uMouse'), uTime = u('uTime'), uScroll = u('uScroll');

  let w = 0, h = 0, mx = 0.5, my = 0.5, tx = 0.5, ty = 0.5, run = false, raf = 0, last = 0, t0 = performance.now();
  const scale = Math.min(devicePixelRatio || 1, 1.25) * 0.75; // risoluzione ridotta: sono linee sottili e sfocate dal vignettatura
  const size = () => {
    w = Math.max(2, Math.round(canvas.clientWidth * scale)); h = Math.max(2, Math.round(canvas.clientHeight * scale));
    canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h);
  };
  const frame = (now: number) => {
    raf = 0;
    if (!run) return;
    if (now - last >= 33) { // 30 fps bastano per un fondale
      last = now;
      mx += (tx - mx) * 0.06; my += (ty - my) * 0.06;
      gl.uniform2f(uRes, w, h); gl.uniform2f(uMouse, mx, 1 - my);
      gl.uniform1f(uTime, (now - t0) / 1000); gl.uniform1f(uScroll, Math.min(scrollY / innerHeight, 3));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    raf = requestAnimationFrame(frame);
  };
  const go = () => { if (!raf && run) raf = requestAnimationFrame(frame); };
  addEventListener('pointermove', (e) => { tx = e.clientX / innerWidth; ty = e.clientY / innerHeight; }, { passive: true });
  new ResizeObserver(size).observe(canvas);
  size();
  new IntersectionObserver(([e]) => { run = e.isIntersecting && !document.hidden; go(); }).observe(canvas);
  document.addEventListener('visibilitychange', () => { run = !document.hidden; go(); });
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); run = false; canvas.classList.remove('on'); });
  run = true; gl.uniform2f(uRes, w, h); gl.drawArrays(gl.TRIANGLES, 0, 3);
  requestAnimationFrame(() => canvas.classList.add('on'));
  go();
}

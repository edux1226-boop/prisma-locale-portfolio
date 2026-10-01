/* Shader della scena del prisma.
   Fascio e ventaglio sono "opachi" per Three (transparent: false) ma con
   blending additivo: così finiscono nel pass di trasmissione e il vetro
   li rifrange davvero, con la dispersione cromatica del materiale. */

const NOISE = /* glsl */ `
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
`;

/* ---- Fondo: notte, alone freddo dietro al prisma, righe di serranda ---- */
export const backdrop = {
  vertex: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy * 2.0, 0.0, 1.0);
    }
  `,
  fragment: /* glsl */ `
    uniform vec3 uBg;
    uniform vec3 uHaze;
    uniform vec2 uPrism;
    uniform float uAspect;
    uniform float uReveal;
    varying vec2 vUv;
    ${NOISE}
    void main() {
      vec2 uv = vUv;
      vec2 d = (uv - uPrism) * vec2(uAspect, 1.0);
      float glow = exp(-dot(d, d) * 3.2);
      vec3 col = uBg;
      col += uHaze * glow * 0.42 * uReveal;
      // una luce morbida proprio dietro al prisma: il vetro la piega e si vede
      col += vec3(0.06, 0.075, 0.16) * exp(-dot(d, d) * 12.0) * uReveal;
      col += uHaze * 0.22 * smoothstep(0.35, 1.0, uv.y) * (1.0 - 0.6 * uv.x);
      // Righe sottili, come la luce che passa da una serranda: si vedono solo
      // vicino al prisma, che le piega e le separa nei colori.
      float stripe = smoothstep(0.42, 0.5, abs(fract(uv.y * 34.0) - 0.5));
      col += vec3(0.82, 0.86, 1.0) * stripe * 0.05 * exp(-dot(d, d) * 46.0) * uReveal;
      // Una lama di luce verticale dietro al vetro, come lo spigolo di una
      // vetrina illuminata: attraverso il prisma si sposta e si sfrangia.
      vec2 w = (uv - uPrism - vec2(-0.012, 0.0)) * vec2(uAspect, 1.0);
      float blade = exp(-pow(w.x / 0.018, 2.0)) * smoothstep(0.34, 0.0, abs(w.y));
      col += vec3(0.55, 0.6, 0.85) * blade * 0.22 * uReveal;
      col += (noise(uv * 900.0) - 0.5) * 0.004;
      col = mix(uBg, col, smoothstep(0.0, 0.32, uv.y));
      gl_FragColor = vec4(col, 1.0);
      #include <colorspace_fragment>
    }
  `,
};

/* ---- Fascio bianco in entrata ---- */
export const beam = {
  vertex: /* glsl */ `
    uniform vec3 uA;
    uniform vec3 uB;
    uniform float uWidthA;
    uniform float uWidthB;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec3 dir = normalize(uB - uA);
      vec3 nrm = normalize(vec3(-dir.y, dir.x, 0.0));
      float w = mix(uWidthA, uWidthB, uv.x);
      vec3 p = mix(uA, uB, uv.x) + nrm * (uv.y - 0.5) * w;
      gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
    }
  `,
  fragment: /* glsl */ `
    uniform vec3 uColor;
    uniform float uTime;
    uniform float uGrow;
    uniform float uIntensity;
    uniform float uInner;
    varying vec2 vUv;
    ${NOISE}
    void main() {
      float y = (vUv.y - 0.5) * 2.0;
      float core = exp(-y * y * 120.0);
      float halo = exp(-y * y * 7.0) * 0.2;
      float head = smoothstep(uGrow, uGrow - 0.05, vUv.x);
      // Fascio esterno: nasce sfumato fuori schermo. Fascio interno al vetro:
      // sfumato a entrambe le estremità.
      float tail = mix(smoothstep(0.0, 0.4, vUv.x),
                       smoothstep(0.0, 0.25, vUv.x) * smoothstep(1.0, 0.7, vUv.x), uInner);
      float shimmer = 0.86 + 0.28 * noise(vec2(vUv.x * 16.0 - uTime * 0.7, y * 1.5 + uTime * 0.1));
      float a = (core * 1.7 + halo) * head * tail * shimmer * uIntensity;
      gl_FragColor = vec4(uColor * a, 1.0);
      #include <colorspace_fragment>
    }
  `,
};

/* ---- Ventaglio dello spettro in uscita ---- */
export const fan = {
  vertex: /* glsl */ `
    uniform vec3 uOrigin;
    uniform float uAngle;
    uniform float uSpread;
    uniform float uLength;
    uniform float uAperture;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      float a = uAngle + (uv.y - 0.5) * uSpread;
      vec2 dir = vec2(cos(a), sin(a));
      vec2 perp = vec2(-sin(uAngle), cos(uAngle));
      vec2 p = uOrigin.xy + perp * (uv.y - 0.5) * uAperture + dir * (uv.x * uLength);
      gl_Position = projectionMatrix * viewMatrix * vec4(p, uOrigin.z, 1.0);
    }
  `,
  fragment: /* glsl */ `
    uniform vec3 uStops[7];
    uniform float uTime;
    uniform float uOpen;
    uniform float uIntensity;
    varying vec2 vUv;
    ${NOISE}
    vec3 spectrum(float t) {
      float x = clamp(t, 0.0, 1.0) * 6.0;
      int i = int(floor(x));
      float f = smoothstep(0.0, 1.0, fract(x));
      return mix(uStops[i], uStops[min(i + 1, 6)], f);
    }
    void main() {
      float across = vUv.y;
      float along = vUv.x;
      vec3 col = spectrum(1.0 - across);
      float edge = smoothstep(0.0, 0.14, across) * smoothstep(1.0, 0.86, across);
      float fall = pow(1.0 - along, 1.35) * smoothstep(0.0, 0.025, along);
      float open = smoothstep(uOpen, uOpen - 0.12, along);
      float streak = 0.78 + 0.44 * noise(vec2(across * 26.0, along * 2.5 - uTime * 0.22));
      float a = edge * fall * open * streak * uIntensity;
      gl_FragColor = vec4(col * a, 1.0);
      #include <colorspace_fragment>
    }
  `,
};

/* ---- Pulviscolo nel fascio, come in una vetrina al pomeriggio ---- */
export const dust = {
  vertex: /* glsl */ `
    attribute vec3 aSeed;
    uniform vec3 uA;
    uniform vec3 uB;
    uniform float uWidth;
    uniform float uTime;
    uniform float uSize;
    uniform float uGrow;
    varying float vAlpha;
    void main() {
      vec3 dir = normalize(uB - uA);
      vec3 nrm = vec3(-dir.y, dir.x, 0.0);
      float t = fract(aSeed.x + uTime * 0.006 * (0.4 + aSeed.z));
      vec3 p = mix(uA, uB, t) + nrm * aSeed.y * uWidth;
      p.y += sin(uTime * 0.5 + aSeed.z * 6.2831) * 0.05;
      p.z += (aSeed.z - 0.5) * 0.9;
      vec4 mv = viewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      float inBeam = exp(-aSeed.y * aSeed.y * 5.0);
      float twinkle = 0.5 + 0.5 * sin(uTime * (0.8 + aSeed.z * 2.2) + aSeed.z * 31.0);
      vAlpha = inBeam * (0.25 + 0.75 * twinkle)
        * step(t, uGrow) * smoothstep(0.08, 0.3, t) * smoothstep(1.0, 0.92, t);
      gl_PointSize = uSize * (0.55 + aSeed.z) * (18.0 / -mv.z);
    }
  `,
  fragment: /* glsl */ `
    varying float vAlpha;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      float a = smoothstep(0.5, 0.0, d) * vAlpha;
      gl_FragColor = vec4(vec3(1.0, 0.96, 0.88) * a, 1.0);
      #include <colorspace_fragment>
    }
  `,
};

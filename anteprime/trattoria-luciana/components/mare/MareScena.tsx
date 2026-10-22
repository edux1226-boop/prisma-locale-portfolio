'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Vector2 } from 'three';
import { VERTICE, FRAMMENTO } from './acqua';
import { statoMare } from './stato';

/* La scena WebGL del mare (React Three Fiber). Un solo piano a schermo
   intero con lo shader dell'acqua; la regia scrive `statoMare.avvicina`
   scorrendo, la scena lo legge a ogni fotogramma.

   Si regola da sola: misura il frame rate e, se serve, abbassa la
   risoluzione; se non basta rinuncia e lascia il fermo immagine. Si ferma
   fuori schermo e quando la scheda è nascosta (rAF non gira). */

/** Lo stesso istante del fermo immagine: il passaggio dall'uno all'altra non si vede. */
export const ISTANTE_FERMO = 12;
/** Tetto di pixel disegnati (≈ 1600×1500): la qualità resta, il costo no. */
const PIXEL_MASSIMI = 2_400_000;

type Misura = (fps: number) => void;

function Acqua({ onPrimoFotogramma, onMisura }: { onPrimoFotogramma: () => void; onMisura: Misura }) {
  const { gl } = useThree();
  const uniformi = useMemo(
    () => ({
      uTempo: { value: ISTANTE_FERMO },
      uRis: { value: new Vector2(1, 1) },
      uAvvicina: { value: 0 },
      uPuntatore: { value: new Vector2(0, 0) },
      uLuce: { value: 1 },
      uGrana: { value: 0 },
    }),
    [],
  );
  const puntatore = useRef({ x: 0, y: 0 });
  const conta = useRef({ t: 0, n: 0, primo: false, riscaldamento: 1.2 });

  useEffect(() => {
    const muovi = (e: PointerEvent) => {
      puntatore.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      puntatore.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', muovi, { passive: true });
    return () => window.removeEventListener('pointermove', muovi);
  }, []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20);
    uniformi.uTempo.value += dt;
    gl.getDrawingBufferSize(uniformi.uRis.value);
    uniformi.uAvvicina.value = statoMare.avvicina;
    const p = uniformi.uPuntatore.value;
    const k = Math.min(1, dt * 1.6);
    p.x += (puntatore.current.x - p.x) * k;
    p.y += (-puntatore.current.y - p.y) * k;

    const c = conta.current;
    if (!c.primo) {
      c.primo = true;
      requestAnimationFrame(onPrimoFotogramma);
      return;
    }
    if (c.riscaldamento > 0) { c.riscaldamento -= delta; return; }
    c.t += delta;
    c.n += 1;
    if (c.t >= 2) {
      onMisura(c.n / c.t);
      c.t = 0;
      c.n = 0;
    }
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial vertexShader={VERTICE} fragmentShader={FRAMMENTO} uniforms={uniformi} depthTest={false} depthWrite={false} />
    </mesh>
  );
}

function dprIniziale() {
  const px = window.innerWidth * window.innerHeight;
  return Math.max(0.6, Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(PIXEL_MASSIMI / px)));
}

export default function MareScena({ onPronto, onRinuncia }: { onPronto: () => void; onRinuncia: () => void }) {
  const contenitore = useRef<HTMLDivElement>(null);
  const [dpr, setDpr] = useState(dprIniziale);
  const [visibile, setVisibile] = useState(true);
  const riduzioni = useRef(0);

  useEffect(() => {
    const el = contenitore.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      statoMare.visibile = e.isIntersecting;
      setVisibile(e.isIntersecting);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const suMisura: Misura = (fps) => {
    if (fps >= 48) return;
    if (riduzioni.current < 2) {
      riduzioni.current += 1;
      setDpr((d) => Math.max(0.5, d * 0.7));
      return;
    }
    if (fps < 28) onRinuncia();
  };

  return (
    <div ref={contenitore} style={{ position: 'absolute', inset: 0 }}>
      <Canvas
        frameloop={visibile ? 'always' : 'never'}
        dpr={dpr}
        flat
        linear
        gl={{ antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'high-performance' }}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            onRinuncia();
          });
        }}
      >
        <Acqua onPrimoFotogramma={onPronto} onMisura={suMisura} />
      </Canvas>
    </div>
  );
}

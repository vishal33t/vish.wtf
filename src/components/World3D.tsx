'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// One fixed scene behind the whole page. Scroll drives rotation, drift and scale; pointer adds parallax.
export default function World3D() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!; let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true }); } catch { canvas.style.display = 'none'; return; }
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100); camera.position.z = 11;
    const INK = 0x0f1e2b, RED = 0xd3182a, d: { dispose(): void }[] = [];
    const t = <T extends { dispose(): void }>(o: T) => (d.push(o), o);
    const core = new THREE.Group(); scene.add(core);

    const eIco = t(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.2, 1)));
    const mInk = t(new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.6 }));
    core.add(new THREE.LineSegments(eIco, mInk));
    const eOct = t(new THREE.EdgesGeometry(new THREE.OctahedronGeometry(1.15)));
    const mRed = t(new THREE.LineBasicMaterial({ color: RED }));
    const inner = new THREE.LineSegments(eOct, mRed); core.add(inner);
    const pts = t(new THREE.IcosahedronGeometry(2.2, 1));
    const pm = t(new THREE.PointsMaterial({ color: RED, size: 0.09 })); core.add(new THREE.Points(pts, pm));

    const rings: THREE.Mesh[] = []; const sats: THREE.Mesh[] = [];
    const sg = t(new THREE.BoxGeometry(0.16, 0.16, 0.16)), sm = t(new THREE.MeshBasicMaterial({ color: RED }));
    [3.2, 3.8, 4.5].forEach((r, i) => {
      const g = t(new THREE.TorusGeometry(r, 0.007, 6, 180)), m = t(new THREE.MeshBasicMaterial({ color: i === 1 ? RED : INK, transparent: true, opacity: i === 1 ? 0.8 : 0.45 }));
      const ring = new THREE.Mesh(g, m); ring.rotation.set(1.1 + i * 0.5, i * 0.6, 0); core.add(ring); rings.push(ring);
      const s = new THREE.Mesh(sg, sm); ring.add(s); sats.push(s);
    });

    let W = 1, H = 1, aspect = 1;
    const resize = () => { W = innerWidth; H = innerHeight; aspect = W / H; renderer.setPixelRatio(Math.min(devicePixelRatio, W < 768 ? 1.25 : 2)); renderer.setSize(W, H, false); camera.aspect = aspect; camera.updateProjectionMatrix(); };
    resize();
    const p = { x: 0, y: 0 }, s = { cur: 0, tgt: 0 };
    const onMove = (e: PointerEvent) => { p.x = (e.clientX / W - 0.5) * 2; p.y = (e.clientY / H - 0.5) * 2; };
    const onScroll = () => { s.tgt = scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight); if (reduced) draw(0); };
    const clock = new THREE.Clock(); let raf = 0;
    function draw(time: number) {
      s.cur += (s.tgt - s.cur) * (reduced ? 1 : 0.07);
      const visH = 2 * 11 * Math.tan(THREE.MathUtils.degToRad(20)), visW = visH * aspect, wide = aspect > 1.1;
      const k = Math.min(s.cur * 5, 1);
      core.position.x = wide ? visW * 0.23 * Math.cos(s.cur * Math.PI * 5) : 0;
      core.position.y = wide ? 0 : visH * 0.3 * (1 - k) - visH * 0.1 * k;
      core.scale.setScalar((wide ? 1 : 0.62) * (1 - 0.35 * k));
      core.rotation.y = s.cur * 9 + time * 0.12 + p.x * 0.35; core.rotation.x = s.cur * 2 + p.y * 0.25;
      inner.rotation.y = -time * 0.5; inner.rotation.x = time * 0.3;
      rings.forEach((r, i) => { r.rotation.z = time * 0.08 * (i + 1); sats[i].position.set(Math.cos(time * (0.5 + i * 0.2)) * (3.2 + i * 0.65), Math.sin(time * (0.5 + i * 0.2)) * (3.2 + i * 0.65), 0); });
      mInk.opacity = wide ? 0.6 : 0.3;
      renderer.render(scene, camera);
    }
    const loop = () => { if (!document.hidden) draw(clock.elapsedTime); raf = requestAnimationFrame(loop); };
    addEventListener('resize', () => { resize(); if (reduced) draw(0); }); addEventListener('scroll', onScroll, { passive: true }); addEventListener('pointermove', onMove);
    onScroll(); if (reduced) draw(0); else loop();
    return () => { cancelAnimationFrame(raf); removeEventListener('scroll', onScroll); removeEventListener('pointermove', onMove); d.forEach(x => x.dispose()); renderer.dispose(); };
  }, []);
  return <canvas ref={ref} className="world" aria-hidden="true" />;
}

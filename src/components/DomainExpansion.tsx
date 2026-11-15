'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

type Props = { onDone: () => void; onFail: () => void };

function glowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d')!; const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,90,100,1)'); r.addColorStop(0.25, 'rgba(220,20,40,.55)'); r.addColorStop(1, 'rgba(120,0,10,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
}

export default function DomainExpansion({ onDone, onFail }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const flash = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLDivElement>(null);
  const done = useRef(onDone); done.current = onDone;

  useEffect(() => {
    const el = host.current!;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' }); }
    catch { onFail(); return; }
    const small = window.innerWidth < 768 || (navigator.hardwareConcurrency || 4) < 4;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1 : 1.75));
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x030202);
    const camera = new THREE.PerspectiveCamera(60, el.clientWidth / el.clientHeight, 0.1, 200); camera.position.z = 14;
    const disposables: { dispose(): void }[] = [];
    const track = <T extends { dispose(): void }>(o: T) => (disposables.push(o), o);

    // drifting crimson particles
    const N = small ? 900 : 2600, pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = 3 + Math.random() * 30, t = Math.random() * 6.283, p = Math.acos(2 * Math.random() - 1);
      pos.set([r * Math.sin(p) * Math.cos(t), r * Math.sin(p) * Math.sin(t), r * Math.cos(p)], i * 3);
    }
    const pg = track(new THREE.BufferGeometry()); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pm = track(new THREE.PointsMaterial({ color: 0xd0102a, size: 0.07, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    const particles = new THREE.Points(pg, pm); scene.add(particles);

    // glowing point
    const tex = track(glowTexture());
    const gg = track(new THREE.BufferGeometry()); gg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3), 3));
    const gm = track(new THREE.PointsMaterial({ map: tex, size: 70, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    scene.add(new THREE.Points(gg, gm));

    // original slash geometry: thin crimson/white bars cut across the frame
    const bg = track(new THREE.BoxGeometry(1, 0.02, 0.02));
    const slashes = Array.from({ length: 7 }, (_, i) => {
      const m = track(new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? 0xf1e9e4 : 0xe01428, transparent: true, opacity: 1 }));
      const s = new THREE.Mesh(bg, m);
      s.rotation.z = (Math.random() - 0.5) * 1.6; s.position.set((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, Math.random() * 4 - 2);
      s.scale.x = 0.001; scene.add(s); return s;
    });

    // the domain: nested wireframe shells and rings that open around the camera
    const domain = new THREE.Group(); domain.scale.setScalar(0.001); scene.add(domain);
    const ig = track(new THREE.IcosahedronGeometry(1, 2)), rg = track(new THREE.RingGeometry(0.985, 1, 128));
    [18, 12, 7].forEach((r, i) => {
      const m = track(new THREE.MeshBasicMaterial({ color: i === 0 ? 0x8a0b18 : 0x5a0710, wireframe: true, transparent: true, opacity: 0.55 }));
      const s = new THREE.Mesh(ig, m); s.scale.setScalar(r); domain.add(s);
    });
    for (let i = 0; i < 6; i++) {
      const m = track(new THREE.MeshBasicMaterial({ color: i % 2 ? 0xe01428 : 0xf1e9e4, side: THREE.DoubleSide, transparent: true, opacity: 0.8 }));
      const r = new THREE.Mesh(rg, m); r.scale.setScalar(4 + i * 2.2); r.position.z = -i * 3 + 4; r.rotation.x = (i - 3) * 0.12; domain.add(r);
    }

    const shake = { amp: 0 };
    const letters = title.current!.querySelectorAll('.t-letter');
    const q = gsap.utils.selector(title.current!);
    const tl = gsap.timeline({ onComplete: () => done.current() });
    tl.to(pm, { opacity: 0.85, duration: 1.3, ease: 'power1.in' }, 0)
      .to(gm, { opacity: 1, duration: 1, ease: 'power2.out' }, 0.2)
      .to(camera.position, { z: 9, duration: 2.3, ease: 'power2.in' }, 0);
    slashes.forEach((s, i) => {
      const t0 = 1.2 + i * 0.13;
      tl.to(s.scale, { x: 34, duration: 0.18, ease: 'expo.out' }, t0).to(s.material as THREE.Material, { opacity: 0, duration: 0.35 }, t0 + 0.12);
    });
    tl.to(shake, { amp: 0.22, duration: 0.05 }, 1.2).to(shake, { amp: 0, duration: 1 }, 1.3)
      .fromTo(flash.current!, { opacity: 0 }, { opacity: 0.95, duration: 0.07 }, 2.35).to(flash.current!, { opacity: 0, duration: 0.6 }, 2.42)
      .to(domain.scale, { x: 1, y: 1, z: 1, duration: 0.9, ease: 'expo.out' }, 2.35)
      .to(shake, { amp: 0.3, duration: 0.05 }, 2.35).to(shake, { amp: 0, duration: 0.9 }, 2.4)
      .to(camera.position, { z: 2, duration: 1.8, ease: 'power3.out' }, 2.4)
      .to(gm, { opacity: 0, duration: 0.5 }, 2.4)
      .fromTo(letters, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.06, duration: 0.55, ease: 'power4.out' }, 3.1)
      .fromTo(q('.t-sub'), { opacity: 0 }, { opacity: 1, duration: 0.5 }, 3.8)
      .to(el, { opacity: 0, duration: 0.55 }, 4.5).to(title.current!, { opacity: 0, duration: 0.45 }, 4.6);

    let raf = 0; const clock = new THREE.Clock();
    const loop = () => {
      const dt = clock.getDelta();
      particles.rotation.y += dt * 0.05; domain.rotation.z += dt * 0.25; domain.rotation.y -= dt * 0.12;
      camera.rotation.z = (Math.random() - 0.5) * shake.amp * 0.15;
      camera.position.x = Math.sin(clock.elapsedTime * 0.6) * 0.15 + (Math.random() - 0.5) * shake.amp;
      renderer.render(scene, camera); raf = requestAnimationFrame(loop);
    };
    loop();
    const onResize = () => { renderer.setSize(el.clientWidth, el.clientHeight); camera.aspect = el.clientWidth / el.clientHeight; camera.updateProjectionMatrix(); };
    window.addEventListener('resize', onResize);

    return () => { // runs on unmount and on Strict Mode's simulated unmount
      tl.kill(); cancelAnimationFrame(raf); window.removeEventListener('resize', onResize);
      disposables.forEach(d => d.dispose()); renderer.dispose(); renderer.domElement.remove();
    };
  }, [onFail]);

  return (
    <>
      <div ref={host} className="intro-canvas" aria-hidden="true" />
      <div ref={flash} className="intro-flash" aria-hidden="true" />
      <div ref={title} className="intro-title">
        <h1 className="t-word" aria-label="vish.wtf">{'VISH.WTF'.split('').map((c, i) => <span key={i} className="t-mask" aria-hidden="true"><span className="t-letter">{c}</span></span>)}</h1>
        <p className="t-sub">Domain Expansion</p>
      </div>
    </>
  );
}

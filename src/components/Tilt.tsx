'use client';
import { useRef } from 'react';
// Pointer-driven 3D tilt. Children can use translateZ() because of preserve-3d.
export default function Tilt({ children, className }: { children: React.ReactNode; className?: string }) {
  const el = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.current!.getBoundingClientRect();
    el.current!.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 22}deg`);
    el.current!.style.setProperty('--rx', `${-((e.clientY - r.top) / r.height - 0.5) * 18}deg`);
  };
  const reset = () => { el.current!.style.setProperty('--ry', '-12deg'); el.current!.style.setProperty('--rx', '8deg'); };
  return <div className="tilt-wrap" onPointerMove={move} onPointerLeave={reset}><div ref={el} className={`tilt ${className ?? ''}`}>{children}</div></div>;
}

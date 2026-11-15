'use client';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { INTROS, SESSION_KEY, pickIntro } from '@/lib/intros';

const DomainExpansion = dynamic(() => import('./DomainExpansion'), { ssr: false });
type Mode = 'idle' | 'scene' | 'static' | 'done';

export default function IntroController() {
  const [mode, setMode] = useState<Mode>('idle');
  const [leaving, setLeaving] = useState(false);
  const finish = useCallback(() => { // fade the dark overlay out so the light site is revealed, then unmount
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* storage blocked: intro may replay on refresh */ }
    setLeaving(true); setTimeout(() => { document.documentElement.dataset.intro = 'done'; setMode('done'); }, 550);
  }, []);
  const fallback = useCallback(() => setMode('static'), []);

  useEffect(() => {
    let played = false; try { played = !!sessionStorage.getItem(SESSION_KEY); } catch { /* ignore */ }
    if (played) { setMode('done'); return; }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const id = pickIntro(); void INTROS; void id; // only one intro today; id selects the scene once more exist
    setMode(reduced ? 'static' : 'scene');
  }, []);

  useEffect(() => { // static title (reduced motion or no WebGL) is short; the scene gets a hard safety cap
    if (mode !== 'static' && mode !== 'scene') return;
    const t = setTimeout(finish, mode === 'static' ? 1600 : 9000);
    return () => clearTimeout(t);
  }, [mode, finish]);

  if (mode === 'done') return null;
  return (
    <div className={`intro-root${leaving ? " leaving" : ""}`} role="dialog" aria-label="vish.wtf intro">
      {mode === 'scene' && <DomainExpansion onDone={finish} onFail={fallback} />}
      {mode === 'static' && <div className="intro-title static"><p className="t-word static-word">VISH.WTF</p></div>}
      <button type="button" className="intro-skip" onClick={finish}>Skip intro</button>
    </div>
  );
}

'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Content, Project } from '@/data/defaults';

type Note = { id: number; section: string; name: string; text: string; approved: number; created_at: string };
type Tab = 'profile' | 'projects' | 'skills' | 'education' | 'notes';
const list = (s: string) => s.split(',').map(x => x.trim()).filter(Boolean);
const blank = (): Project => ({ slug: 'new-project', title: 'New project', status: 'Concept', published: false, summary: '', tech: [], github: '', live: '', images: [], problem: '', solution: '', architecture: '', decisions: '', challenges: '', results: '' });

function F({ label, value, onChange, area, hint }: { label: string; value: string; onChange: (v: string) => void; area?: boolean; hint?: string }) {
  return (<label className="f"><span>{label}</span>{area ? <textarea rows={4} value={value} onChange={e => onChange(e.target.value)} /> : <input value={value} onChange={e => onChange(e.target.value)} />}{hint && <small>{hint}</small>}</label>);
}

export default function AdminApp({ enabled, authed, initial }: { enabled: boolean; authed: boolean; initial: Content | null }) {
  const [ok, setOk] = useState(authed); const [c, setC] = useState<Content | null>(initial);
  const saved = useRef(initial ? JSON.stringify(initial) : '');
  const [pw, setPw] = useState(''); const [msg, setMsg] = useState(''); const [tab, setTab] = useState<Tab>('profile');
  const [open, setOpen] = useState(0); const [notes, setNotes] = useState<Note[]>([]);
  const dirty = useMemo(() => !!c && JSON.stringify(c) !== saved.current, [c, msg]); // msg changes after save
  const pending = notes.filter(n => !n.approved).length;

  const loadNotes = async () => { const r = await fetch('/api/admin/notes'); if (r.ok) setNotes(await r.json()); };
  useEffect(() => { if (ok) void loadNotes(); }, [ok]);
  useEffect(() => { const h = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); }; addEventListener('beforeunload', h); return () => removeEventListener('beforeunload', h); }, [dirty]);

  async function login(e: React.FormEvent) {
    e.preventDefault(); setMsg('');
    const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: pw }) });
    if (!r.ok) return setMsg((await r.json()).error);
    const d = await (await fetch('/api/admin/content')).json(); saved.current = JSON.stringify(d); setC(d); setOk(true); setMsg('');
  }
  async function save() {
    setMsg('Saving…');
    const r = await fetch('/api/admin/content', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(c) });
    if (r.ok) { saved.current = JSON.stringify(c); setMsg('Saved. The public site is updated.'); } else setMsg((await r.json()).error);
  }
  async function upload(i: number, files: FileList | null) {
    if (!files || !c) return; const added: string[] = [];
    for (const f of Array.from(files)) {
      const fd = new FormData(); fd.append('file', f);
      const r = await fetch('/api/admin/upload', { method: 'POST', body: fd }); const d = await r.json();
      if (r.ok) added.push(d.name); else setMsg(`${f.name}: ${d.error}`);
    }
    if (added.length) setC(cur => cur && { ...cur, projects: cur.projects.map((p, j) => j === i ? { ...p, images: [...(p.images ?? []), ...added] } : p) });
  }
  async function logout() { await fetch('/api/admin/logout', { method: 'POST' }); setOk(false); setC(null); setPw(''); setMsg(''); }
  async function approve(id: number, approved: boolean) { await fetch('/api/admin/notes', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, approved }) }); loadNotes(); }
  async function remove(id: number) { if (confirm('Delete this note?')) { await fetch(`/api/admin/notes?id=${id}`, { method: 'DELETE' }); loadNotes(); } }

  if (!enabled) return <main className="gate"><h1>Admin is switched off</h1><p>Set <code>ADMIN_PASSWORD</code> and a <code>SESSION_SECRET</code> of 16+ characters in <code>.env.local</code>, then restart the server.</p></main>;
  if (!ok || !c) return (
    <main className="gate"><h1>Admin</h1><p className="muted">vish.wtf control room</p>
      <form onSubmit={login}><F label="Password" value={pw} onChange={setPw} /><button className="btn" type="submit">Sign in</button></form>
      {msg && <p role="alert" className="err">{msg}</p>}
    </main>);

  const setP = (k: keyof Content['profile'], v: string) => setC({ ...c, profile: { ...c.profile, [k]: v } });
  const setPr = (i: number, patch: Partial<Project>) => setC({ ...c, projects: c.projects.map((p, j) => (j === i ? { ...p, ...patch } : p)) });
  const move = (i: number, d: number) => { const a = [...c.projects]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; setC({ ...c, projects: a }); setOpen(j); };
  const tabs: [Tab, string][] = [['profile', 'Profile'], ['projects', 'Projects'], ['skills', 'Skills'], ['education', 'Education'], ['notes', 'Margin notes']];

  return (
    <div className="dash">
      <aside className="side">
        <p className="wordmark">vish<span>.wtf</span></p>
        <nav aria-label="Admin sections">{tabs.map(([k, l]) => (
          <button key={k} className={tab === k ? 'on' : ''} aria-current={tab === k} onClick={() => setTab(k)}>{l}{k === 'notes' && pending > 0 && <em>{pending}</em>}</button>))}</nav>
        <div className="side-foot"><a className="link" href="/" target="_blank">View site</a><button className="link" onClick={logout}>Sign out</button></div>
      </aside>

      <main className="panel">
        {tab === 'profile' && (<section><h1>Profile</h1>
          <div className="two-col">{(['name', 'role', 'email', 'phone', 'location', 'github', 'linkedin'] as const).map(k => <F key={k} label={k} value={c.profile[k]} onChange={v => setP(k, v)} hint={k === 'phone' ? 'Public only if you fill it in.' : undefined} />)}</div>
          <F label="headline" value={c.profile.headline} onChange={v => setP('headline', v)} />
          <F label="intro" area value={c.profile.intro} onChange={v => setP('intro', v)} />
          <F label="about" area value={c.profile.about} onChange={v => setP('about', v)} hint="Leave a blank line between paragraphs." /></section>)}

        {tab === 'projects' && (<section><h1>Projects</h1>
          <div className="proj-list">{c.projects.map((p, i) => (
            <div key={i} className={`proj ${open === i ? 'open' : ''}`}>
              <button className="proj-head" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}><b>{p.title || 'Untitled'}</b><span className={p.published ? 'pub' : 'draft'}>{p.published ? 'Published' : 'Hidden'}</span></button>
              {open === i && (<div className="proj-body">
                <label className="f check"><input type="checkbox" checked={p.published} onChange={e => setPr(i, { published: e.target.checked })} /><span>Show on the site</span></label>
                <div className="two-col"><F label="title" value={p.title} onChange={v => setPr(i, { title: v })} />
                  <F label="slug" value={p.slug} onChange={v => setPr(i, { slug: v.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} hint={`Address: /projects/${p.slug}`} /></div>
                <label className="f"><span>status</span><select value={p.status} onChange={e => setPr(i, { status: e.target.value as Project['status'] })}><option>In progress</option><option>Completed</option><option>Concept</option></select></label>
                <F label="summary" area value={p.summary} onChange={v => setPr(i, { summary: v })} />
                <F label="technologies" value={p.tech.join(', ')} onChange={v => setPr(i, { tech: list(v) })} hint="Separate with commas." />
                <div className="two-col"><F label="GitHub URL" value={p.github} onChange={v => setPr(i, { github: v })} /><F label="Live demo URL" value={p.live} onChange={v => setPr(i, { live: v })} /></div>
                <div className="f"><span>Screenshots</span>
                  <div className="thumbs">{(p.images ?? []).map((im, k) => (<figure key={im}><img src={`/api/img/${im}`} alt="" />
                    <figcaption>{k === 0 ? 'Cover' : <button className="mini" onClick={() => setPr(i, { images: [im, ...p.images.filter(x => x !== im)] })}>Make cover</button>}
                      <button className="mini danger" onClick={() => setPr(i, { images: p.images.filter(x => x !== im) })}>Remove</button></figcaption></figure>))}</div>
                  <input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={e => { upload(i, e.target.files); e.target.value = ''; }} />
                  <small>PNG, JPG or WebP, up to 5 MB each. The first image is the cover on the homepage. Press Save changes afterwards.</small></div>
                {(['problem', 'solution', 'architecture', 'decisions', 'challenges', 'results'] as const).map(k => <F key={k} label={k} area value={p[k]} onChange={v => setPr(i, { [k]: v })} hint="Empty sections are hidden on the case-study page." />)}
                <div className="btn-row"><button className="mini" onClick={() => move(i, -1)}>Move up</button><button className="mini" onClick={() => move(i, 1)}>Move down</button>
                  <button className="mini danger" onClick={() => confirm('Delete this project?') && (setC({ ...c, projects: c.projects.filter((_, j) => j !== i) }), setOpen(-1))}>Delete</button></div>
              </div>)}
            </div>))}</div>
          <button className="btn" onClick={() => { setC({ ...c, projects: [...c.projects, blank()] }); setOpen(c.projects.length); }}>Add project</button></section>)}

        {tab === 'skills' && (<section><h1>Skills</h1>
          {c.skills.map((s, i) => (<div key={i} className="row2">
            <input aria-label="Group name" value={s.label} onChange={e => setC({ ...c, skills: c.skills.map((x, j) => j === i ? { ...x, label: e.target.value } : x) })} />
            <input aria-label="Items, comma separated" value={s.items.join(', ')} onChange={e => setC({ ...c, skills: c.skills.map((x, j) => j === i ? { ...x, items: list(e.target.value) } : x) })} />
            <button className="mini danger" onClick={() => setC({ ...c, skills: c.skills.filter((_, j) => j !== i) })}>Remove</button></div>))}
          <button className="btn" onClick={() => setC({ ...c, skills: [...c.skills, { label: 'New group', items: [] }] })}>Add skill group</button></section>)}

        {tab === 'education' && (<section><h1>Education</h1>
          {c.education.map((e, i) => { const up = (patch: Partial<typeof e>) => setC({ ...c, education: c.education.map((x, j) => j === i ? { ...x, ...patch } : x) });
            return (<div key={i} className="proj-body boxed"><F label="school" value={e.school} onChange={v => up({ school: v })} /><div className="two-col"><F label="degree" value={e.degree} onChange={v => up({ degree: v })} /><F label="period" value={e.period} onChange={v => up({ period: v })} /></div><F label="note" value={e.note} onChange={v => up({ note: v })} />
              <button className="mini danger" onClick={() => setC({ ...c, education: c.education.filter((_, j) => j !== i) })}>Remove</button></div>); })}
          <button className="btn" onClick={() => setC({ ...c, education: [...c.education, { school: '', degree: '', period: '', note: '' }] })}>Add education</button>
          <F label="certifications" value={c.certifications.join(', ')} onChange={v => setC({ ...c, certifications: list(v) })} hint="Separate with commas." /></section>)}

        {tab === 'notes' && (<section><h1>Margin notes</h1><p className="muted">Visitors mark up sections of your site. Nothing is public until you approve it.</p>
          {notes.length === 0 && <p>No notes yet.</p>}
          {notes.map(n => (<div key={n.id} className={`noteitem ${n.approved ? 'ok' : ''}`}><p><b>{n.name}</b> on <i>{n.section}</i>, {new Date(n.created_at).toLocaleString()}</p><p>{n.text}</p>
            <div className="btn-row"><button className="mini" onClick={() => approve(n.id, !n.approved)}>{n.approved ? 'Unpublish' : 'Approve and publish'}</button><button className="mini danger" onClick={() => remove(n.id)}>Delete</button></div></div>))}
        </section>)}
      </main>

      {tab !== 'notes' && <div className="savebar" role="status"><span>{msg || (dirty ? 'You have unsaved changes.' : 'Everything is saved.')}</span><button className="btn" onClick={save} disabled={!dirty}>Save changes</button></div>}
    </div>
  );
}

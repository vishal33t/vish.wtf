'use client';
import { useState } from 'react';
type N = { id: number; name: string; text: string };
// Visitor margin notes. Submissions are held for approval in /admin before they appear.
export default function MarkUp({ section, notes }: { section: string; notes: N[] }) {
  const [open, setOpen] = useState(false); const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);
  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget); setBusy(true); setMsg('');
    const r = await fetch('/api/notes', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ section, name: f.get('name'), text: f.get('text'), website: f.get('website') }) });
    setBusy(false);
    if (r.ok) { setMsg('Thanks. Your note is waiting for approval and will appear here once Vishal accepts it.'); setOpen(false); } else setMsg((await r.json()).error);
  }
  return (
    <aside className="markup" aria-label={`Margin notes for ${section}`}>
      {notes.map(n => <p key={n.id} className="note"><span>{n.name}</span>{n.text}</p>)}
      {msg && <p role="status" className="note-msg">{msg}</p>}
      {!open ? <button type="button" className="pen" onClick={() => setOpen(true)}>Mark up this section</button> : (
        <form onSubmit={send} className="note-form">
          <label>Your note<textarea name="text" required minLength={3} maxLength={280} rows={3} placeholder="A question, a correction, a kind word" /></label>
          <label>Name (optional)<input name="name" maxLength={40} autoComplete="name" /></label>
          <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hp" />
          <div><button className="btn" disabled={busy}>Send note</button> <button type="button" className="link" onClick={() => setOpen(false)}>Cancel</button></div>
        </form>)}
    </aside>
  );
}

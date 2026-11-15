import { NextResponse } from 'next/server';
import { addNote, NOTE_SECTIONS } from '@/lib/db';
const hits = new Map<string, number[]>();
export async function POST(req: Request) {
  const ip = (req.headers.get('x-forwarded-for') || 'local').split(',')[0].trim();
  const now = Date.now(), recent = (hits.get(ip) || []).filter(t => now - t < 10 * 60_000);
  if (recent.length >= 3) return NextResponse.json({ error: 'Too many notes. Try again in a few minutes.' }, { status: 429 });
  const b = await req.json().catch(() => null);
  if (!b) return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  if (b.website) return NextResponse.json({ ok: true }); // honeypot: pretend success to bots
  const clean = (v: unknown, n: number) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);
  const text = clean(b.text, 280), name = clean(b.name, 40) || 'Anonymous', section = clean(b.section, 20);
  if (!(NOTE_SECTIONS as readonly string[]).includes(section)) return NextResponse.json({ error: 'Unknown section.' }, { status: 400 });
  if (text.length < 3) return NextResponse.json({ error: 'Write at least a few characters.' }, { status: 400 });
  hits.set(ip, [...recent, now]); addNote(section, name, text);
  return NextResponse.json({ ok: true });
}

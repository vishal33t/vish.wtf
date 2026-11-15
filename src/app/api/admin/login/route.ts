import { NextResponse } from 'next/server';
import { COOKIE, makeToken, passwordOk, adminEnabled } from '@/lib/auth';
let fails = 0, windowStart = Date.now();
export async function POST(req: Request) {
  if (!adminEnabled()) return NextResponse.json({ error: 'Admin is disabled. Set ADMIN_PASSWORD and SESSION_SECRET (16+ chars).' }, { status: 503 });
  if (Date.now() - windowStart > 15 * 60_000) { fails = 0; windowStart = Date.now(); }
  if (fails >= 10) return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });
  const { password } = await req.json().catch(() => ({ password: '' }));
  if (!passwordOk(String(password ?? ''))) { fails++; await new Promise(r => setTimeout(r, 500)); return NextResponse.json({ error: 'Wrong password.' }, { status: 401 }); }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, makeToken(), { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 8 });
  return res;
}

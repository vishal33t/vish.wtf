import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

export const COOKIE = 'vish_admin';
const secret = () => process.env.SESSION_SECRET || '';
export const adminEnabled = () => !!process.env.ADMIN_PASSWORD && secret().length >= 16;
const sign = (p: string) => createHmac('sha256', secret()).update(p).digest('hex');

export function passwordOk(input: string) {
  const a = createHmac('sha256', 'cmp').update(input).digest();
  const b = createHmac('sha256', 'cmp').update(process.env.ADMIN_PASSWORD || '').digest();
  return adminEnabled() && timingSafeEqual(a, b);
}
export function makeToken() { const exp = String(Date.now() + 1000 * 60 * 60 * 8); return `${exp}.${sign(exp)}`; }
export async function isAdmin() {
  if (!adminEnabled()) return false;
  const t = (await cookies()).get(COOKIE)?.value;
  if (!t) return false;
  const [exp, sig] = t.split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const good = sign(exp);
  return sig.length === good.length && timingSafeEqual(Buffer.from(sig), Buffer.from(good));
}

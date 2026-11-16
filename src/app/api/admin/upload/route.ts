import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import fs from 'fs';
import path from 'path';
import { isAdmin } from '@/lib/auth';

const MAX = 5 * 1024 * 1024;
// Decide the type from the file's real bytes, never from its name or declared type.
function kind(b: Buffer): 'jpg' | 'png' | 'webp' | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP') return 'webp';
  return null;
}
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const file = (await req.formData().catch(() => null))?.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'No file received.' }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: 'Image is larger than 5 MB.' }, { status: 413 });
  const buf = Buffer.from(await file.arrayBuffer()); const ext = kind(buf);
  if (!ext) return NextResponse.json({ error: 'Only JPG, PNG or WebP images are allowed.' }, { status: 415 });
  const dir = path.join(process.cwd(), 'data', 'uploads'); fs.mkdirSync(dir, { recursive: true });
  const name = `${randomBytes(8).toString('hex')}.${ext}`; fs.writeFileSync(path.join(dir, name), buf);
  return NextResponse.json({ name });
}

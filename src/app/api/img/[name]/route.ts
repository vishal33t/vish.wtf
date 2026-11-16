import fs from 'fs';
import path from 'path';
const TYPES: Record<string, string> = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
export async function GET(_: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const m = /^[a-f0-9]{16}\.(jpg|png|webp)$/.exec(name); // strict pattern: no path tricks possible
  if (!m) return new Response('Not found', { status: 404 });
  try {
    const data = fs.readFileSync(path.join(process.cwd(), 'data', 'uploads', name));
    return new Response(new Uint8Array(data), { headers: { 'content-type': TYPES[m[1]], 'cache-control': 'public, max-age=31536000, immutable', 'x-content-type-options': 'nosniff' } });
  } catch { return new Response('Not found', { status: 404 }); }
}

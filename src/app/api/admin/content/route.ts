import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { getContent, saveContent } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { Content } from '@/data/defaults';

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(getContent());
}
export async function PUT(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const c = (await req.json().catch(() => null)) as Content | null;
  if (!c || typeof c.profile?.name !== 'string' || !Array.isArray(c.projects) || !Array.isArray(c.skills) || !Array.isArray(c.education))
    return NextResponse.json({ error: 'Invalid content shape.' }, { status: 400 });
  const slugs = c.projects.map(p => p.slug);
  if (slugs.some(s => !/^[a-z0-9-]+$/.test(s))) return NextResponse.json({ error: 'Project slugs may only use a-z, 0-9 and hyphens.' }, { status: 400 });
  if (new Set(slugs).size !== slugs.length) return NextResponse.json({ error: 'Project slugs must be unique.' }, { status: 400 });
  const okImg = /^[a-f0-9]{16}\.(jpg|png|webp)$/;
  c.projects = c.projects.map(p => ({ ...p, images: (Array.isArray(p.images) ? p.images : []).filter(n => okImg.test(n)) }));
  saveContent(c);
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}

import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { deleteNote, listNotes, setApproved } from '@/lib/db';
import { revalidatePath } from 'next/cache';
const deny = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
export async function GET() { return (await isAdmin()) ? NextResponse.json(listNotes(false)) : deny(); }
export async function PATCH(req: Request) {
  if (!(await isAdmin())) return deny();
  const { id, approved } = await req.json(); setApproved(Number(id), !!approved); revalidatePath('/'); return NextResponse.json({ ok: true });
}
export async function DELETE(req: Request) {
  if (!(await isAdmin())) return deny();
  deleteNote(Number(new URL(req.url).searchParams.get('id'))); revalidatePath('/'); return NextResponse.json({ ok: true });
}

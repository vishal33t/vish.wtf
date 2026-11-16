
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { deleteNote, listNotes, setApproved } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const deny = () =>
  NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

export async function GET() {
  if (!(await isAdmin())) return deny();

  try {
    return NextResponse.json(await listNotes(false));
  } catch (error) {
    console.error('Loading notes failed:', error);
    return NextResponse.json(
      { error: 'Could not load notes.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  if (!(await isAdmin())) return deny();

  try {
    const { id, approved } = await req.json();

    if (!Number.isSafeInteger(Number(id)) || Number(id) <= 0) {
      return NextResponse.json({ error: 'Invalid note ID.' }, { status: 400 });
    }

    await setApproved(Number(id), !!approved);
    revalidatePath('/');

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Updating note failed:', error);
    return NextResponse.json(
      { error: 'Could not update note.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) return deny();

  try {
    const id = Number(new URL(req.url).searchParams.get('id'));

    if (!Number.isSafeInteger(id) || id <= 0) {
      return NextResponse.json({ error: 'Invalid note ID.' }, { status: 400 });
    }

    await deleteNote(id);
    revalidatePath('/');

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Deleting note failed:', error);
    return NextResponse.json(
      { error: 'Could not delete note.' },
      { status: 500 }
    );
  }
}

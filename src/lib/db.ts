
import 'server-only';
import { defaults, type Content, type Project } from '@/data/defaults';
import { supabase } from '@/lib/supabase';

export const NOTE_SECTIONS = [
  'work',
  'about',
  'skills',
  'education',
  'contact',
] as const;

export type Note = {
  id: number;
  section: string;
  name: string;
  text: string;
  approved: number;
  created_at: string;
};

export async function getContent(): Promise<Content> {
  const { data, error } = await supabase
    .from('site_content')
    .select('content')
    .eq('id', 1)
    .maybeSingle();

  if (error) throw new Error(`Could not load content: ${error.message}`);

  const out = data?.content
    ? { ...defaults, ...data.content }
    : { ...defaults };

  out.projects = (out.projects as Project[]).map(p => ({
    ...p,
    images: Array.isArray(p.images) ? p.images : [],
  }));

  return out as Content;
}

export async function saveContent(c: Content): Promise<void> {
  const { error } = await supabase
    .from('site_content')
    .upsert(
      {
        id: 1,
        content: c,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

  if (error) throw new Error(`Could not save content: ${error.message}`);
}

export async function addNote(
  section: string,
  name: string,
  text: string
): Promise<void> {
  const { error } = await supabase.from('notes').insert({
    section,
    name,
    text,
    approved: 0,
  });

  if (error) throw new Error(`Could not add note: ${error.message}`);
}

export async function listNotes(approvedOnly: boolean): Promise<Note[]> {
  let query = supabase
    .from('notes')
    .select('*')
    .order('id', { ascending: false })
    .limit(300);

  if (approvedOnly) query = query.eq('approved', 1);

  const { data, error } = await query;

  if (error) throw new Error(`Could not load notes: ${error.message}`);

  return (data ?? []).map(n => ({
    ...n,
    id: Number(n.id),
  })) as Note[];
}

export async function setApproved(id: number, approved: boolean): Promise<void> {
  const { error } = await supabase
    .from('notes')
    .update({ approved: approved ? 1 : 0 })
    .eq('id', id);

  if (error) throw new Error(`Could not update note: ${error.message}`);
}

export async function deleteNote(id: number): Promise<void> {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Could not delete note: ${error.message}`);
}

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { defaults, type Content, type Project } from '@/data/defaults';

const dir = path.join(process.cwd(), 'data');
let db: Database.Database | null = null;
function conn() {
  if (!db) {
    fs.mkdirSync(dir, { recursive: true });
    db = new Database(path.join(dir, 'vish.db'));
    db.pragma('journal_mode = WAL');
    db.exec('CREATE TABLE IF NOT EXISTS content (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL)');
    db.exec('CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, section TEXT NOT NULL, name TEXT NOT NULL, text TEXT NOT NULL, approved INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL)');
  }
  return db;
}
const KEYS = Object.keys(defaults) as (keyof Content)[];

export function getContent(): Content {
  const d = conn();
  const out = { ...defaults } as Record<string, unknown>;
  for (const k of KEYS) {
    const row = d.prepare('SELECT value FROM content WHERE key = ?').get(k) as { value: string } | undefined;
    if (row) { try { out[k] = JSON.parse(row.value); } catch { /* keep default */ } }
  }
  out.projects = (out.projects as Project[]).map(p => ({ ...p, images: Array.isArray(p.images) ? p.images : [] }));
  return out as Content;
}
export function saveContent(c: Content) {
  const d = conn();
  const up = d.prepare('INSERT INTO content (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at');
  d.transaction(() => { for (const k of KEYS) up.run(k, JSON.stringify(c[k]), new Date().toISOString()); })();
}

// Margin notes: visitors mark up a section; nothing is public until approved in /admin.
export const NOTE_SECTIONS = ['work', 'about', 'skills', 'education', 'contact'] as const;
export type Note = { id: number; section: string; name: string; text: string; approved: number; created_at: string };
export const addNote = (section: string, name: string, text: string) =>
  void conn().prepare('INSERT INTO notes (section, name, text, approved, created_at) VALUES (?,?,?,0,?)').run(section, name, text, new Date().toISOString());
export const listNotes = (approvedOnly: boolean) =>
  conn().prepare(`SELECT * FROM notes ${approvedOnly ? 'WHERE approved = 1' : ''} ORDER BY id DESC LIMIT 300`).all() as Note[];
export const setApproved = (id: number, a: boolean) => void conn().prepare('UPDATE notes SET approved = ? WHERE id = ?').run(a ? 1 : 0, id);
export const deleteNote = (id: number) => void conn().prepare('DELETE FROM notes WHERE id = ?').run(id);

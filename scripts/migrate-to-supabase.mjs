
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createClient } from '@supabase/supabase-js';

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');

const root = process.cwd();

// Load environment variables from .env.local without printing secrets.
const envPath = path.join(root, '.env.local');

if (!fs.existsSync(envPath)) {
  throw new Error('.env.local file not found.');
}

for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (!match) continue;

  let value = match[2].trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  process.env[match[1]] ??= value;
}

const supabaseUrl = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !secretKey) {
  throw new Error('SUPABASE_URL or SUPABASE_SECRET_KEY is missing.');
}

const supabase = createClient(supabaseUrl, secretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const dbPath = path.join(root, 'data', 'vish.db');
const uploadsDir = path.join(root, 'data', 'uploads');

if (!fs.existsSync(dbPath)) {
  throw new Error('SQLite database not found at data/vish.db.');
}

const db = new Database(dbPath, { readonly: true });

try {
  console.log('Reading existing SQLite content...');

  const contentRows = db.prepare('SELECT key, value FROM content').all();
  const content = {};

  for (const row of contentRows) {
    try {
      content[row.key] = JSON.parse(row.value);
    } catch {
      throw new Error(`Could not parse content field: ${row.key}`);
    }
  }

  if (Object.keys(content).length === 0) {
    throw new Error('No content found in the SQLite content table.');
  }

  const notes = db.prepare(
    'SELECT section, name, text, approved, created_at FROM notes ORDER BY id ASC'
  ).all();

  console.log(`Found ${Object.keys(content).length} content fields.`);
  console.log(`Found ${notes.length} notes.`);

  // Check that the Supabase destination is safe to populate.
  const { data: existingContent, error: contentCheckError } = await supabase
    .from('site_content')
    .select('id')
    .eq('id', 1)
    .maybeSingle();

  if (contentCheckError) throw contentCheckError;

  const { count: existingNotes, error: notesCheckError } = await supabase
    .from('notes')
    .select('*', { count: 'exact', head: true });

  if (notesCheckError) throw notesCheckError;

  if (existingContent || (existingNotes ?? 0) > 0) {
    throw new Error(
      'Supabase already contains content or notes. Migration stopped to prevent overwriting or duplicate imports.'
    );
  }

  // Upload existing images.
  let uploaded = 0;

  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir, { withFileTypes: true })
      .filter(entry => entry.isFile());

    console.log(`Found ${files.length} image files to upload.`);

    for (const file of files) {
      const filePath = path.join(uploadsDir, file.name);
      const extension = path.extname(file.name).toLowerCase();

      const contentTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
      };

      const contentType = contentTypes[extension];

      if (!contentType) {
        console.log(`Skipping unsupported file: ${file.name}`);
        continue;
      }

      const buffer = fs.readFileSync(filePath);

      const { error } = await supabase.storage
        .from('project-images')
        .upload(file.name, buffer, {
          contentType,
          upsert: true,
        });

      if (error) {
        throw new Error(`Image upload failed for ${file.name}: ${error.message}`);
      }

      uploaded++;
      console.log(`Uploaded: ${file.name}`);
    }
  }

  // Import portfolio content.
  const { error: saveContentError } = await supabase
    .from('site_content')
    .insert({
      id: 1,
      content,
      updated_at: new Date().toISOString(),
    });

  if (saveContentError) throw saveContentError;

  console.log('Portfolio content imported.');

  // Import notes, preserving approval status and timestamps.
  if (notes.length > 0) {
    const { error: saveNotesError } = await supabase
      .from('notes')
      .insert(notes);

    if (saveNotesError) throw saveNotesError;
  }

  console.log('Notes imported.');

  console.log('\nMigration completed successfully.');
  console.log(`Content fields: ${Object.keys(content).length}`);
  console.log(`Notes: ${notes.length}`);
  console.log(`Images uploaded: ${uploaded}`);
  console.log('\nYour original SQLite database and image files were not changed.');
} finally {
  db.close();
}

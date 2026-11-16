
import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { isAdmin } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

const MAX = 5 * 1024 * 1024;

function kind(b: Buffer): 'jpg' | 'png' | 'webp' | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) {
    return 'jpg';
  }

  if (
    b.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    )
  ) {
    return 'png';
  }

  if (
    b.subarray(0, 4).toString() === 'RIFF' &&
    b.subarray(8, 12).toString() === 'WEBP'
  ) {
    return 'webp';
  }

  return null;
}

const CONTENT_TYPES = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const file = (await req.formData().catch(() => null))?.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'No file received.' },
        { status: 400 }
      );
    }

    if (file.size === 0 || file.size > MAX) {
      return NextResponse.json(
        { error: 'Image must be between 1 byte and 5 MB.' },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = kind(buffer);

    if (!ext) {
      return NextResponse.json(
        { error: 'Only JPG, PNG or WebP images are allowed.' },
        { status: 415 }
      );
    }

    const name = `${randomBytes(8).toString('hex')}.${ext}`;

    const { error } = await supabase.storage
      .from('project-images')
      .upload(name, buffer, {
        contentType: CONTENT_TYPES[ext],
        cacheControl: '31536000',
        upsert: false,
      });

    if (error) {
      console.error('Image upload failed:', error);

      return NextResponse.json(
        { error: 'Could not upload image.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ name });
  } catch (error) {
    console.error('Image upload failed:', error);

    return NextResponse.json(
      { error: 'Image upload failed. Please try again.' },
      { status: 500 }
    );
  }
}

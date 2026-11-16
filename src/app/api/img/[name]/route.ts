
import { supabase } from '@/lib/supabase';

const TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

export async function GET(
  _: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;

  const match = /^[a-f0-9]{16}\.(jpg|png|webp)$/.exec(name);

  if (!match) {
    return new Response('Not found', { status: 404 });
  }

  try {
    const { data, error } = await supabase.storage
      .from('project-images')
      .download(name);

    if (error || !data) {
      return new Response('Not found', { status: 404 });
    }

    return new Response(data, {
      headers: {
        'Content-Type': TYPES[match[1]],
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Image retrieval failed:', error);
    return new Response('Image retrieval failed', { status: 500 });
  }
}

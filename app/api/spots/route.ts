// app/api/spots/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

// === Обработка GET /api/spots ===
export async function GET() {
  const { data, error } = await supabase
    .from('tea-spot') // <-- use correct table name
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data); // статус 200 по умолчанию
}

// === Обработка POST /api/spots ===
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, longDescription, image, lat, lng } = body;

    if (!name || typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('tea-spot')
      .insert([
        {
          name,
          description: description || '',
          long_description: longDescription || '',
          image: image || '',
          lat,
          lng,
        },
      ])
      .select('*'); // fetch inserted row(s)
    console.log('Insert error:', error);
    console.log('Insert data:', data);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// app/api/spots/route.ts
import { NextResponse } from 'next/server';
import { spotDB } from '../../../lib/sqlite';

// === Обработка GET /api/spots ===
export async function GET() {
  try {
    const spots = spotDB.getAllSpots();
    return NextResponse.json(spots);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// === Обработка POST /api/spots ===
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, longDescription, image, lat, lng } = body;

    if (!name || typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newSpot = spotDB.createSpot({
      name,
      description: description || '',
      longDescription: longDescription || '',
      image: image || '',
      lat,
      lng,
    });
    
    console.log('Created spot:', newSpot);
    return NextResponse.json(newSpot, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

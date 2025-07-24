import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3002';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = (formData.get('file') || formData.get('image')) as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Get authorization header from the request
    const authHeader = request.headers.get('authorization');

    // Create a new FormData object for the backend request
    const backendFormData = new FormData();
    backendFormData.append('image', file);

    // Forward the request to the backend Cloudinary endpoint
    const response = await fetch(`${BACKEND_URL}/api/upload`, {
      method: 'POST',
      headers: {
        ...(authHeader && { 'Authorization': authHeader }),
      },
      body: backendFormData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ 
        error: errorData.error || 'Upload failed' 
      }, { status: response.status });
    }

    const data = await response.json();
    
    // Return the response from the backend (which includes Cloudinary URLs)
    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Failed to upload file' 
    }, { status: 500 });
  }
}
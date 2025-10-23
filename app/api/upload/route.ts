import { NextRequest, NextResponse } from 'next/server';

// Use internal server communication for server-side backend calls
// On production: http://127.0.0.1:3002 (internal network)
// In development: http://localhost:3002 (same machine)
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3002';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = (formData.get('file') || formData.get('image')) as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log(`[Upload Route] Forwarding upload to backend: ${BACKEND_URL}/api/upload`);

    // Create a new FormData object for the backend request
    const backendFormData = new FormData();
    backendFormData.append('image', file);

    // Get cookies from the request to forward HTTP-only cookies
    const cookieHeader = request.headers.get('cookie');

    // Forward the request to the backend Cloudinary endpoint
    // HTTP-only cookies are automatically sent via the cookie header
    const response = await fetch(`${BACKEND_URL}/api/upload`, {
      method: 'POST',
      headers: {
        ...(cookieHeader && { 'Cookie': cookieHeader }),
      },
      body: backendFormData,
      credentials: 'include', // Ensure cookies are sent
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[Upload Route] Upload failed with status ${response.status}:`, errorData);
      return NextResponse.json({
        error: errorData.error || 'Upload failed'
      }, { status: response.status });
    }

    const data = await response.json();

    console.log(`[Upload Route] Upload successful, received URL: ${data.url}`);

    // Return the response from the backend (which includes Cloudinary URLs)
    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error('[Upload Route] Error:', error.message);
    return NextResponse.json({
      error: 'Failed to upload file',
      details: error.message
    }, { status: 500 });
  }
}
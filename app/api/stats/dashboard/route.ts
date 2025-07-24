import { NextRequest, NextResponse } from 'next/server';
import { tokenManager } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get token from request headers
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    console.log('Dashboard API proxy - token received:', !!token);
    
    // Forward request to backend API
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3002';
    const backendResponse = await fetch(`${backendUrl}/api/stats/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    console.log('Backend response status:', backendResponse.status);
    
    const responseText = await backendResponse.text();
    
    if (!backendResponse.ok) {
      console.error('Backend stats error:', responseText);
      return NextResponse.json(
        { error: 'Failed to fetch dashboard statistics' },
        { status: backendResponse.status }
      );
    }
    
    const data = JSON.parse(responseText);
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in stats dashboard API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
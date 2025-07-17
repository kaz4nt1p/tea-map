import { NextRequest, NextResponse } from 'next/server';
import { tokenManager } from '../../../../../lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    // Get token from request headers
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    
    // Forward request to backend API
    const backendResponse = await fetch(`http://localhost:3002/api/stats/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    
    const responseText = await backendResponse.text();
    
    if (!backendResponse.ok) {
      console.error('Backend user stats error:', responseText);
      return NextResponse.json(
        { error: 'Failed to fetch user statistics' },
        { status: backendResponse.status }
      );
    }
    
    const data = JSON.parse(responseText);
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in user stats API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
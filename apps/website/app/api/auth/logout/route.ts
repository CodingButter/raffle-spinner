import { NextRequest, NextResponse } from 'next/server';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward the logout request to Directus
    const response = await fetch(`${DIRECTUS_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok && response.status !== 204) {
      const data = await response.json();
      return NextResponse.json(
        { errors: data.errors || [{ message: 'Logout failed' }] },
        { status: response.status }
      );
    }

    // Return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout proxy error:', error);
    return NextResponse.json({ errors: [{ message: 'Internal server error' }] }, { status: 500 });
  }
}

// Add CORS headers for extension
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

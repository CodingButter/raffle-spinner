import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

export async function GET(request: NextRequest) {
  try {
    // Get token from query parameters
    const token = request.nextUrl.searchParams.get('token');
    const returnUrl = request.nextUrl.searchParams.get('returnUrl') || '/dashboard';

    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verify the token by fetching user data
    const userResponse = await fetch(`${DIRECTUS_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!userResponse.ok) {
      // Token is invalid, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const userData = await userResponse.json();
    const user = userData.data || userData;

    // Create a session by setting cookies
    // Store the auth data in localStorage via a client-side script
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Logging in...</title>
          <meta charset="utf-8">
          <style>
            body {
              background: #000;
              color: #fff;
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .container {
              text-align: center;
            }
            .spinner {
              width: 40px;
              height: 40px;
              border: 3px solid rgba(255, 255, 255, 0.1);
              border-top-color: #8b5cf6;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 0 auto 20px;
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="spinner"></div>
            <p>Logging you in...</p>
          </div>
          <script>
            // Store auth data in localStorage
            const authData = {
              user: ${JSON.stringify(user)},
              tokens: {
                access_token: "${token}",
                refresh_token: "", // We don't have refresh token from extension
                expires: ${Date.now() + 24 * 60 * 60 * 1000} // Set expiry to 24 hours
              }
            };
            
            // Store in localStorage (matching auth service keys)
            localStorage.setItem('auth_user', JSON.stringify(authData.user));
            localStorage.setItem('auth_tokens', JSON.stringify(authData.tokens));
            
            // Redirect to dashboard
            window.location.href = "${returnUrl}";
          </script>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Auto-login error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

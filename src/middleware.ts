import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  // Check if this is a path that should be protected
  if (request.nextUrl.pathname.startsWith('/diary') || 
      request.nextUrl.pathname.startsWith('/api/entries')) {
    
    const token = request.cookies.get('token');

    if (!token) {
      // If accessing the diary page, redirect to login
      if (request.nextUrl.pathname.startsWith('/diary')) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      // If accessing the API, return unauthorized
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      // Verify the JWT token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token.value, secret);
      
      // Token is valid, allow the request
      return NextResponse.next();
    } catch (error) {
      // Token is invalid
      if (request.nextUrl.pathname.startsWith('/diary')) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Allow all other requests
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: ['/diary/:path*', '/api/entries/:path*'],
}; 
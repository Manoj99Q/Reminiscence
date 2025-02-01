import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { rateLimiter, diaryEntryLimiter } from './lib/rate-limit';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  // Apply rate limiting to all API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const rateLimitResult = await rateLimiter(request);
    if (rateLimitResult) return rateLimitResult;

    // Apply diary entry limit for POST requests to /api/entries
    if (request.nextUrl.pathname === '/api/entries' && request.method === 'POST') {
      const diaryLimitResult = await diaryEntryLimiter(request);
      if (diaryLimitResult) return diaryLimitResult;
    }
  }

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


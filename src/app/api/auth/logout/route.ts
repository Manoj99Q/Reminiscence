import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Clear the auth cookie by setting it to empty and expiring it
  response.cookies.set('token', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/', // Important: ensure cookie is cleared for all paths
  });

  return response;
} 
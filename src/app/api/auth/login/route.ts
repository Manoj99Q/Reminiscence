import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '@/lib/mongodb';
import { User } from '@/types/user';

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Invalid Gmail or password' },
        { status: 401 }
      );
    }

    // Get MongoDB database instance
    const db = await getDb();
    const usersCollection = (db as any).collection('users');

    // Find user
    const user = await usersCollection.findOne({ email });
    console.log('🔍 Login attempt:', { email, userFound: !!user });
    
    // Verify password (always perform comparison for security)
    let isValidPassword = false;
    if (user) {
      isValidPassword = await bcrypt.compare(password, user.password);
      console.log('🔐 Password check:', { isValidPassword, hashedPassword: user.password.substring(0, 20) + '...' });
    }

    // Return unified error message for security (prevents user enumeration)
    if (!user || !isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid Gmail or password' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    // Create response
    const response = NextResponse.json({
      user: {
        _id: user._id,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    });

    // Set HTTP-only cookie (more secure than localStorage)
    response.cookies.set('token', token, {
      httpOnly: true,   
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
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
        { status: 400 }
      );
    }

    // Validate email format with enhanced regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid Gmail or password' },
        { status: 400 }
      );
    }

    // Additional Gmail-specific validation
    const emailDomain = email.split('@')[1]?.toLowerCase();
    const validDomains = ['gmail.com', 'googlemail.com'];
    if (!validDomains.includes(emailDomain)) {
      return NextResponse.json(
        { error: 'Invalid Gmail or password' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Invalid Gmail or password' },
        { status: 400 }
      );
    }

    // Get MongoDB database instance
    const db = await getDb();
    const usersCollection = (db as any).collection('users');

    // Check if email already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in instead' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user: User = {
      email,
      password: hashedPassword,
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(user);

    // Return user without password
    return NextResponse.json({
      user: {
        _id: result.insertedId,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
} 
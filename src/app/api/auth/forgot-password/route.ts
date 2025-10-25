import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb } from '@/lib/mongodb';
import { sendEmail, generatePasswordResetEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get MongoDB database instance
    const db = await getDb();
    const usersCollection = (db as any).collection('users');
    const passwordResetsCollection = (db as any).collection('password_resets');

    // Find user
    const user = await usersCollection.findOne({ email });
    if (!user) {
      // Return success even if user doesn't exist (security)
      return NextResponse.json(
        { message: 'If the email exists, a reset link has been sent' },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token
    await passwordResetsCollection.insertOne({
      userId: user._id,
      email: user.email,
      token: resetToken,
      expiresAt: resetTokenExpiry,
      createdAt: new Date(),
    });

    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // Send password reset email
    const emailOptions = generatePasswordResetEmail(user.email, resetUrl);
    const emailSent = await sendEmail(emailOptions);
    
    if (!emailSent) {
      console.error('Failed to send password reset email to:', user.email);
      // Still return success to prevent email enumeration
    }
    
    return NextResponse.json(
      { message: 'If the email exists, a reset link has been sent' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process reset request' },
      { status: 500 }
    );
  }
}

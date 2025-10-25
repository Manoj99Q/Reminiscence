import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Get MongoDB database instance
    const db = await getDb();
    const passwordResetsCollection = (db as any).collection('password_resets');
    const usersCollection = (db as any).collection('users');

    // Find valid reset token
    const resetRecord = await passwordResetsCollection.findOne({
      token,
      expiresAt: { $gt: new Date() } // Token not expired
    });

    if (!resetRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Find user
    const user = await usersCollection.findOne({ _id: resetRecord.userId });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    );

    // Delete used reset token
    await passwordResetsCollection.deleteOne({ token });

    return NextResponse.json(
      { message: 'Password updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}








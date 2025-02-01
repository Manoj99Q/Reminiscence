import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getUserIdFromToken } from '@/lib/auth';
import { UserProfile } from '@/types/user';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = await getUserIdFromToken(token);
    const db = await getDb();
    const profilesCollection = db.collection<UserProfile>('user_profiles');

    const profile = await profilesCollection.findOne({ userId: new ObjectId(userId) });
    
    if (!profile) {
      return NextResponse.json({
        userId,
        gender: '',
        ageRange: '',
        ethnicity: '',
      });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = await getUserIdFromToken(token);
    const profile = await request.json();

    const db = await getDb();
    const profilesCollection = db.collection<UserProfile>('user_profiles');

    // Update or insert the profile
    await profilesCollection.updateOne(
      { userId: new ObjectId(userId) },
      { 
        $set: { 
          ...profile,
          userId: new ObjectId(userId),
          updatedAt: new Date()
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving user profile:', error);
    return NextResponse.json(
      { error: 'Failed to save profile' },
      { status: 500 }
    );
  }
} 
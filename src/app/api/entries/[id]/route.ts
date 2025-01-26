import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { jwtVerify } from 'jose';
import { deleteImage } from '@/lib/cloudinary';
import { DiaryEntry } from '@/types/diary';

// Helper to get user ID from token
async function getUserIdFromToken(token: string): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload.userId as string;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = await getUserIdFromToken(token);
    const db = await getDb();
    const entriesCollection = db.collection<DiaryEntry>('diary_entries');

    // First, find the entry to get the image URL
    const entry = await entriesCollection.findOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(userId),
    });

    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete the image from Cloudinary
    await deleteImage(entry.imageUrl);

    // Then delete the entry from the database
    const result = await entriesCollection.deleteOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(userId),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete entry' },
      { status: 500 }
    );
  }
} 
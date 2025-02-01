import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { deleteImage } from '@/lib/cloudinary';
import { DiaryEntry } from '@/types/diary';
import { getUserIdFromToken } from '@/lib/auth';

export async function DELETE(
  request: Request
) {
  try {
    // Get the id from the URL
    const id = request.url.split('/').pop();
    if (!id) {
      return NextResponse.json({ error: 'Invalid or missing id parameter' }, { status: 400 });
    }

    const req = request as NextRequest;
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = await getUserIdFromToken(token);
    const db = await getDb();
    const entriesCollection = db.collection<DiaryEntry>('diary_entries');

    // First, find the entry to get the image URL
    const entry = await entriesCollection.findOne({
      _id: new ObjectId(id),
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
      _id: new ObjectId(id),
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
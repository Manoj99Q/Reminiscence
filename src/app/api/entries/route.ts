import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { uploadImage, deleteImage } from '@/lib/cloudinary';
import { generateImage } from '@/lib/openai';
import { DiaryEntry, DiaryEntryResponse } from '@/types/diary';
import { getUserIdFromToken } from '@/lib/auth';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper to format entry for response
function formatEntry(entry: DiaryEntry): DiaryEntryResponse {
  return {
    id: entry._id!.toString(),
    content: entry.content,
    imageUrl: entry.imageUrl,
    date: entry.date.toISOString(),
    createdAt: entry.createdAt.toISOString(),
  };
}

// Helper to generate image prompt from content
async function generateImagePrompt(content: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `I will give you an experience or moment I had, and you come up with an image generation prompt for the situation. Use suitable mood, style and aesthetics you feel would match the moment. You can be creative and artistic too but should match the moment. Here's my moment: "${content}"`
        }
      ],
      temperature: 0.8,
      max_tokens: 100,
    });

    const imagePrompt = response.choices[0].message.content?.trim() || "A peaceful moment captured in time";
    return imagePrompt;
  } catch (error) {
    console.error('OpenAI prompt generation error:', error);
    return "A peaceful moment captured in time"; // Default fallback prompt
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content } = await request.json();
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const userId = await getUserIdFromToken(token);
    
    // Generate image prompt from content
    const imagePrompt = await generateImagePrompt(content);
    
    // Generate image using DALL-E
    const dalleImageUrl = await generateImage(imagePrompt);
    
    // Upload the DALL-E generated image to Cloudinary for permanent storage
    const cloudinaryUrl = await uploadImage(dalleImageUrl);

    const db = await getDb();
    const entriesCollection = db.collection<DiaryEntry>('diary_entries');

    const entry: DiaryEntry = {
      userId: new ObjectId(userId),
      content,
      imageUrl: cloudinaryUrl,
      date: new Date(),
      createdAt: new Date(),
      imagePrompt,
    };

    const result = await entriesCollection.insertOne(entry);
    return NextResponse.json(formatEntry({ ...entry, _id: result.insertedId }));
  } catch (error) {
    console.error('Error creating diary entry:', error);
    return NextResponse.json(
      { error: 'Failed to create diary entry' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = await getUserIdFromToken(token);
    const db = await getDb();
    const entriesCollection = db.collection<DiaryEntry>('diary_entries');

    // Get all entries for the user, sorted by date descending
    const entries = await entriesCollection
      .find({ userId: new ObjectId(userId) })
      .sort({ date: -1 })
      .toArray();

    // Format entries for response
    const formattedEntries = entries.map(formatEntry);
    return NextResponse.json({ entries: formattedEntries });
  } catch (error) {
    console.error('Error fetching diary entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch diary entries' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = await getUserIdFromToken(token);
    const db = await getDb();
    const entriesCollection = db.collection<DiaryEntry>('diary_entries');

    // First, get all entries to delete their images
    const entries = await entriesCollection
      .find({ userId: new ObjectId(userId) })
      .toArray();

    // Delete all images from Cloudinary
    await Promise.all(
      entries.map(entry => deleteImage(entry.imageUrl))
    );

    // Then delete all entries from the database
    const result = await entriesCollection.deleteMany({
      userId: new ObjectId(userId),
    });

    return NextResponse.json({ 
      success: true,
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Error deleting all entries:', error);
    return NextResponse.json(
      { error: 'Failed to delete entries' },
      { status: 500 }
    );
  }
} 
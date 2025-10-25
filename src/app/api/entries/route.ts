import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { uploadImage, deleteImage } from '@/lib/cloudinary';
import { generateImage } from '@/lib/openai';
import { DiaryEntry, DiaryEntryResponse } from '@/types/diary';
import { getUserIdFromToken } from '@/lib/auth';
import { UserProfile } from '@/types/user';

// Determine whether to use test data or OpenAI
const useTestData = process.env.USE_TEST_DATA === 'true';
console.log('Environment check - USE_TEST_DATA:', process.env.USE_TEST_DATA, 'useTestData:', useTestData);

// Helper to format entry for response
function formatEntry(entry: DiaryEntry): DiaryEntryResponse {
  console.log('formatEntry - Input entry:', { _id: entry._id, hasId: !!entry._id });
  if (!entry._id) {
    throw new Error('Entry missing _id field');
  }
  return {
    id: entry._id.toString(),
    content: entry.content,
    title: entry.title,
    imageUrl: entry.imageUrl,
    entryDate: entry.entryDate.toISOString(),
    createdAt: entry.createdAt.toISOString(),
    imagePrompt: entry.imagePrompt,
    stylizedContent: entry.stylizedContent,
    authorStyle: entry.authorStyle,
  };
}

// Note: OpenAI functions removed - now using simple text processing and Hugging Face for images

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/entries - Starting request');
    const token = request.cookies.get('token')?.value;
    if (!token) {
      console.log('POST /api/entries - No token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, entryDate } = await request.json();
    console.log('POST /api/entries - Request body:', { content: content?.substring(0, 50) + '...', entryDate });
    if (!content) {
      console.log('POST /api/entries - No content provided');
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    console.log('POST /api/entries - Getting userId from token');
    const userId = await getUserIdFromToken(token);
    console.log('POST /api/entries - UserId:', userId);
    
    console.log('POST /api/entries - Getting database connection');
    const db = await getDb();
    
    // Get user profile
    console.log('POST /api/entries - Getting user profile');
    const profilesCollection = (db as any).collection('user_profiles');
    // Use string userId for mock database, ObjectId for real MongoDB
    const userProfile = await profilesCollection.findOne({ userId: useTestData ? userId : new ObjectId(userId) });
    console.log('POST /api/entries - User profile:', userProfile);
    
    let title, imagePrompt, imageUrl, stylizedContent, authorStyle;
    console.log('POST /api/entries - useTestData:', useTestData);
    if (useTestData) {
      console.log('POST /api/entries - Using test data');
      // Generate a more meaningful title
      const words = content.split(' ').filter((word: string) => word.length > 0);
      if (words.length <= 3) {
        title = content;
      } else {
        title = words.slice(0, 4).join(' ') + (words.length > 4 ? '...' : '');
      }
      
      // Generate a more relevant image based on content keywords
      const keywords = content.toLowerCase().split(' ').filter((word: string) => 
        word.length > 3 && 
        !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'man', 'oil', 'sit', 'try', 'use', 'war', 'why', 'yes', 'yet', 'you'].includes(word)
      );
      
      // Create a more relevant image URL based on content
      const mainKeyword = keywords[0] || 'nature';
      imagePrompt = `A beautiful artistic image related to ${mainKeyword}`;
      
      // Use Lorem Picsum with keyword-based seeding for more relevant images
      // This creates deterministic but varied images based on content
      const seed = mainKeyword.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
      imageUrl = `https://picsum.photos/seed/${mainKeyword}-${seed}/1024/1024`;
      
      console.log('POST /api/entries - Generated image URL:', imageUrl);
      console.log('POST /api/entries - Main keyword:', mainKeyword, 'Seed:', seed);
      
      // Generate more interesting stylized content
      const styles = [
        'Ernest Hemingway', 'Virginia Woolf', 'Jane Austen', 'Gabriel García Márquez', 
        'Sylvia Plath', 'Maya Angelou', 'Mark Twain', 'Toni Morrison'
      ];
      const randomStyle = styles[Math.floor(Math.random() * styles.length)];
      
      stylizedContent = `"${content}" - A moment captured in the style of ${randomStyle}`;
      authorStyle = `Inspired by ${randomStyle}`;
    } else {
      console.log('POST /api/entries - Using Hugging Face/Cloudinary');
      
      // Generate title from content (simple text processing)
      const words = content.split(' ').filter((word: string) => word.length > 0);
      if (words.length <= 3) {
        title = content;
      } else {
        title = words.slice(0, 4).join(' ') + (words.length > 4 ? '...' : '');
      }
      
      // Generate image prompt from content
      const keywords = content.toLowerCase().split(' ').filter((word: string) => 
        word.length > 3 && 
        !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'man', 'oil', 'sit', 'try', 'use', 'war', 'why', 'yes', 'yet', 'you'].includes(word)
      );
      
      const mainKeyword = keywords[0] || 'nature';
      imagePrompt = `A beautiful artistic image related to ${mainKeyword}, dreamy scene with soft lighting and gentle artistic touches`;
      
      // Generate stylized content (simple author style simulation)
      const styles = [
        'Ernest Hemingway', 'Virginia Woolf', 'Jane Austen', 'Gabriel García Márquez', 
        'Sylvia Plath', 'Maya Angelou', 'Mark Twain', 'Toni Morrison'
      ];
      const randomStyle = styles[Math.floor(Math.random() * styles.length)];
      stylizedContent = `"${content}" - A moment captured in the style of ${randomStyle}`;
      authorStyle = `Inspired by ${randomStyle}`;
      
      // Generate image using Hugging Face
      const generatedImageUrl = await generateImage(imagePrompt);
      imageUrl = await uploadImage(generatedImageUrl);
    }

    console.log('POST /api/entries - Generated data:', { title, imageUrl: imageUrl?.substring(0, 50) + '...' });

    const entriesCollection = (db as any).collection('diary_entries');

    const entry: DiaryEntry = {
      userId: useTestData ? userId as any : new ObjectId(userId),
      content,
      title,
      imageUrl,
      entryDate: new Date(entryDate || new Date()),
      createdAt: new Date(),
      imagePrompt,
      stylizedContent,
      authorStyle,
    };

    console.log('POST /api/entries - Inserting entry');
    const result = await entriesCollection.insertOne(entry);
    console.log('POST /api/entries - Entry inserted successfully:', result.insertedId);
    
    const formattedEntry = formatEntry({ ...entry, _id: result.insertedId });
    console.log('POST /api/entries - Returning formatted entry');
    return NextResponse.json(formattedEntry);
  } catch (error) {
    console.error('Error creating diary entry:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json(
      { error: 'Failed to create diary entry', details: error instanceof Error ? error.message : 'Unknown error' },
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
    const entriesCollection = (db as any).collection('diary_entries');

    // Get all entries for the user, sorted by entryDate descending
    const entries = await entriesCollection
      .find({ userId: useTestData ? userId : new ObjectId(userId) })
      .sort({ entryDate: -1, createdAt: -1 })
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
    const entriesCollection = (db as any).collection('diary_entries');

    // First, get all entries to delete their images
    const entries = await entriesCollection
      .find({ userId: useTestData ? userId : new ObjectId(userId) })
      .toArray();

    // Delete all images from Cloudinary
    await Promise.all(
      entries.map((entry: any) => deleteImage(entry.imageUrl))
    );

    // Then delete all entries from the database
    const result = await entriesCollection.deleteMany({
      userId: useTestData ? userId : new ObjectId(userId),
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
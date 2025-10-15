import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { getUserIdFromToken } from '@/lib/auth';

// Determine whether to use test data or real services
const useTestData = process.env.USE_TEST_DATA === 'true';

// Image generation function (moved from generate-image route)
function generateImageFromPrompt(prompt: string): string {
  // Extract keyword from prompt for better image selection
  const keywords = prompt.toLowerCase().split(' ').filter((word: string) => 
    word.length > 3 && 
    !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'man', 'oil', 'sit', 'try', 'use', 'war', 'why', 'yes', 'yet', 'you', 'beautiful', 'artistic', 'related', 'dreamy', 'scene', 'soft', 'lighting', 'gentle', 'artistic', 'touches'].includes(word)
  );
  
  const mainKeyword = keywords[0] || 'nature';
  
  // Use Lorem Picsum with keyword-based seeding for consistent but varied images
  const seed = mainKeyword.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  const imageUrl = `https://picsum.photos/seed/${mainKeyword}-${seed}/800/600`;
  
  console.log('🖼️ Generated fallback image for prompt:', prompt, 'Keyword:', mainKeyword, 'URL:', imageUrl);
  
  return imageUrl;
}

interface NewEntryRequest {
  content: string;
  entryDate: string;
  selectedCollection?: {
    id: string;
    name: string;
    icon: string;
    description: string;
  };
  location?: string;
  photoMode: 'manual' | 'ai';
  generatedImage?: string;
  uploadedImage?: string;
  prompt?: string; // For image generation
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/new-entry - Starting request');
    
    // Validate authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      console.log('POST /api/new-entry - No token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body: NewEntryRequest = await request.json();
    const { content, entryDate, selectedCollection, location, photoMode, generatedImage, uploadedImage, prompt } = body;
    
    console.log('POST /api/new-entry - Request body:', { 
      content: content?.substring(0, 50) + '...', 
      entryDate,
      selectedCollection: selectedCollection?.name,
      location,
      photoMode
    });

    // Handle image generation request (when prompt is provided)
    if (prompt && !content) {
      const imageUrl = generateImageFromPrompt(prompt);
      return NextResponse.json({ imageUrl });
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Get user ID from token
    const userId = await getUserIdFromToken(token);
    console.log('POST /api/new-entry - UserId:', userId);
    
    // Connect to database
    const db = await getDb();
    
    // Generate title from content
    const words = content.split(' ').filter((word: string) => word.length > 0);
    let title: string;
    if (words.length <= 3) {
      title = content;
    } else {
      title = words.slice(0, 4).join(' ') + (words.length > 4 ? '...' : '');
    }

    // Determine image URL based on photo mode
    let imageUrl = '';
    let imagePrompt = '';
    
    if (photoMode === 'ai') {
      if (generatedImage) {
        // Use pre-generated image from frontend
        imageUrl = generatedImage;
      } else {
        // Generate image from content
        const keywords = content.toLowerCase().split(' ').filter((word: string) => 
          word.length > 3 && 
          !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'man', 'oil', 'sit', 'try', 'use', 'war', 'why', 'yes', 'yet', 'you'].includes(word)
        );
        const mainKeyword = keywords[0] || 'nature';
        imagePrompt = `A beautiful artistic image related to ${mainKeyword}, dreamy scene with soft lighting and gentle artistic touches`;
        imageUrl = generateImageFromPrompt(imagePrompt);
      }
    }

    // Generate stylized content
    const styles = [
      'Ernest Hemingway', 'Virginia Woolf', 'Jane Austen', 'Gabriel García Márquez', 
      'Sylvia Plath', 'Maya Angelou', 'Mark Twain', 'Toni Morrison'
    ];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const stylizedContent = `"${content}" - A moment captured in the style of ${randomStyle}`;
    const authorStyle = `Inspired by ${randomStyle}`;

    // Create entry object with logData fields
    const entry = {
      userId: useTestData ? userId as any : new ObjectId(userId),
      content: content.trim(),
      entryDate: new Date(entryDate || new Date()),
      selectedCollection: selectedCollection || null,
      location: location || null,
      photoMode,
      generatedImage: generatedImage || null,
      uploadedImage: uploadedImage || null,
      timestamp: new Date().toISOString(),
    };

    // Insert into the new collection
    const newEntryCollection = (db as any).collection('new_entries');
    
    console.log('POST /api/new-entry - Inserting entry');
    const result = await newEntryCollection.insertOne(entry);
    console.log('POST /api/new-entry - Entry inserted successfully:', result.insertedId);
    
    // Trigger AI analysis for the new entry
    try {
      console.log('POST /api/new-entry - Triggering AI analysis');
      const analysisResponse = await fetch(`${request.url.replace('/api/new-entry', '/api/ai-analysis')}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || ''
        },
        body: JSON.stringify({ 
          content: content.trim(),
          entryId: result.insertedId.toString()
        }),
      });
      
      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json();
        console.log('POST /api/new-entry - AI analysis completed:', analysisData.id);
      } else {
        console.log('POST /api/new-entry - AI analysis failed, but entry was saved');
      }
    } catch (analysisError) {
      console.error('POST /api/new-entry - Error triggering AI analysis:', analysisError);
      // Don't fail the entry creation if analysis fails
    }
    
    // Format response with logData structure
    const formattedEntry = {
      id: result.insertedId.toString(),
      content: entry.content,
      entryDate: entry.entryDate.toISOString(),
      selectedCollection: entry.selectedCollection,
      location: entry.location,
      photoMode: entry.photoMode,
      generatedImage: entry.generatedImage,
      uploadedImage: entry.uploadedImage,
      timestamp: entry.timestamp,
    };
    
    console.log('POST /api/new-entry - Returning formatted entry');
    return NextResponse.json(formattedEntry);
    
  } catch (error) {
    console.error('Error creating new entry:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json(
      { error: 'Failed to create new entry', details: error instanceof Error ? error.message : 'Unknown error' },
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
    const newEntryCollection = (db as any).collection('new_entries');

    // Get all entries for the user, sorted by entryDate descending
    const entries = await newEntryCollection
      .find({ userId: useTestData ? userId : new ObjectId(userId) })
      .sort({ entryDate: -1, createdAt: -1 })
      .toArray();

    // Format entries for response with logData structure
    const formattedEntries = entries.map((entry: any) => ({
      id: entry._id.toString(),
      content: entry.content,
      entryDate: entry.entryDate.toISOString(),
      selectedCollection: entry.selectedCollection,
      location: entry.location,
      photoMode: entry.photoMode,
      generatedImage: entry.generatedImage,
      uploadedImage: entry.uploadedImage,
      timestamp: entry.timestamp,
    }));

    return NextResponse.json({ entries: formattedEntries });
  } catch (error) {
    console.error('Error fetching new entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch new entries' },
      { status: 500 }
    );
  }
}

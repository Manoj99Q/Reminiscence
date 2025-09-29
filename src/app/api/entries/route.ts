import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { uploadImage, deleteImage } from '@/lib/cloudinary';
import { generateImage } from '@/lib/openai';
import { DiaryEntry, DiaryEntryResponse } from '@/types/diary';
import { getUserIdFromToken } from '@/lib/auth';
import OpenAI from 'openai';
import { UserProfile } from '@/types/user';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Determine whether to use test data or OpenAI
// Fallback to true if not set (for development)
const useTestData = process.env.USE_TEST_DATA === 'true' || !process.env.USE_TEST_DATA;
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

// Helper to generate title and image prompt from content
async function generateTitleAndPrompt(content: string, userProfile?: UserProfile): Promise<{ title: string; imagePrompt: string }> {
  if (useTestData) {
    return {
      title: content.split(' ').slice(0, 3).join(' ') + '...',
      imagePrompt: 'Test image prompt'
    };
  }

  try {
    // Create a profile context string if profile exists
    let profileContext = '';
    if (userProfile) {
      const contextParts = [];
      if (userProfile.gender) contextParts.push(`gender: ${userProfile.gender}`);
      if (userProfile.ageRange) contextParts.push(`age range: ${userProfile.ageRange}`);
      if (userProfile.ethnicity) contextParts.push(`ethnicity: ${userProfile.ethnicity}`);
      if (contextParts.length > 0) {
        profileContext = `\nContext about the diary writer: ${contextParts.join(', ')}.`;
      }
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: `Given this diary entry and information about its writer, please provide:
1. A short, meaningful title (max 5 words)
2. A stylized image generation prompt that artistically enhances reality

The diary entry is: "${content}"${profileContext}

Please respond in this format:
TITLE: <the title>
IMAGE_PROMPT: <the image prompt>

Make the title personal and meaningful. For the image prompt:
- Create a recognizable scene but with artistic enhancement
- Use a mix of realism and artistic style, like a beautiful illustration
- Add subtle artistic elements: soft glows, gentle color gradients, elegant compositions
- Consider these artistic styles: Studio Ghibli, stylized digital art, watercolor-inspired
- Enhance the mood with: lighting effects, color harmonies, atmospheric elements
- Keep main subjects recognizable while adding artistic flair
- Subtly incorporate the writer's characteristics
- Focus on creating a dreamy, enhanced version of reality
- Add artistic touches like: soft edges, gentle light rays, delicate details, subtle textures`
        }
      ],
      temperature: 0.8,
      max_tokens: 150,
    });

    const result = response.choices[0].message.content?.trim() || '';
    const titleMatch = result.match(/TITLE: (.*)/);
    const promptMatch = result.match(/IMAGE_PROMPT: (.*)/);

    return {
      title: titleMatch?.[1]?.trim() || "Untitled Moment",
      imagePrompt: promptMatch?.[1]?.trim() || "A dreamy scene with soft lighting and gentle artistic touches, maintaining a recognizable but enhanced reality"
    };
  } catch (error) {
    console.error('OpenAI generation error:', error);
    return {
      title: "Untitled Moment",
      imagePrompt: "A dreamy scene with soft lighting and gentle artistic touches, maintaining a recognizable but enhanced reality"
    };
  }
}

// Helper to generate stylized content
async function generateStylizedContent(content: string): Promise<{ stylizedContent: string; authorStyle: string }> {
  if (useTestData) {
    return {
      stylizedContent: content,
      authorStyle: 'Test Author Style'
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: `Please rewrite this diary entry in the style of a prominent author of your choice. Choose an author whose style would best match the mood and content of the entry.

The diary entry is: "${content}"

Please respond in this format:
AUTHOR: <author name and brief style description>
STYLIZED_CONTENT: <the rewritten content>

Guidelines:
- Choose from renowned authors known for their distinctive writing styles
- Maintain the core message and emotions of the original entry
- Adapt the vocabulary, sentence structure, and tone to match the chosen author
- Keep the length similar to the original
- Make sure the style transformation is noticeable but not overly exaggerated
- Consider authors like Virginia Woolf, Ernest Hemingway, Jane Austen, Gabriel García Márquez, Sylvia Plath, or other distinctive voices
- Match the emotional tone of the original entry with an appropriate author's style`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const result = response.choices[0].message.content?.trim() || '';
    const authorMatch = result.match(/AUTHOR: (.*)/);
    const contentMatch = result.match(/STYLIZED_CONTENT: ([\s\S]*?)(?=\n\n|$)/);

    return {
      authorStyle: authorMatch?.[1]?.trim() || "Unknown Author Style",
      stylizedContent: contentMatch?.[1]?.trim() || content
    };
  } catch (error) {
    console.error('OpenAI stylization error:', error);
    return {
      authorStyle: "Original Style",
      stylizedContent: content
    };
  }
}

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
    const profilesCollection = db.collection<UserProfile>('user_profiles');
    // Use string userId for mock database, ObjectId for real MongoDB
    const userProfile = await profilesCollection.findOne({ userId: useTestData ? userId : new ObjectId(userId) });
    console.log('POST /api/entries - User profile:', userProfile);
    
    let title, imagePrompt, imageUrl, stylizedContent, authorStyle;
    console.log('POST /api/entries - useTestData:', useTestData);
    if (useTestData) {
      console.log('POST /api/entries - Using test data');
      title = content.split(' ').slice(0, 3).join(' ') + '...';
      imagePrompt = 'Test image prompt';
      imageUrl = `https://picsum.photos/1024/1024?random=${Date.now()}`;
      stylizedContent = content;
      authorStyle = 'Test Author Style';
    } else {
      console.log('POST /api/entries - Using OpenAI/Cloudinary');
      const generated = await generateTitleAndPrompt(content, userProfile || undefined);
      const stylized = await generateStylizedContent(content);
      title = generated.title;
      imagePrompt = generated.imagePrompt;
      const generatedImageUrl = await generateImage(imagePrompt);
      imageUrl = await uploadImage(generatedImageUrl);
      stylizedContent = stylized.stylizedContent;
      authorStyle = stylized.authorStyle;
    }

    console.log('POST /api/entries - Generated data:', { title, imageUrl: imageUrl?.substring(0, 50) + '...' });

    const entriesCollection = db.collection<DiaryEntry>('diary_entries');

    const entry: DiaryEntry = {
      userId: useTestData ? userId : new ObjectId(userId),
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
    const entriesCollection = db.collection<DiaryEntry>('diary_entries');

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
    const entriesCollection = db.collection<DiaryEntry>('diary_entries');

    // First, get all entries to delete their images
    const entries = await entriesCollection
      .find({ userId: useTestData ? userId : new ObjectId(userId) })
      .toArray();

    // Delete all images from Cloudinary
    await Promise.all(
      entries.map(entry => deleteImage(entry.imageUrl))
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
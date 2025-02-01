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
const useTestData = process.env.USE_TEST_DATA === 'true';

// Helper to format entry for response
function formatEntry(entry: DiaryEntry): DiaryEntryResponse {
  return {
    id: entry._id!.toString(),
    content: entry.content,
    title: entry.title,
    imageUrl: entry.imageUrl,
    entryDate: entry.entryDate.toISOString(),
    createdAt: entry.createdAt.toISOString(),
    imagePrompt: entry.imagePrompt,
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
      model: "gpt-3.5-turbo",
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

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, entryDate } = await request.json();
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const userId = await getUserIdFromToken(token);
    const db = await getDb();
    
    // Get user profile
    const profilesCollection = db.collection<UserProfile>('user_profiles');
    const userProfile = await profilesCollection.findOne({ userId: new ObjectId(userId) });
    
    let title, imagePrompt, imageUrl;
    if (useTestData) {
      title = content.split(' ').slice(0, 3).join(' ') + '...';
      imagePrompt = 'Test image prompt';
      imageUrl = `https://picsum.photos/1024/1024?random=${Date.now()}`;
    } else {
      const generated = await generateTitleAndPrompt(content, userProfile || undefined);
      title = generated.title;
      imagePrompt = generated.imagePrompt;
      imageUrl = await generateImage(imagePrompt);
    }

    const entriesCollection = db.collection<DiaryEntry>('diary_entries');

    const entry: DiaryEntry = {
      userId: new ObjectId(userId),
      content,
      title,
      imageUrl,
      entryDate: new Date(entryDate || new Date()),
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

    // Get all entries for the user, sorted by entryDate descending
    const entries = await entriesCollection
      .find({ userId: new ObjectId(userId) })
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
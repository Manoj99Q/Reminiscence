import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { getUserIdFromToken } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

// Determine whether to use test data or real services
const useTestData = process.env.USE_TEST_DATA === 'true';

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/manage-entries - Starting request');
    
    // Validate authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      console.log('GET /api/manage-entries - No token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from token
    const userId = await getUserIdFromToken(token);
    console.log('GET /api/manage-entries - UserId:', userId);
    
    // Connect to database
    const db = await getDb();
    
    // Fetch entries from both collections
    const newEntriesCollection = (db as any).collection('new_entries');
    const aiAnalysesCollection = (db as any).collection('ai_analyses');
    
    console.log('GET /api/manage-entries - Fetching entries from new_entries');
    const newEntries = await newEntriesCollection
      .find({ userId: useTestData ? userId : new ObjectId(userId) })
      .sort({ entryDate: -1, timestamp: -1 })
      .toArray();

    console.log('GET /api/manage-entries - Fetching analyses from ai_analyses');
    const analyses = await aiAnalysesCollection
      .find({ userId: useTestData ? userId : new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();

    // Combine entries with their analyses
    const combinedEntries = newEntries.map((entry: any) => {
      // Find corresponding AI analysis
      const analysis = analyses.find((a: any) => 
        a.entryId && a.entryId.toString() === entry._id.toString()
      );

      // Generate title from content if not present
      let title = entry.title || '';
      if (!title && entry.content) {
        const words = entry.content.split(' ').filter((word: string) => word.length > 0);
        if (words.length <= 3) {
          title = entry.content;
        } else {
          title = words.slice(0, 4).join(' ') + (words.length > 4 ? '...' : '');
        }
      }

      // Format entry for response (matching DiaryEntryResponse structure)
      return {
        id: entry._id.toString(),
        content: entry.content,
        title: title,
        imageUrl: entry.generatedImage || entry.uploadedImage || '',
        entryDate: entry.entryDate.toISOString(),
        createdAt: entry.createdAt?.toISOString() || entry.timestamp,
        imagePrompt: '', // Not available in new_entries
        stylizedContent: '', // Not available in new_entries
        authorStyle: '', // Not available in new_entries
        // Additional fields from new_entries
        selectedCollection: entry.selectedCollection,
        location: entry.location,
        photoMode: entry.photoMode,
        generatedImage: entry.generatedImage,
        uploadedImage: entry.uploadedImage,
        // AI Analysis data
        aiAnalysis: analysis ? {
          id: analysis._id.toString(),
          reflection: analysis.analysis.reflection,
          keyInsights: analysis.analysis.keyInsights,
          feelings: analysis.analysis.feelings,
          people: analysis.analysis.people,
          mood: analysis.analysis.mood,
          createdAt: analysis.createdAt.toISOString()
        } : null
      };
    });

    console.log('GET /api/manage-entries - Returning', combinedEntries.length, 'combined entries');
    return NextResponse.json({ entries: combinedEntries });
    
  } catch (error) {
    console.error('Error fetching manage entries:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json(
      { error: 'Failed to fetch entries', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}









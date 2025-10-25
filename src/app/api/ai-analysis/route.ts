import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserIdFromToken } from '@/lib/auth';
import { analyzeEntryWithGemini, generateEntrySummary } from '@/lib/gemini';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Determine whether to use test data or real services
const useTestData = process.env.USE_TEST_DATA === 'true';

interface AnalysisRequest {
  content: string;
  entryId?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/ai-analysis - Starting request');
    
    // Validate authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      console.log('POST /api/ai-analysis - No token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body: AnalysisRequest = await request.json();
    const { content, entryId } = body;
    
    console.log('POST /api/ai-analysis - Request body:', { 
      content: content?.substring(0, 50) + '...', 
      entryId
    });

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required for analysis' },
        { status: 400 }
      );
    }

    // Get user ID from token
    const userId = await getUserIdFromToken(token);
    console.log('POST /api/ai-analysis - UserId:', userId);
    
    // Connect to database
    const db = await getDb();
    
    // Generate AI analysis
    console.log('POST /api/ai-analysis - Generating AI analysis');
    const analysis = await analyzeEntryWithGemini(content);

    // Create analysis record
    const analysisRecord = {
      userId: useTestData ? userId as any : new ObjectId(userId),
      entryId: entryId ? new ObjectId(entryId) : null,
      content: content.trim(),
      analysis,
      createdAt: new Date(),
      timestamp: new Date().toISOString(),
    };

    // Save analysis to database
    const analysisCollection = (db as any).collection('ai_analyses');
    
    console.log('POST /api/ai-analysis - Saving analysis');
    const result = await analysisCollection.insertOne(analysisRecord);
    console.log('POST /api/ai-analysis - Analysis saved successfully:', result.insertedId);
    
    // Format response
    const formattedAnalysis = {
      id: result.insertedId.toString(),
      entryId: entryId || null,
      content: analysisRecord.content,
      analysis: analysisRecord.analysis,
      createdAt: analysisRecord.createdAt.toISOString(),
      timestamp: analysisRecord.timestamp,
    };
    
    console.log('POST /api/ai-analysis - Returning analysis');
    return NextResponse.json(formattedAnalysis);
    
  } catch (error) {
    console.error('Error creating AI analysis:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json(
      { error: 'Failed to create AI analysis', details: error instanceof Error ? error.message : 'Unknown error' },
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
    const analysisCollection = (db as any).collection('ai_analyses');

    // Get all analyses for the user, sorted by creation date descending
    const analyses = await analysisCollection
      .find({ userId: useTestData ? userId : new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();

    // Format analyses for response
    const formattedAnalyses = analyses.map((analysis: any) => ({
      id: analysis._id.toString(),
      entryId: analysis.entryId?.toString() || null,
      content: analysis.content,
      analysis: analysis.analysis,
      createdAt: analysis.createdAt.toISOString(),
      timestamp: analysis.timestamp,
    }));

    return NextResponse.json({ analyses: formattedAnalyses });
  } catch (error) {
    console.error('Error fetching AI analyses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI analyses' },
      { status: 500 }
    );
  }
}

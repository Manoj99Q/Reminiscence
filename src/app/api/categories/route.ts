import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { DiaryCategory } from '@/types/diary';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, icon, color, userId } = body;

    // Validate required fields
    if (!name || !description || !icon || !color || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const categoriesCollection = (db as any).collection('categories');

    // Create new category
    const newCategory = {
      name: name.trim(),
      description: description.trim(),
      icon,
      color,
      entryCount: 0,
      lastUpdated: 'just now',
      userId,
      createdAt: new Date(),
    };

    const result = await categoriesCollection.insertOne(newCategory);
    
    const categoryWithId: DiaryCategory = {
      id: result.insertedId,
      name: newCategory.name,
      description: newCategory.description,
      icon: newCategory.icon,
      color: newCategory.color,
      entryCount: newCategory.entryCount,
      lastUpdated: newCategory.lastUpdated,
      userId: newCategory.userId,
      createdAt: newCategory.createdAt.toISOString(),
    };

    return NextResponse.json(categoryWithId, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const categoriesCollection = (db as any).collection('categories');
    
    const categories = await categoriesCollection.find({ userId }).toArray();
    
    const formattedCategories: DiaryCategory[] = categories.map((cat: any) => ({
      id: cat._id,
      name: cat.name,
      description: cat.description,
      icon: cat.icon,
      color: cat.color,
      entryCount: cat.entryCount,
      lastUpdated: cat.lastUpdated,
      userId: cat.userId,
      createdAt: cat.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

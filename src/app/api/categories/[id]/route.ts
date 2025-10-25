import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: categoryId } = await params;
    console.log('🔍 Received category ID:', categoryId, 'Type:', typeof categoryId);

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    console.log('🗄️ Database type:', db.constructor.name);
    const categoriesCollection = (db as any).collection('categories');
    console.log('📁 Categories collection:', categoriesCollection);

    // Check if category exists - convert string ID to ObjectId for comparison
    let existingCategory = await categoriesCollection.findOne({ _id: categoryId });
    
    // If not found with string ID, try with ObjectId
    if (!existingCategory) {
      try {
        const objectId = new ObjectId(categoryId);
        existingCategory = await categoriesCollection.findOne({ _id: objectId });
      } catch (e) {
        console.log('⚠️ Failed to create ObjectId from:', categoryId);
      }
    }
    
    if (!existingCategory) {
      console.log('❌ Category not found in database:', categoryId);
      console.log('🔍 Category ID type:', typeof categoryId);
      const allCategories = await categoriesCollection.find({}).toArray();
      console.log('🔍 Available categories:', allCategories.map(cat => ({ 
        id: cat._id, 
        idType: typeof cat._id, 
        name: cat.name 
      })));
      return NextResponse.json(
        { error: 'Category not found in database' },
        { status: 404 }
      );
    }

    // Delete the category - use the same ID format that was found
    console.log('🗑️ Attempting to delete category:', categoryId);
    let result = await categoriesCollection.deleteOne({ _id: categoryId });
    
    // If no documents deleted, try with ObjectId
    if (result.deletedCount === 0) {
      try {
        const objectId = new ObjectId(categoryId);
        result = await categoriesCollection.deleteOne({ _id: objectId });
      } catch (e) {
        console.log('⚠️ Failed to create ObjectId for deletion:', categoryId);
      }
    }
    console.log('🗑️ Delete result:', result);

    if (result.deletedCount === 0) {
      console.log('❌ No documents were deleted');
      return NextResponse.json(
        { error: 'No documents were deleted' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Category deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: categoryId } = await params;

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const categoriesCollection = (db as any).collection('categories');

    const category = await categoriesCollection.findOne({ _id: categoryId });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const formattedCategory = {
      id: category._id,
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
      entryCount: category.entryCount,
      lastUpdated: category.lastUpdated,
      userId: category.userId,
      createdAt: category.createdAt.toISOString(),
    };

    return NextResponse.json(formattedCategory);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

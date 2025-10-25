'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import CreateCategoryModal from '@/components/CreateCategoryModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import { DiaryCategory } from '@/types/diary';

export default function DashboardPage() {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [categories, setCategories] = useState<DiaryCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; category: DiaryCategory | null }>({
    isOpen: false,
    category: null
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // No default categories - only user-created ones
  const defaultCategories: DiaryCategory[] = [];

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        
        // First, try to load user-created categories from database
        const response = await fetch('/api/categories?userId=current-user');
        
        if (response.ok) {
          const dbCategories = await response.json();
          console.log('📊 Loaded categories from database:', dbCategories);
          setCategories(dbCategories);
        } else {
          console.warn('⚠️ Failed to load categories from database');
          setError('Failed to load collections from database.');
          setCategories([]);
        }
      } catch (error) {
        console.error('❌ Error loading categories:', error);
        setError('Error loading collections from database.');
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleCreateCategory = async (categoryData: Omit<DiaryCategory, 'id' | 'entryCount' | 'lastUpdated' | 'createdAt'>) => {
    try {
      console.log('📝 Creating category:', categoryData);
      
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      console.log('📡 API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        throw new Error(`Failed to create category: ${response.status} ${errorText}`);
      }

      const newCategory = await response.json();
      console.log('✅ Category created successfully:', newCategory);
      setCategories(prev => [...prev, newCategory]);
      setError(null);
    } catch (error) {
      console.error('❌ Error creating category:', error);
      
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        setError('Unable to connect to server. Please make sure the development server is running.');
      } else {
        setError(`Failed to create collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      // For demo purposes, add to local state even if API fails
      const newCategory: DiaryCategory = {
        ...categoryData,
        id: `cat_${Date.now()}`,
        entryCount: 0,
        lastUpdated: 'just now',
        createdAt: new Date().toISOString(),
      };
      setCategories(prev => [...prev, newCategory]);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteConfirm.category) return;
    
    setIsDeleting(true);
    try {
      // All categories are user-created and stored in database
      console.log('🗑️ Deleting category:', deleteConfirm.category.name);
      console.log('🔍 Category ID being sent:', deleteConfirm.category.id, 'Type:', typeof deleteConfirm.category.id);
      const response = await fetch(`/api/categories/${deleteConfirm.category.id}`, {
        method: 'DELETE',
      });

      console.log('📡 Delete API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Delete API Error:', errorText);
        throw new Error(`Failed to delete category: ${response.status} ${errorText}`);
      }

      setCategories(prev => prev.filter(cat => cat.id !== deleteConfirm.category!.id));
      setDeleteConfirm({ isOpen: false, category: null });
      setError(null);
    } catch (error) {
      console.error('❌ Error deleting category:', error);
      
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        setError('Unable to connect to server. Please make sure the development server is running.');
      } else {
        setError(`Failed to delete collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      // Don't remove from state if deletion failed
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteConfirm = (category: DiaryCategory) => {
    setDeleteConfirm({ isOpen: true, category });
  };

  const refreshCategories = async () => {
    setError(null);
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch('/api/categories?userId=current-user');
        
        if (response.ok) {
          const dbCategories = await response.json();
          console.log('📊 Refreshed categories from database:', dbCategories);
          setCategories(dbCategories);
          setError(null);
        } else {
          setError('Failed to refresh collections from database.');
        }
      } catch (error) {
        console.error('❌ Error refreshing categories:', error);
        setError('Error refreshing collections.');
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; button: string; text: string }> = {
      blue: { bg: 'from-blue-100 to-blue-200', button: 'bg-blue-500 hover:bg-blue-600', text: 'text-blue-700' },
      green: { bg: 'from-green-100 to-green-200', button: 'bg-green-500 hover:bg-green-600', text: 'text-green-700' },
      purple: { bg: 'from-purple-100 to-purple-200', button: 'bg-purple-500 hover:bg-purple-600', text: 'text-purple-700' },
      orange: { bg: 'from-orange-100 to-orange-200', button: 'bg-orange-500 hover:bg-orange-600', text: 'text-orange-700' },
      pink: { bg: 'from-pink-100 to-pink-200', button: 'bg-pink-500 hover:bg-pink-600', text: 'text-pink-700' },
      indigo: { bg: 'from-indigo-100 to-indigo-200', button: 'bg-indigo-500 hover:bg-indigo-600', text: 'text-indigo-700' },
      red: { bg: 'from-red-100 to-red-200', button: 'bg-red-500 hover:bg-red-600', text: 'text-red-700' },
      teal: { bg: 'from-teal-100 to-teal-200', button: 'bg-teal-500 hover:bg-teal-600', text: 'text-teal-700' },
    };
    return colorMap[color] || colorMap.blue;
  };

  const getIconSvg = (icon: string) => {
    const iconMap: Record<string, string> = {
      book: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      heart: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
      lightbulb: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
      clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      star: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
      camera: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z',
      music: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3',
      gift: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7',
    };
    return iconMap[icon] || iconMap.book;
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-handwriting text-gray-900">Reminiscence</h1>
              <span className="text-xs px-2 py-1 bg-gray-200 rounded-full text-gray-700">beta</span>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/dashboard"
                className="text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors px-3 py-2 bg-gray-200 rounded-lg whitespace-nowrap"
              >
                Dashboard
              </Link>
              <Link
                href="/diary"
                className="text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 whitespace-nowrap"
              >
                Diary
              </Link>
              <Link
                href="/manage"
                className="text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 whitespace-nowrap"
              >
                Manage Entries
              </Link>
              <Link
                href="/NewEntry"
                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all font-medium text-xs whitespace-nowrap"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Entry
              </Link>
            </div>
            <div className="flex items-center">
              <Link
                href="/settings"
                className="text-xs font-medium px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap"
              >
                Profile
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="mb-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={refreshCategories}
                  className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                >
                  Refresh
                </button>
                <button
                  onClick={() => setError(null)}
                  className="text-yellow-500 hover:text-yellow-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Collections Grid */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-handwriting text-gray-900">My Collections</h3>
              <button
                onClick={refreshCategories}
                disabled={isLoading}
                className="text-sm text-gray-600 hover:text-gray-800 disabled:text-gray-400 flex items-center gap-1"
              >
                <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500"></div>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Collections Yet</h3>
                <p className="text-gray-500 mb-6">Create your first collection to start organizing your diary entries.</p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Your First Collection
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {/* Dynamic Collection Entries */}
                {categories.map((category) => {
                  const colorClasses = getColorClasses(category.color);
                  return (
                    <div key={category.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200 relative group">
                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteConfirm(category);
                        }}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
                        title="Delete collection"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>

                      <div className={`aspect-square bg-gradient-to-br ${colorClasses.bg} rounded-lg mb-4 flex items-center justify-center`}>
                        <div className="text-center">
                          <div className={`w-12 h-12 ${colorClasses.button.replace(' hover:bg-', '')} rounded-full mx-auto mb-2 flex items-center justify-center`}>
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getIconSvg(category.icon)} />
                            </svg>
                          </div>
                          <p className={`text-sm ${colorClasses.text} font-medium`}>{category.name}</p>
                        </div>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">{category.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                        <span>{category.entryCount} entries</span>
                        <span>Updated {category.lastUpdated}</span>
                      </div>
                      <button 
                        onClick={() => router.push(`/NewEntry?category=${category.id}`)}
                        className={`w-full ${colorClasses.button} text-white text-xs py-2 px-3 rounded-lg transition-colors font-medium`}
                      >
                        Add Entry
                      </button>
                    </div>
                  );
                })}

                {/* Add New Collection Card */}
                <div 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer"
                >
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Create New</p>
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Create New Collection</h4>
                  <p className="text-sm text-gray-600 mb-3">Start a new collection</p>
                  <div className="flex justify-center">
                    <span className="text-xs text-gray-500">Click to create</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Category Modal */}
      <CreateCategoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateCategory={handleCreateCategory}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, category: null })}
        onConfirm={handleDeleteCategory}
        category={deleteConfirm.category}
        isDeleting={isDeleting}
      />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DiaryEntryResponse } from '@/types/diary';
import DiaryEntries from '@/components/DiaryEntries';
import Link from 'next/link';

// Helper function to compare dates for sorting
function compareDates(a: DiaryEntryResponse, b: DiaryEntryResponse): number {
  const dateCompare = new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime();
  if (dateCompare === 0) {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }
  return dateCompare;
}

export default function DiaryPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<(DiaryEntryResponse & { isLoading?: boolean })[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<{ message: string; isRateLimit?: boolean } | null>(null);
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setFormError(null);
    
    // Create a temporary entry with loading state
    const tempEntry: DiaryEntryResponse & { isLoading: boolean } = {
      id: Date.now().toString(),
      content: newEntry,
      title: "Creating your memory...",
      imageUrl: "",
      entryDate: new Date(entryDate).toISOString(),
      createdAt: new Date().toISOString(),
      imagePrompt: "",
      stylizedContent: newEntry,  // Use original content as placeholder
      authorStyle: "Processing...",  // Placeholder while loading
      isLoading: true
    };

    // First add the temporary entry at the top
    setEntries(prevEntries => [tempEntry, ...prevEntries]);

    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newEntry, entryDate }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        if (response.status === 429) {
          throw new Error(data.error || 'Rate limit reached', { cause: 'rate_limit' });
        }
        throw new Error(data.error || 'Failed to create entry');
      }

      // Replace the temporary entry with the real one at the top
      setEntries(prevEntries => {
        const entriesWithoutTemp = prevEntries.filter(e => e.id !== tempEntry.id);
        return [data, ...entriesWithoutTemp];
      });

      setNewEntry('');
    } catch (err: any) {
      console.error('Error creating entry:', err);
      // Remove the temporary entry if there was an error
      setEntries(prevEntries => prevEntries.filter(e => e.id !== tempEntry.id));
      
      setFormError({
        message: err.message,
        isRateLimit: err.cause === 'rate_limit'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };



  // Load entries when component mounts
  useEffect(() => {
    const loadEntries = async () => {
      try {
        const response = await fetch('/api/entries', {
          credentials: 'include',
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to load entries');
        }

        const data = await response.json();
        setEntries(data.entries.sort(compareDates));
      } catch (error) {
        console.error('Error loading entries:', error);
      }
    };

    loadEntries();
  }, [router]);

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
                className="text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 whitespace-nowrap"
              >
                Dashboard
              </Link>
              <Link
                href="/diary"
                className="text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors px-3 py-2 bg-gray-200 rounded-lg whitespace-nowrap"
              >
                Diary
              </Link>
              <Link
                href="/settings"
                className="text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 whitespace-nowrap"
              >
                Profile Settings
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
              <button
                onClick={handleLogout}
                className="text-xs font-medium px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Left Side - Entry Form */}
          <div className="w-1/3 sticky top-24">
            <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-handwriting text-gray-900">New Entry</h2>
                  <p className="text-xs text-gray-600 mt-1">Beta: Limited to 5 entries per week</p>
                </div>
                {isSubmitting && (
                  <span className="text-xs px-3 py-1 bg-gray-200 rounded-full text-gray-700 animate-pulse">
                    Creating...
                  </span>
                )}
              </div>

              {formError && (
                <div className={`mb-6 p-4 rounded-xl ${formError.isRateLimit ? 'bg-gray-100 border-l-4 border-gray-400' : 'bg-gray-100 border-l-4 border-gray-400'}`}>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-800">
                        {formError.message}
                      </p>
                      {formError.isRateLimit && (
                        <p className="text-xs text-gray-600 mt-1">
                          The limit will reset next week.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Date Input */}
              <div className="mb-6">
                <label htmlFor="entryDate" className="block text-sm font-medium text-gray-700 mb-2">
                  When did this happen?
                </label>
                <input
                  type="date"
                  id="entryDate"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  What's on your mind?
                </label>
                <textarea
                  id="content"
                  value={newEntry}
                  onChange={(e) => setNewEntry(e.target.value)}
                  placeholder="Write your thoughts here..."
                  className="w-full h-64 p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white/50 backdrop-blur-sm text-gray-800 placeholder:text-gray-400 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Capture This Moment
              </button>
            </form>
          </div>

          {/* Right Side - Entries List */}
          <div className="w-2/3">
            <DiaryEntries entries={entries} />
          </div>
        </div>
      </div>

    </div>
  );
} 
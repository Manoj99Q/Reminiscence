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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-sm sticky top-0 z-50 border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-handwriting text-amber-800">Reminiscence</h1>
              <span className="text-xs px-2 py-1 bg-amber-100 rounded-full text-amber-700">beta</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link
                href="/settings"
                className="text-sm font-medium text-amber-700 hover:text-amber-900 transition-colors"
              >
                Profile Settings
              </Link>
              <Link
                href="/manage"
                className="text-sm font-medium text-amber-700 hover:text-amber-900 transition-colors"
              >
                Manage Entries
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-medium px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
            <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-amber-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-handwriting text-amber-800">New Memory</h2>
                  <p className="text-xs text-amber-600 mt-1">Beta: Limited to 5 entries per week</p>
                </div>
                {isSubmitting && (
                  <span className="text-xs px-3 py-1 bg-amber-100 rounded-full text-amber-700 animate-pulse">
                    Creating...
                  </span>
                )}
              </div>

              {formError && (
                <div className={`mb-6 p-4 rounded-xl ${formError.isRateLimit ? 'bg-amber-50 border-l-4 border-amber-400' : 'bg-red-50 border-l-4 border-red-400'}`}>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      {formError.isRateLimit ? (
                        <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm ${formError.isRateLimit ? 'text-amber-800' : 'text-red-800'}`}>
                        {formError.message}
                      </p>
                      {formError.isRateLimit && (
                        <p className="text-xs text-amber-600 mt-1">
                          The limit will reset next week.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Date Input */}
              <div className="mb-6">
                <label htmlFor="entryDate" className="block text-sm font-medium text-amber-700 mb-2">
                  When did this happen?
                </label>
                <input
                  type="date"
                  id="entryDate"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="w-full p-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="content" className="block text-sm font-medium text-amber-700 mb-2">
                  What's on your mind?
                </label>
                <textarea
                  id="content"
                  value={newEntry}
                  onChange={(e) => setNewEntry(e.target.value)}
                  placeholder="Write your thoughts here..."
                  className="w-full h-64 p-4 border border-amber-200 rounded-xl resize-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/50 backdrop-blur-sm text-gray-800 placeholder:text-amber-300 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:from-amber-700 hover:to-amber-800 focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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
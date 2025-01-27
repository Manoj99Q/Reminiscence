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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.trim() || isSubmitting) return;

    setIsSubmitting(true);
    
    // Create a temporary entry with loading state
    const tempEntry: DiaryEntryResponse & { isLoading: boolean } = {
      id: Date.now().toString(),
      content: newEntry,
      title: "Creating your memory...",
      imageUrl: "",
      entryDate: new Date(entryDate).toISOString(),
      createdAt: new Date().toISOString(),
      imagePrompt: "",
      isLoading: true
    };

    // Add the temporary entry in the correct position
    setEntries(prevEntries => {
      const newEntries = [...prevEntries, tempEntry].sort(compareDates);
      return newEntries;
    });

    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newEntry, entryDate }),
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to create entry');
      }
      
      const data = await response.json() as DiaryEntryResponse;

      // Replace the temporary entry with the real one, maintaining sort order
      setEntries(prevEntries => {
        const entriesWithoutTemp = prevEntries.filter(e => e.id !== tempEntry.id);
        return [...entriesWithoutTemp, data].sort(compareDates);
      });

      setNewEntry('');
    } catch (error) {
      console.error('Error creating entry:', error);
      // Remove the temporary entry if there was an error
      setEntries(prevEntries => prevEntries.filter(e => e.id !== tempEntry.id));
      alert('Failed to save your entry. Please try again.');
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
              <h1 className="text-3xl font-handwriting text-amber-800">Chrysalis</h1>
              <span className="text-xs px-2 py-1 bg-amber-100 rounded-full text-amber-700">beta</span>
            </div>
            <div className="flex items-center space-x-6">
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
                <h2 className="text-xl font-handwriting text-amber-800">New Memory</h2>
                {isSubmitting && (
                  <span className="text-xs px-3 py-1 bg-amber-100 rounded-full text-amber-700 animate-pulse">
                    Creating...
                  </span>
                )}
              </div>
              
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
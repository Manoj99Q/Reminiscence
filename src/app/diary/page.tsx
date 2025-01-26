'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DiaryEntryResponse } from '@/types/diary';

export default function DiaryPage() {
  const [entries, setEntries] = useState<DiaryEntryResponse[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.trim()) return;

    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newEntry }),
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to save entry');
      }

      const entry = await response.json();
      setEntries(prevEntries => [entry, ...prevEntries]);
      setNewEntry('');
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Failed to save your entry. Please try again.');
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
        setIsLoading(true);
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
        setEntries(data.entries);
      } catch (error) {
        console.error('Error loading entries:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEntries();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Visual Diary</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-red-600 hover:text-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left Side - Entry Form */}
          <div className="w-1/3 sticky top-6">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Add New Entry</h2>
              <textarea
                value={newEntry}
                onChange={(e) => setNewEntry(e.target.value)}
                placeholder="Write your thoughts for today..."
                className="w-full h-64 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder:text-gray-400"
              />
              <button
                type="submit"
                className="mt-4 w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Moment
              </button>
            </form>
          </div>

          {/* Right Side - Entries List */}
          <div className="w-2/3">
            <div className="space-y-6">
              {entries.map((entry) => (
                <div key={entry.id} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="mb-4">
                    <p className="text-gray-600 text-sm">
                      {new Date(entry.date).toLocaleDateString()}
                    </p>
                    <p className="mt-2 font-medium text-black text-base">{entry.content}</p>
                  </div>
                  <div className="mt-4 aspect-square w-full relative">
                    <img
                      src={entry.imageUrl}
                      alt="Generated from entry"
                      className="rounded-lg w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
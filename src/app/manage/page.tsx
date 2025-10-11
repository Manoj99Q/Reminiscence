'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DiaryEntryResponse } from '@/types/diary';
import Link from 'next/link';
import DetailEntry from './DetailEntry';

export default function ManagePage() {
  const [entries, setEntries] = useState<DiaryEntryResponse[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<DiaryEntryResponse[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntryResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  // Load entries
  useEffect(() => {
    loadEntries();
  }, []);

  // Filter entries based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEntries(entries);
    } else {
      const filtered = entries.filter(entry => 
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEntries(filtered);
    }
  }, [entries, searchQuery]);

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
      // Set first entry as selected if available
      if (data.entries.length > 0 && !selectedEntry) {
        setSelectedEntry(data.entries[0]);
      }
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      const response = await fetch(`/api/entries/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete entry');
      }

      const updatedEntries = entries.filter(entry => entry.id !== id);
      setEntries(updatedEntries);
      
      // Update selected entry if it was deleted
      if (selectedEntry && selectedEntry.id === id) {
        setSelectedEntry(updatedEntries.length > 0 ? updatedEntries[0] : null);
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry. Please try again.');
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('Are you sure you want to delete ALL entries? This cannot be undone!')) return;
    if (!confirm('Really really sure? This will permanently delete all your entries!')) return;

    try {
      setIsDeleting(true);
      const response = await fetch('/api/entries', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete all entries');
      }

      setEntries([]);
      setSelectedEntry(null);
    } catch (error) {
      console.error('Error deleting all entries:', error);
      alert('Failed to delete all entries. Please try again.');
    } finally {
      setIsDeleting(false);
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
                className="text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 whitespace-nowrap"
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
                className="text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors px-3 py-2 bg-gray-200 rounded-lg whitespace-nowrap"
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
      <div className="flex h-[calc(100vh-80px)] justify-center px-8">
        {/* Single Container with both sections */}
        <div className="w-full max-w-6xl bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="flex h-full">
            {/* Left Sidebar - Entries List */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col ml-4">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200 pl-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white text-sm placeholder-gray-400"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <span className="text-gray-400 text-xs bg-gray-100 px-2 py-1 rounded">/</span>
              </div>
            </div>
          </div>

          {/* Entries List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 pl-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">This week</h3>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                </div>
              ) : filteredEntries.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500">
                  {searchQuery ? 'No entries found matching your search.' : 'No entries found. Start by creating your first diary entry!'}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredEntries.map((entry) => (
                    <div
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedEntry?.id === entry.id 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-xs text-gray-500 font-medium">
                          {new Date(entry.entryDate).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                        </div>
                        <div className="text-2xl">😊</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{entry.title}</p>
                          <p className="text-xs text-gray-500 truncate">{entry.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-gray-200 pl-6">
            <button
              onClick={handleDeleteAll}
              disabled={isDeleting || entries.length === 0}
              className="w-full text-sm font-medium px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-red-200 hover:border-red-300"
            >
              {isDeleting ? 'Deleting...' : 'Delete All Entries'}
            </button>
          </div>
        </div>

            {/* Right Side - Entry Detail */}
            <div className="flex-1 bg-gray-50">
              <DetailEntry selectedEntry={selectedEntry} onDelete={handleDelete} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
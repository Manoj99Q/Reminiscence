'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();

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
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="mb-8">
          {/* Collections Grid */}
          <div className="mb-8">
            <h3 className="text-2xl font-handwriting text-gray-900 mb-6">My Collections</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {/* Dummy Collection Entries */}
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200">
                <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <p className="text-sm text-blue-700 font-medium">Daily Thoughts</p>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Daily Thoughts</h4>
                <p className="text-sm text-gray-600 mb-3">My daily reflections and experiences</p>
                <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                  <span>12 entries</span>
                  <span>Updated 2 days ago</span>
                </div>
                <button className="w-full bg-blue-500 text-white text-xs py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors font-medium">
                  Add Entry
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200">
                <div className="aspect-square bg-gradient-to-br from-green-100 to-green-200 rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-green-700 font-medium">Travel Diary</p>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Travel Diary</h4>
                <p className="text-sm text-gray-600 mb-3">Adventures and memories from my travels</p>
                <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                  <span>8 entries</span>
                  <span>Updated 1 week ago</span>
                </div>
                <button className="w-full bg-green-500 text-white text-xs py-2 px-3 rounded-lg hover:bg-green-600 transition-colors font-medium">
                  Add Entry
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200">
                <div className="aspect-square bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <p className="text-sm text-purple-700 font-medium">Dream Log</p>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Dream Log</h4>
                <p className="text-sm text-gray-600 mb-3">Recording my dreams and aspirations</p>
                <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                  <span>15 entries</span>
                  <span>Updated yesterday</span>
                </div>
                <button className="w-full bg-purple-500 text-white text-xs py-2 px-3 rounded-lg hover:bg-purple-600 transition-colors font-medium">
                  Add Entry
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200">
                <div className="aspect-square bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-orange-700 font-medium">Gratitude Log</p>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Gratitude Log</h4>
                <p className="text-sm text-gray-600 mb-3">Things I'm grateful for each day</p>
                <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                  <span>25 entries</span>
                  <span>Updated today</span>
                </div>
                <button className="w-full bg-orange-500 text-white text-xs py-2 px-3 rounded-lg hover:bg-orange-600 transition-colors font-medium">
                  Add Entry
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200">
                <div className="aspect-square bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-pink-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-pink-700 font-medium">Family Memories</p>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Family Memories</h4>
                <p className="text-sm text-gray-600 mb-3">Special moments with loved ones</p>
                <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                  <span>18 entries</span>
                  <span>Updated 3 days ago</span>
                </div>
                <button className="w-full bg-pink-500 text-white text-xs py-2 px-3 rounded-lg hover:bg-pink-600 transition-colors font-medium">
                  Add Entry
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200">
                <div className="aspect-square bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-indigo-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <p className="text-sm text-indigo-700 font-medium">Creative Ideas</p>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Creative Ideas</h4>
                <p className="text-sm text-gray-600 mb-3">Inspiration and creative thoughts</p>
                <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                  <span>6 entries</span>
                  <span>Updated 5 days ago</span>
                </div>
                <button className="w-full bg-indigo-500 text-white text-xs py-2 px-3 rounded-lg hover:bg-indigo-600 transition-colors font-medium">
                  Add Entry
                </button>
              </div>

              {/* Add New Collection Card */}
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer">
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
          </div>
        </div>
      </div>
    </div>
  );
}

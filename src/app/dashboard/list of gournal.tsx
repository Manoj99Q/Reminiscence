'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ListOfGournalPage() {
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

  // Dummy journal data
  const journals = [
    {
      id: 1,
      title: 'Daily Thoughts',
      description: 'My daily reflections and experiences',
      entries: 12,
      lastUpdated: '2 days ago',
      color: 'blue',
      icon: 'book'
    },
    {
      id: 2,
      title: 'Travel Diary',
      description: 'Adventures and memories from my travels',
      entries: 8,
      lastUpdated: '1 week ago',
      color: 'green',
      icon: 'heart'
    },
    {
      id: 3,
      title: 'Dream Journal',
      description: 'Recording my dreams and aspirations',
      entries: 15,
      lastUpdated: 'yesterday',
      color: 'purple',
      icon: 'lightbulb'
    },
    {
      id: 4,
      title: 'Gratitude Log',
      description: 'Things I\'m grateful for each day',
      entries: 25,
      lastUpdated: 'today',
      color: 'orange',
      icon: 'clock'
    },
    {
      id: 5,
      title: 'Family Memories',
      description: 'Special moments with loved ones',
      entries: 18,
      lastUpdated: '3 days ago',
      color: 'pink',
      icon: 'heart'
    },
    {
      id: 6,
      title: 'Creative Ideas',
      description: 'Inspiration and creative thoughts',
      entries: 6,
      lastUpdated: '5 days ago',
      color: 'indigo',
      icon: 'zap'
    },
    {
      id: 7,
      title: 'Work Notes',
      description: 'Professional thoughts and learnings',
      entries: 22,
      lastUpdated: '1 day ago',
      color: 'gray',
      icon: 'briefcase'
    },
    {
      id: 8,
      title: 'Health Journal',
      description: 'Wellness and fitness tracking',
      entries: 14,
      lastUpdated: '4 days ago',
      color: 'emerald',
      icon: 'heart'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'from-blue-100 to-blue-200 bg-blue-500 text-blue-700',
      green: 'from-green-100 to-green-200 bg-green-500 text-green-700',
      purple: 'from-purple-100 to-purple-200 bg-purple-500 text-purple-700',
      orange: 'from-orange-100 to-orange-200 bg-orange-500 text-orange-700',
      pink: 'from-pink-100 to-pink-200 bg-pink-500 text-pink-700',
      indigo: 'from-indigo-100 to-indigo-200 bg-indigo-500 text-indigo-700',
      gray: 'from-gray-100 to-gray-200 bg-gray-500 text-gray-700',
      emerald: 'from-emerald-100 to-emerald-200 bg-emerald-500 text-emerald-700'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getIcon = (iconType: string) => {
    const icons = {
      book: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      ),
      heart: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      ),
      lightbulb: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      ),
      clock: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      ),
      zap: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      ),
      briefcase: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
      )
    };
    return icons[iconType as keyof typeof icons] || icons.book;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <h1 className="text-3xl font-handwriting text-gray-900">List of Gournal</h1>
              </Link>
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
          <h2 className="text-4xl font-handwriting text-gray-900 mb-4">My Journal Collection</h2>
          <p className="text-xl text-gray-600 mb-8">Browse and manage all your journals</p>
          
          {/* Journals Grid */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-handwriting text-gray-900">All Journals</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                  Sort by Date
                </button>
                <button className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                  Sort by Name
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {journals.map((journal) => {
                const [gradient, bgColor, textColor] = getColorClasses(journal.color).split(' ');
                return (
                  <div key={journal.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200 cursor-pointer group">
                    <div className={`aspect-square bg-gradient-to-br ${gradient} rounded-lg mb-4 flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}>
                      <div className="text-center">
                        <div className={`w-12 h-12 ${bgColor} rounded-full mx-auto mb-2 flex items-center justify-center`}>
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {getIcon(journal.icon)}
                          </svg>
                        </div>
                        <p className={`text-sm ${textColor} font-medium`}>{journal.title}</p>
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">{journal.title}</h4>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{journal.description}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                      <span>{journal.entries} entries</span>
                      <span>{journal.lastUpdated}</span>
                    </div>
                    <button className={`w-full bg-${journal.color}-500 text-white text-xs py-2 px-3 rounded-lg hover:bg-${journal.color}-600 transition-colors font-medium`}>
                      Add Entry
                    </button>
                  </div>
                );
              })}

              {/* Add New Journal Card */}
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer">
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center hover:scale-105 transition-transform duration-200">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Create New</p>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Create New Journal</h4>
                <p className="text-sm text-gray-600 mb-3">Start a new journal collection</p>
                <div className="flex justify-center">
                  <span className="text-xs text-gray-500">Click to create</span>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-xl font-handwriting text-gray-900 mb-4">Journal Statistics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{journals.length}</div>
                <div className="text-sm text-gray-600">Total Journals</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {journals.reduce((sum, journal) => sum + journal.entries, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Entries</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {Math.round(journals.reduce((sum, journal) => sum + journal.entries, 0) / journals.length)}
                </div>
                <div className="text-sm text-gray-600">Avg Entries/Journal</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

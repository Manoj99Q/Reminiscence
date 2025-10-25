'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile, GenderOption, AgeRangeOption } from '@/types/user';

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>({
    userId: '' as any, // Will be set by the server
    gender: '',
    ageRange: '',
    ethnicity: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/profile', {
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to load profile');
      }

      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      router.push('/diary');
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile');
    } finally {
      setIsSaving(false);
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
              <button
                onClick={() => router.push('/dashboard')}
                className="text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 whitespace-nowrap"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push('/diary')}
                className="text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 whitespace-nowrap"
              >
                Diary
              </button>
              <button
                onClick={() => router.push('/manage')}
                className="text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 whitespace-nowrap"
              >
                Manage Entries
              </button>
              <button
                onClick={() => router.push('/NewEntry')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all font-medium text-xs whitespace-nowrap"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Entry
              </button>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => router.push('/settings')}
                className="text-xs font-medium px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap"
              >
                Profile
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-handwriting text-gray-900">Personalize Your Experience</h1>
              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                  <span>Loading profile...</span>
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mb-8">
              Help us make your generated images more personal and meaningful. This information helps create images that better represent you.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender Identity
                </label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile(prev => ({ ...prev, gender: e.target.value }))}
                  disabled={isLoading}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              {/* Age Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age Range
                </label>
                <select
                  value={profile.ageRange}
                  onChange={(e) => setProfile(prev => ({ ...prev, ageRange: e.target.value }))}
                  disabled={isLoading}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select age range</option>
                  <option value="18-24">18-24</option>
                  <option value="25-34">25-34</option>
                  <option value="35-44">35-44</option>
                  <option value="45-54">45-54</option>
                  <option value="55+">55+</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              {/* Ethnicity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ethnicity
                </label>
                <input
                  type="text"
                  value={profile.ethnicity}
                  onChange={(e) => setProfile(prev => ({ ...prev, ethnicity: e.target.value }))}
                  placeholder="How would you describe your ethnicity?"
                  disabled={isLoading}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSaving || isLoading}
                  className="w-full px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isSaving ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </form>

            {/* Logout Section */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
              <button
                onClick={async () => {
                  try {
                    await fetch('/api/auth/logout', {
                      method: 'POST',
                      credentials: 'include',
                    });
                    router.push('/login');
                  } catch (error) {
                    console.error('Logout error:', error);
                  }
                }}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
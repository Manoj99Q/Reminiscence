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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
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

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => router.push('/diary')}
            className="text-amber-700 hover:text-amber-900 flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Diary</span>
          </button>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-100 p-8">
          <h1 className="text-2xl font-handwriting text-amber-800 mb-6">Personalize Your Experience</h1>
          
          <p className="text-sm text-amber-600 mb-8">
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
              <label className="block text-sm font-medium text-amber-700 mb-2">
                Gender Identity
              </label>
              <select
                value={profile.gender}
                onChange={(e) => setProfile(prev => ({ ...prev, gender: e.target.value }))}
                className="w-full p-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/50"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {/* Age Range */}
            <div>
              <label className="block text-sm font-medium text-amber-700 mb-2">
                Age Range
              </label>
              <select
                value={profile.ageRange}
                onChange={(e) => setProfile(prev => ({ ...prev, ageRange: e.target.value }))}
                className="w-full p-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/50"
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
              <label className="block text-sm font-medium text-amber-700 mb-2">
                Ethnicity
              </label>
              <input
                type="text"
                value={profile.ethnicity}
                onChange={(e) => setProfile(prev => ({ ...prev, ethnicity: e.target.value }))}
                placeholder="How would you describe your ethnicity?"
                className="w-full p-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/50"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:from-amber-700 hover:to-amber-800 focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSaving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
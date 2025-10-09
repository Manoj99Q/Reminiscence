'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewEntry() {
  const [content, setContent] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [photoMode, setPhotoMode] = useState<'manual' | 'ai'>('manual');
  const [locationMode, setLocationMode] = useState<'auto' | 'manual'>('auto');
  const [location, setLocation] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const prompts = [
    "What's on your mind?",
    "Tell me more about what happened...",
    "How did that make you feel?",
    "What else was happening around you?",
    "What did you learn from this experience?",
    "Is there anything else you'd like to remember about this moment?"
  ];

  const categories = [
    { id: 'personal', name: 'Personal', icon: '✨', color: 'bg-orange-100 border-orange-200 hover:bg-orange-50' },
    { id: 'work', name: 'Work', icon: '💼', color: 'bg-amber-100 border-amber-200 hover:bg-amber-50' },
    { id: 'health', name: 'Health', icon: '🏃', color: 'bg-green-100 border-green-200 hover:bg-green-50' },
    { id: 'travel', name: 'Travel', icon: '✈️', color: 'bg-blue-100 border-blue-200 hover:bg-blue-50' },
    { id: 'relationships', name: 'Relationships', icon: '❤️', color: 'bg-red-100 border-red-200 hover:bg-red-50' },
    { id: 'gratitude', name: 'Gratitude', icon: '🙏', color: 'bg-purple-100 border-purple-200 hover:bg-purple-50' }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(file);
    }
  };

  const handlePromptContinue = () => {
    if (content.trim().length > 50 && currentPrompt < prompts.length - 1) {
      setCurrentPrompt(currentPrompt + 1);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocation('Location not supported');
      return;
    }

    // Set loading state
    setLocation('Detecting location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // You would typically reverse geocode this to get a readable location
        setLocation(`Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`);
      },
      (error) => {
        console.error('Geolocation error:', error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocation('Location access denied');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocation('Location unavailable');
            break;
          case error.TIMEOUT:
            setLocation('Location request timeout');
            break;
          default:
            setLocation('Location detection failed');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Auto-detect location on component mount
  React.useEffect(() => {
    if (locationMode === 'auto' && typeof window !== 'undefined') {
      getCurrentLocation();
    }
  }, [locationMode]);

  // Auto-resize textarea when content changes
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('content', content.trim());
      formData.append('entryDate', new Date(entryDate).toISOString());
      formData.append('category', selectedCategory);
      
      if (uploadedImage) {
        formData.append('image', uploadedImage);
      }

      const response = await fetch('/api/entries', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create entry');
      }

      // Reset form
      setContent('');
      setSelectedCategory('');
      setUploadedImage(null);
      setCurrentPrompt(0);
      setEntryDate(new Date().toISOString().split('T')[0]);
      
      // Show success message and redirect
      alert('Entry created successfully!');
      router.push('/manage');
      
    } catch (error) {
      console.error('Error creating entry:', error);
      alert('Failed to create entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-16">

        {/* Main Form Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          {/* Top Bar with Back Button and Date */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-gray-600 font-medium text-sm">
                {new Date(entryDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="text-xs text-gray-500 border-0 bg-transparent cursor-pointer"
              />
            </div>
            <Link
              href="/manage"
              className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Dynamic Prompt */}
            <div>
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start writing your thoughts... Let your feelings flow freely."
                  className="w-full min-h-20 p-4 border-2 border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all text-gray-800 placeholder:text-gray-400 overflow-hidden text-sm"
                  style={{ height: 'auto' }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = target.scrollHeight + 'px';
                  }}
                  required
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  {content.length} characters
                </div>
              </div>
              
              {/* Continue Button */}
              {content.trim().length > 50 && currentPrompt < prompts.length - 1 && (
                <button
                  type="button"
                  onClick={handlePromptContinue}
                  className="mt-4 px-6 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Continue →
                </button>
              )}
            </div>

            {/* Location Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Location (optional)</h3>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setLocationMode('auto')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                      locationMode === 'auto'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Auto
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationMode('manual')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                      locationMode === 'manual'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Manual
                  </button>
                </div>
              </div>
              
              {locationMode === 'auto' ? (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                    <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600">{location || 'Detecting location...'}</span>
                  {location && location.includes('Location') && !location.includes('Detecting') && (
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      className="ml-auto text-xs text-gray-500 hover:text-gray-700 underline"
                    >
                      Retry
                    </button>
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter location manually"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm"
                />
              )}
            </div>

            {/* Photo Upload Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Add a photo (optional)</h3>
                <div className="flex bg-gray-100 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setPhotoMode('manual')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      photoMode === 'manual'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Manual
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoMode('ai')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      photoMode === 'ai'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    AI Generate
                  </button>
                </div>
              </div>
              
              {photoMode === 'manual' ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {uploadedImage ? (
                    <div className="space-y-1">
                      <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center mx-auto">
                        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-green-600 font-medium text-xs truncate">{uploadedImage.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center mx-auto">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-600 font-medium text-xs">Click to upload</p>
                      <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50">
                  <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center mx-auto mb-2">
                    <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="text-gray-700 font-medium text-xs">AI will generate an image</p>
                  <p className="text-xs text-gray-500">Powered by AI</p>
                </div>
              )}
            </div>

            {/* Category Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Category</h3>
              <div className="grid grid-cols-3 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      selectedCategory === category.id
                        ? 'border-gray-500 bg-gray-50'
                        : category.color
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xl">{category.icon}</span>
                      <span className="font-medium text-gray-700 text-xs">{category.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="w-full py-4 bg-gray-800 text-white rounded-2xl hover:bg-gray-900 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg flex items-center justify-center gap-2"
            >
              <span>✨</span>
              {isSubmitting ? 'Creating Entry...' : 'Add New Entry'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

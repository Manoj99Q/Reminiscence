'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewEntry() {
  const [content, setContent] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [photoMode, setPhotoMode] = useState<'manual' | 'ai'>('manual');
  const [locationMode, setLocationMode] = useState<'auto' | 'manual'>('auto');
  const [location, setLocation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
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

  const journalCollections = [
    { 
      id: 'daily-thoughts', 
      name: 'Daily Thoughts', 
      icon: '📖', 
      color: 'bg-blue-100 border-blue-200 hover:bg-blue-50',
      description: 'My daily reflections and experiences',
      entries: 12
    },
    { 
      id: 'travel-diary', 
      name: 'Travel Diary', 
      icon: '✈️', 
      color: 'bg-green-100 border-green-200 hover:bg-green-50',
      description: 'Adventures and memories from my travels',
      entries: 8
    },
    { 
      id: 'dream-log', 
      name: 'Dream Log', 
      icon: '🌙', 
      color: 'bg-purple-100 border-purple-200 hover:bg-purple-50',
      description: 'Recording my dreams and aspirations',
      entries: 15
    },
    { 
      id: 'gratitude-log', 
      name: 'Gratitude Log', 
      icon: '🙏', 
      color: 'bg-orange-100 border-orange-200 hover:bg-orange-50',
      description: 'Things I\'m grateful for each day',
      entries: 25
    },
    { 
      id: 'family-memories', 
      name: 'Family Memories', 
      icon: '❤️', 
      color: 'bg-pink-100 border-pink-200 hover:bg-pink-50',
      description: 'Special moments with loved ones',
      entries: 18
    },
    { 
      id: 'creative-ideas', 
      name: 'Creative Ideas', 
      icon: '💡', 
      color: 'bg-indigo-100 border-indigo-200 hover:bg-indigo-50',
      description: 'Inspiration and creative thoughts',
      entries: 6
    }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(file);
    }
  };

  const generateImageFromText = async () => {
    if (!content.trim()) {
      alert('Please write some content first to generate an image');
      return;
    }

    setIsGenerating(true);
    try {
      // Extract keywords from content for image prompt
      const keywords = content.toLowerCase().split(' ').filter((word: string) => 
        word.length > 3 && 
        !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'man', 'oil', 'sit', 'try', 'use', 'war', 'why', 'yes', 'yet', 'you'].includes(word)
      );
      
      const mainKeyword = keywords[0] || 'nature';
      const imagePrompt = `A beautiful artistic image related to ${mainKeyword}, dreamy scene with soft lighting and gentle artistic touches`;

      const response = await fetch('/api/new-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      setGeneratedImage(data.imageUrl);
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const logDataWithImage = () => {
    // Find the selected collection details
    const selectedCollectionDetails = journalCollections.find(
      collection => collection.id === selectedCollection
    );
    
    const logData = {
      content,
      entryDate,
      selectedCollection: selectedCollectionDetails ? {
        id: selectedCollection,
        name: selectedCollectionDetails.name,
        icon: selectedCollectionDetails.icon,
        description: selectedCollectionDetails.description
      } : null,
      location,
      photoMode,
      generatedImage: generatedImage || null,
      uploadedImage: uploadedImage ? uploadedImage.name : null,
      timestamp: new Date().toISOString()
    };
    
    console.log('📝 Entry Data with Generated Image:', logData);
    alert('Data logged to console! Check browser developer tools.');
  };

  const handlePromptContinue = () => {
    if (content.trim().length > 50 && currentPrompt < prompts.length - 1) {
      setCurrentPrompt(currentPrompt + 1);
    }
  };

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setLocation('Location not supported by this browser');
      return;
    }

    // Check if geolocation permission is already denied
    if (navigator.permissions) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        if (permission.state === 'denied') {
          setLocation('Location access denied - Please enable in browser settings');
          return;
        }
      } catch (permissionError) {
        // Permission API not supported, continue with geolocation request
      }
    }

    // Set loading state
    setLocation('Detecting location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // You would typically reverse geocode this to get a readable location
        setLocation(`Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`);
      },
      (error) => {
        // Handle error gracefully without logging to console
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocation('Location access denied - Click retry to try again');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocation('Location unavailable - Please check your GPS');
            break;
          case error.TIMEOUT:
            setLocation('Location request timeout - Please try again');
            break;
          default:
            setLocation('Location detection failed - Please try again');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout
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
      // Find the selected collection details
      const selectedCollectionDetails = journalCollections.find(
        collection => collection.id === selectedCollection
      );

      // Prepare the data for submission with logData fields
      const entryData = {
        content: content.trim(),
        entryDate,
        selectedCollection: selectedCollectionDetails ? {
          id: selectedCollection,
          name: selectedCollectionDetails.name,
          icon: selectedCollectionDetails.icon,
          description: selectedCollectionDetails.description
        } : null,
        location: location || null,
        photoMode,
        generatedImage: generatedImage || null,
        uploadedImage: uploadedImage ? uploadedImage.name : null,
      };

      console.log('📝 Submitting entry data:', entryData);

      // Submit to the new API endpoint
      const response = await fetch('/api/new-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryData),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(data.error || 'Failed to create entry');
      }

      console.log('✅ Entry created successfully:', data);
      
      // Show success message
      alert('Entry created successfully!');
      
      // Clear the form
      setContent('');
      setSelectedCollection('');
      setLocation('');
      setUploadedImage(null);
      setGeneratedImage(null);
      setCurrentPrompt(0);
      
      // Optionally redirect to manage page
      // router.push('/manage');
      
    } catch (error: any) {
      console.error('Error creating entry:', error);
      alert(`Error creating entry: ${error.message}`);
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
                <div className="space-y-3">
                  {generatedImage ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <img
                          src={generatedImage}
                          alt="AI Generated"
                          className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => setGeneratedImage(null)}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={generateImageFromText}
                          disabled={isGenerating}
                          className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-xs font-medium"
                        >
                          {isGenerating ? 'Generating...' : 'Regenerate'}
                        </button>
                        <button
                          type="button"
                          onClick={logDataWithImage}
                          className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-xs font-medium"
                        >
                          Log Data
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center mx-auto mb-2">
                        <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <p className="text-gray-700 font-medium text-xs mb-2">AI will generate an image</p>
                      <p className="text-xs text-gray-500 mb-3">Powered by AI</p>
                      <button
                        type="button"
                        onClick={generateImageFromText}
                        disabled={isGenerating || !content.trim()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
                      >
                        {isGenerating ? 'Generating...' : 'Generate Image'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Journal Collection Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Journal Collection</h3>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {journalCollections.map((collection) => (
                  <button
                    key={collection.id}
                    type="button"
                    onClick={() => setSelectedCollection(collection.id)}
                    className={`flex-shrink-0 w-64 p-4 rounded-xl border-2 transition-all text-left ${
                      selectedCollection === collection.id
                        ? 'border-gray-500 bg-gray-50'
                        : collection.color
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{collection.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">{collection.name}</h4>
                        <p className="text-xs text-gray-600 mb-2">{collection.description}</p>
                        <span className="text-xs text-gray-500">{collection.entries} entries</span>
                      </div>
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

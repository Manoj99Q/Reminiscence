'use client';

import { useState } from 'react';
import { DiaryEntryResponse } from '@/types/diary';

interface DetailEntryProps {
  selectedEntry: DiaryEntryResponse | null;
  onDelete: (id: string) => void;
}

export default function DetailEntry({ selectedEntry, onDelete }: DetailEntryProps) {
  const [activeTab, setActiveTab] = useState<'analysis' | 'entry'>('analysis');
  if (!selectedEntry) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Select an Entry</h3>
          <p className="text-gray-500">Choose an entry from the sidebar to view its details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Tab Content with Header Inside */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          {/* Entry Header Inside Scrollable Content */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedEntry.title}</h2>
                <p className="text-sm text-gray-500">
                  {new Date(selectedEntry.entryDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Share Icon */}
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </button>
                {/* Three Dots Menu */}
                <button 
                  onClick={() => onDelete(selectedEntry.id)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('analysis')}
                className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'analysis'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Analysis
              </button>
              <button
                onClick={() => setActiveTab('entry')}
                className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ml-6 ${
                  activeTab === 'entry'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Entry
              </button>
            </div>
          </div>
          {activeTab === 'analysis' ? (
            <div className="space-y-6">
              {/* Entry Reflection */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 relative">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Entry Reflection</h3>
                  <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                    <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Your playful response radiates a carefree energy that feels refreshing and authentic. This lighthearted moment, coming just yesterday after expressing gratitude for being alive, suggests you're experiencing a natural flow between deeper reflection and simple joy. The ability to express yourself freely, even in small ways, can be its own form of emotional release.
                </p>
              </div>

              {/* Key Insight */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Key Insight</h3>
                  </div>
                  <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                    <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Playful expression creates space for both lightness and authenticity in emotional processing.
                </p>
              </div>

              {/* Feelings */}
              <div className="space-y-4">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Feelings</h3>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full">
                    <span className="text-sm">😊</span>
                    <span className="text-sm text-gray-700">Content</span>
                    <button className="ml-1 hover:bg-gray-200 rounded-full p-1 transition-colors">
                      <svg className="h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* People */}
              <div className="space-y-4">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">People</h3>
                <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
                  <span className="text-lg">+</span>
                  <span className="text-sm">Add</span>
                </button>
              </div>

              {/* Topics */}
              <div className="space-y-4">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Topics</h3>
                <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
                  <span className="text-lg">+</span>
                  <span className="text-sm">Add</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Image */}
              {selectedEntry.imageUrl && (
                <div className="mb-6">
                  <img 
                    src={selectedEntry.imageUrl} 
                    alt="Entry visualization" 
                    className="w-full h-64 object-cover rounded-lg border border-gray-200 shadow-sm"
                  />
                </div>
              )}

              {/* Content */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Your Memory</h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedEntry.content}</p>
                </div>
              </div>

              {/* Stylized Content */}
              {selectedEntry.stylizedContent && (
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Enhanced Memory</h3>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedEntry.stylizedContent}</p>
                  </div>
                </div>
              )}

              {/* Author Style */}
              {selectedEntry.authorStyle && (
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Your Writing Style</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedEntry.authorStyle}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

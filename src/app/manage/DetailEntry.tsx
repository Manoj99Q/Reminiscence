'use client';

import { useState } from 'react';
import { DiaryEntryResponse } from '@/types/diary';

// Extended interface to include AI analysis data
interface ManageEntryResponse extends DiaryEntryResponse {
  selectedCollection?: any;
  location?: string;
  photoMode?: string;
  generatedImage?: string;
  uploadedImage?: string;
  aiAnalysis?: {
    id: string;
    reflection: string;
    keyInsights: string[];
    feelings: string[];
    people: string[];
    mood: 'positive' | 'neutral' | 'negative';
    createdAt: string;
  } | null;
}

interface DetailEntryProps {
  selectedEntry: ManageEntryResponse | null;
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
            selectedEntry.aiAnalysis ? (
              <div className="space-y-6">
                {/* Entry Reflection */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 relative">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Entry Reflection</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedEntry.aiAnalysis.mood === 'positive' ? 'bg-green-100 text-green-800' :
                      selectedEntry.aiAnalysis.mood === 'negative' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedEntry.aiAnalysis.mood} mood
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedEntry.aiAnalysis.reflection}
                  </p>
                </div>

                {/* Key Insights */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 relative">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Key Insights</h3>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {selectedEntry.aiAnalysis.keyInsights.map((insight, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 leading-relaxed">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feelings */}
                <div className="space-y-4">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Feelings</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.aiAnalysis.feelings.map((feeling, index) => (
                      <div key={index} className="flex items-center gap-2 bg-pink-100 px-3 py-2 rounded-full">
                        <span className="text-sm">
                          {selectedEntry.aiAnalysis?.mood === 'positive' ? '😊' :
                           selectedEntry.aiAnalysis?.mood === 'negative' ? '😔' : '😐'}
                        </span>
                        <span className="text-sm text-pink-800">{feeling}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* People */}
                {selectedEntry.aiAnalysis.people.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">People</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedEntry.aiAnalysis.people.map((person, index) => (
                        <div key={index} className="flex items-center gap-2 bg-green-100 px-3 py-2 rounded-full">
                          <span className="text-sm">👤</span>
                          <span className="text-sm text-green-800">{person}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No AI Analysis Available</h3>
                <p className="text-gray-500">This entry doesn't have AI analysis yet. Analysis is generated automatically when you create new entries.</p>
              </div>
            )
          ) : (
            <div className="space-y-6">
              {/* Original Content */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Original Content</h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedEntry.content || <span className="text-gray-400 italic">No content available</span>}
                  </p>
                </div>
              </div>

              {/* Photo */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Photo</h3>
                {selectedEntry.imageUrl || selectedEntry.generatedImage || selectedEntry.uploadedImage ? (
                  <img 
                    src={selectedEntry.imageUrl || selectedEntry.generatedImage || selectedEntry.uploadedImage} 
                    alt="Entry visualization" 
                    className="w-full h-64 object-cover rounded-lg border border-gray-200 shadow-sm"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl text-gray-400 mb-2">📷</div>
                      <p className="text-gray-500 text-sm">No image available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Location</h3>
                <p className="text-gray-700">
                  {selectedEntry.location || <span className="text-gray-400 italic">No location specified</span>}
                </p>
              </div>

              {/* Journal Category */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Journal Category</h3>
                {selectedEntry.selectedCollection ? (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                    <span className="text-2xl">{selectedEntry.selectedCollection.icon || '📖'}</span>
                    <div>
                      <p className="font-medium text-gray-900">{selectedEntry.selectedCollection.name || 'Unnamed Collection'}</p>
                      <p className="text-sm text-gray-500">{selectedEntry.selectedCollection.description || 'No description'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 italic">No collection selected</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

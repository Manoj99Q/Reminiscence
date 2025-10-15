'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface EntryAnalysis {
  reflection: string;
  keyInsights: string[];
  feelings: string[];
  people: string[];
  mood: 'positive' | 'neutral' | 'negative';
}

interface AIAnalysis {
  id: string;
  entryId: string | null;
  content: string;
  analysis: EntryAnalysis;
  createdAt: string;
  timestamp: string;
}

export default function AIanalysis() {
  const [analyses, setAnalyses] = useState<AIAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customContent, setCustomContent] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const response = await fetch('/api/ai-analysis', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalyses(data.analyses || []);
      } else if (response.status === 401) {
        router.push('/login');
        return;
      }
    } catch (error) {
      console.error('Error fetching analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeCustomContent = async () => {
    if (!customContent.trim()) {
      alert('Please enter some content to analyze');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: customContent.trim()
        }),
        credentials: 'include'
      });

      if (response.ok) {
        const newAnalysis = await response.json();
        setAnalyses(prev => [newAnalysis, ...prev]);
        setSelectedAnalysis(newAnalysis);
        setCustomContent('');
        alert('Analysis completed successfully!');
      } else if (response.status === 401) {
        router.push('/login');
        return;
      } else {
        throw new Error('Failed to analyze content');
      }
    } catch (error) {
      console.error('Error analyzing content:', error);
      alert('Failed to analyze content. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'positive': return '😊';
      case 'negative': return '😔';
      default: return '😐';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI analyses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Analysis</h1>
            <p className="text-gray-600">Insights and reflections powered by Google Gemini AI</p>
          </div>
          <Link
            href="/NewEntry"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Entry
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Analysis List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Analyses</h2>
              
              {analyses.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🤖</div>
                  <p className="text-gray-500 mb-4">No analyses yet</p>
                  <p className="text-sm text-gray-400">Create a new entry to see AI insights</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {analyses.map((analysis) => (
                    <div
                      key={analysis.id}
                      onClick={() => setSelectedAnalysis(analysis)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedAnalysis?.id === analysis.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getMoodIcon(analysis.analysis.mood)}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMoodColor(analysis.analysis.mood)}`}>
                            {analysis.analysis.mood}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(analysis.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {analysis.content.substring(0, 100)}...
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Analysis */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analyze Custom Content</h3>
              <textarea
                value={customContent}
                onChange={(e) => setCustomContent(e.target.value)}
                placeholder="Enter any text you'd like to analyze..."
                className="w-full h-24 p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                onClick={analyzeCustomContent}
                disabled={isAnalyzing || !customContent.trim()}
                className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Content'}
              </button>
            </div>
          </div>

          {/* Analysis Details */}
          <div className="lg:col-span-2">
            {selectedAnalysis ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getMoodIcon(selectedAnalysis.analysis.mood)}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMoodColor(selectedAnalysis.analysis.mood)}`}>
                        {selectedAnalysis.analysis.mood} mood
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Analyzed on {new Date(selectedAnalysis.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Original Content */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Original Entry</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{selectedAnalysis.content}</p>
                  </div>
                </div>


                {/* Reflection */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Reflection</h3>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-gray-700">{selectedAnalysis.analysis.reflection}</p>
                  </div>
                </div>

                {/* Key Insights */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Insights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedAnalysis.analysis.keyInsights.map((insight, index) => (
                      <div key={index} className="bg-yellow-50 rounded-lg p-3">
                        <p className="text-gray-700 text-sm">💡 {insight}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feelings */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Emotions Detected</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAnalysis.analysis.feelings.map((feeling, index) => (
                      <span key={index} className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">
                        {feeling}
                      </span>
                    ))}
                  </div>
                </div>

                {/* People */}
                {selectedAnalysis.analysis.people.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">People Mentioned</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedAnalysis.analysis.people.map((person, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          👤 {person}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="text-6xl mb-4">🤖</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Select an Analysis</h3>
                  <p className="text-gray-500">Choose an analysis from the list to view detailed insights</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
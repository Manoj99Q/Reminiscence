'use client';

import { useState } from 'react';
import { DiaryCategory } from '@/types/diary';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCategory: (category: Omit<DiaryCategory, 'id' | 'entryCount' | 'lastUpdated' | 'createdAt'>) => void;
}

const colorOptions = [
  { name: 'Blue', value: 'blue', bg: 'from-blue-100 to-blue-200', button: 'bg-blue-500 hover:bg-blue-600', text: 'text-blue-700' },
  { name: 'Green', value: 'green', bg: 'from-green-100 to-green-200', button: 'bg-green-500 hover:bg-green-600', text: 'text-green-700' },
  { name: 'Purple', value: 'purple', bg: 'from-purple-100 to-purple-200', button: 'bg-purple-500 hover:bg-purple-600', text: 'text-purple-700' },
  { name: 'Orange', value: 'orange', bg: 'from-orange-100 to-orange-200', button: 'bg-orange-500 hover:bg-orange-600', text: 'text-orange-700' },
  { name: 'Pink', value: 'pink', bg: 'from-pink-100 to-pink-200', button: 'bg-pink-500 hover:bg-pink-600', text: 'text-pink-700' },
  { name: 'Indigo', value: 'indigo', bg: 'from-indigo-100 to-indigo-200', button: 'bg-indigo-500 hover:bg-indigo-600', text: 'text-indigo-700' },
  { name: 'Red', value: 'red', bg: 'from-red-100 to-red-200', button: 'bg-red-500 hover:bg-red-600', text: 'text-red-700' },
  { name: 'Teal', value: 'teal', bg: 'from-teal-100 to-teal-200', button: 'bg-teal-500 hover:bg-teal-600', text: 'text-teal-700' },
];

const iconOptions = [
  { name: 'Book', value: 'book', svg: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { name: 'Heart', value: 'heart', svg: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  { name: 'Lightbulb', value: 'lightbulb', svg: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { name: 'Clock', value: 'clock', svg: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { name: 'Star', value: 'star', svg: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
  { name: 'Camera', value: 'camera', svg: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' },
  { name: 'Music', value: 'music', svg: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' },
  { name: 'Gift', value: 'gift', svg: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7' },
];

export default function CreateCategoryModal({ isOpen, onClose, onCreateCategory }: CreateCategoryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'blue',
    icon: 'book',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateCategory({
        name: formData.name.trim(),
        description: formData.description.trim(),
        icon: formData.icon,
        color: formData.color,
        userId: 'current-user', // This should come from auth context
      });
      
      setFormData({ name: '', description: '', color: 'blue', icon: 'book' });
      onClose();
    } catch (error) {
      console.error('Error creating category:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  const selectedColor = colorOptions.find(c => c.value === formData.color);
  const selectedIcon = iconOptions.find(i => i.value === formData.icon);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-handwriting text-gray-900">Create New Collection</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className={`aspect-square bg-gradient-to-br ${selectedColor?.bg} rounded-lg mb-3 flex items-center justify-center`}>
                  <div className="text-center">
                    <div className={`w-8 h-8 ${selectedColor?.button.replace('bg-', 'bg-').replace(' hover:bg-', '')} rounded-full mx-auto mb-1 flex items-center justify-center`}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={selectedIcon?.svg} />
                      </svg>
                    </div>
                    <p className={`text-xs ${selectedColor?.text} font-medium`}>
                      {formData.name || 'Collection Name'}
                    </p>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">
                  {formData.name || 'Collection Name'}
                </h4>
                <p className="text-xs text-gray-600 mb-2">
                  {formData.description || 'Collection description'}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                  <span>0 entries</span>
                  <span>Just created</span>
                </div>
                <button 
                  type="button"
                  className={`w-full ${selectedColor?.button} text-white text-xs py-2 px-3 rounded-lg transition-colors font-medium`}
                  disabled
                >
                  Add Entry
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Collection Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Work Journal, Fitness Log"
                  maxLength={50}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Describe what this collection is for..."
                  rows={3}
                  maxLength={200}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Theme
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => handleInputChange('color', color.value)}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        formData.color === color.value
                          ? 'border-gray-900 ring-2 ring-gray-300'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${color.bg} mx-auto`}></div>
                      <span className="text-xs text-gray-600 mt-1 block">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon.value}
                      type="button"
                      onClick={() => handleInputChange('icon', icon.value)}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        formData.icon === icon.value
                          ? 'border-gray-900 ring-2 ring-gray-300'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="w-6 h-6 mx-auto flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon.svg} />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-600 mt-1 block">{icon.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.name.trim() || !formData.description.trim() || isSubmitting}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isSubmitting ? 'Creating...' : 'Create Collection'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}



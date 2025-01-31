import React from 'react';
import Link from 'next/link';

interface AuthCardProps {
  title: string;
  error?: string;
  children: React.ReactNode;
  footer: {
    text: string;
    linkText: string;
    linkHref: string;
  };
}

export default function AuthCard({ title, error, children, footer }: AuthCardProps) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8 border border-gray-100">
          {/* Logo/Brand Section */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 tracking-tight">
              {title}
            </h2>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form Content */}
          <div className="space-y-6">
            {children}
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {footer.text}{' '}
              <Link 
                href={footer.linkHref} 
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
              >
                {footer.linkText}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
} 
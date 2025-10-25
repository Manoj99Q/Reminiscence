'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthCard from '@/components/AuthCard';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Always show the same error message for security
        setError('Invalid Gmail or password');
        return;
      }

      // Redirect to diary page
      router.push('/diary');
    } catch (err: any) {
      // Show unified error message for any network or other errors
      setError('Invalid Gmail or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setForgotPasswordLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to send reset email');
        setForgotPasswordLoading(false);
        return;
      }

      setForgotPasswordSuccess(true);
      setForgotPasswordLoading(false);
    } catch (err: any) {
      setError('Failed to send reset email');
      setForgotPasswordLoading(false);
    }
  };

  // Show forgot password success message
  if (forgotPasswordSuccess) {
    return (
      <AuthCard
        title="Check your email"
        error={undefined}
        footer={{
          text: "Remember your password?",
          linkText: "Sign in",
          linkHref: "#",
          onClick: () => {
            setForgotPasswordSuccess(false);
            setShowForgotPassword(false);
            setError('');
            setForgotPasswordEmail('');
          }
        }}
      >
        <div className="text-center space-y-6">
          <div className="mx-auto h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="h-10 w-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Reset link sent!</h3>
            <p className="text-sm text-gray-600">
              We've sent a password reset link to <strong>{forgotPasswordEmail}</strong>. 
              Please check your email and click the link to reset your password.
            </p>
          </div>
        </div>
      </AuthCard>
    );
  }

  // Show forgot password form
  if (showForgotPassword) {
    return (
      <AuthCard
        title="Reset your password"
        error={error}
        footer={{
          text: "Remember your password?",
          linkText: "Sign in",
          linkHref: "#",
          onClick: () => {
            setShowForgotPassword(false);
            setError('');
            setForgotPasswordEmail('');
          }
        }}
      >
        <form onSubmit={handleForgotPassword} className="space-y-6">
          <div>
            <label htmlFor="forgotEmail" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1">
              <input
                id="forgotEmail"
                name="forgotEmail"
                type="text"
                className="appearance-none block w-full px-4 py-3 border-2 border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 sm:text-sm transition duration-200 bg-white/80 backdrop-blur-sm"
                placeholder="Enter your Gmail address"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={forgotPasswordLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-black via-gray-800 to-black hover:from-gray-900 hover:via-gray-700 hover:to-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden transform hover:-translate-y-0.5"
            >
              <div className="absolute inset-0 -top-2 -left-2 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full h-full transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700 ease-out"></div>
              {forgotPasswordLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white relative z-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="relative z-10">Sending reset link...</span>
                </>
              ) : (
                <span className="relative z-10">Send reset link</span>
              )}
            </button>
          </div>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Welcome to Reminiscence"
      error={error}
      footer={{
        text: "Don't have an account?",
        linkText: "Register now",
        linkHref: "/register"
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="text"
                className="appearance-none block w-full px-4 py-3 border-2 border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 sm:text-sm transition duration-200 bg-white/80 backdrop-blur-sm"
                placeholder="Enter your Gmail address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                className="appearance-none block w-full px-4 py-3 border-2 border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 sm:text-sm transition duration-200 bg-white/80 backdrop-blur-sm"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Forgot password?
          </button>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-black via-gray-800 to-black hover:from-gray-900 hover:via-gray-700 hover:to-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden transform hover:-translate-y-0.5"
          >
            {/* Shine effect */}
            <div className="absolute inset-0 -top-2 -left-2 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full h-full transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700 ease-out"></div>
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white relative z-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="relative z-10">Signing in...</span>
              </>
            ) : (
              <span className="relative z-10">Sign in</span>
            )}
          </button>
        </div>
      </form>
    </AuthCard>
  );
} 
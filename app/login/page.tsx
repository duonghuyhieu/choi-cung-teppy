'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/hooks';
import { useQueryClient } from '@tanstack/react-query';

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { login, isLoggingIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Call login API directly
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log('Login result:', data);

      if (!data.success) {
        setError(data.error || 'Login failed');
        return;
      }

      // Save token to localStorage
      if (data.data?.token && data.data?.user) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth-token', data.data.token);
          console.log('Token saved to localStorage:', localStorage.getItem('auth-token'));
        }

        // Set user data to React Query cache BEFORE redirect
        queryClient.setQueryData(['currentUser'], data.data.user);
        console.log('User set to cache:', data.data.user);
        console.log('Redirecting to /admin...');

        // Redirect to admin using router
        router.push('/admin');
      } else {
        setError('No token or user received from server');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold hover:text-blue-400 transition-colors">
            Game Saver
          </Link>
          <h1 className="text-2xl font-bold mt-4">Đăng nhập Admin</h1>
          <p className="text-gray-400 mt-2">Đăng nhập để quản lý games</p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800 rounded-lg p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Tên đăng nhập
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="username"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Mật khẩu"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-3 rounded-lg font-bold transition-colors"
            >
              {isLoggingIn ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
            <p className="text-sm font-semibold mb-2">Tài khoản:</p>
            <div className="space-y-1 text-sm text-gray-300">
              <p>Username: <span className="font-mono bg-gray-900 px-2 py-1 rounded">admin</span></p>
              <p>Password: <span className="font-mono bg-gray-900 px-2 py-1 rounded">admin</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

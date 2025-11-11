'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';

export default function RegisterPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate
    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setIsLoading(true);

    try {
      // Call register API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Đăng ký thất bại');
        setIsLoading(false);
        return;
      }

      // Save token to localStorage
      if (data.data?.token && data.data?.user) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth-token', data.data.token);
        }

        // Set user data to React Query cache
        queryClient.setQueryData(['currentUser'], data.data.user);

        // Redirect to home
        router.push('/');
      } else {
        setError('Không nhận được token từ server');
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error('Register error:', err);
      setError(err.message || 'Đăng ký thất bại');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[var(--neon-cyan)] opacity-10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[var(--neon-magenta)] opacity-10 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--neon-purple)] opacity-6 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-4xl font-bold bg-gradient-to-r from-[var(--neon-cyan)] to-white bg-clip-text text-transparent hover:from-white hover:to-[var(--neon-cyan)] transition-all duration-300">
            🎮 GAME SAVER
          </Link>
          <h1 className="text-3xl font-bold mt-6 text-white">
            Đăng ký tài khoản
          </h1>
          <p className="text-gray-400 mt-2">Tạo tài khoản để quản lý save games</p>
        </div>

        {/* Register Form - Glassmorphism */}
        <div className="glass-strong rounded-2xl p-8 shadow-2xl neon-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="glass rounded-lg border border-[var(--neon-pink)] bg-[var(--neon-pink)]/10 px-4 py-3">
                <p className="text-[var(--neon-pink)] text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-[var(--neon-cyan)]">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 glass rounded-xl border border-white/20 focus:outline-none focus:border-[var(--neon-cyan)] focus:shadow-[0_0_15px_var(--neon-cyan)] transition-all duration-300 text-white placeholder-gray-400"
                placeholder="your@email.com"
              />
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2 text-[var(--neon-cyan)]">
                Tên đăng nhập
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 glass rounded-xl border border-white/20 focus:outline-none focus:border-[var(--neon-cyan)] focus:shadow-[0_0_15px_var(--neon-cyan)] transition-all duration-300 text-white placeholder-gray-400"
                placeholder="username"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 text-[var(--neon-cyan)]">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 glass rounded-xl border border-white/20 focus:outline-none focus:border-[var(--neon-cyan)] focus:shadow-[0_0_15px_var(--neon-cyan)] transition-all duration-300 text-white placeholder-gray-400"
                placeholder="••••••••"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-[var(--neon-cyan)]">
                Xác nhận mật khẩu
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 glass rounded-xl border border-white/20 focus:outline-none focus:border-[var(--neon-cyan)] focus:shadow-[0_0_15px_var(--neon-cyan)] transition-all duration-300 text-white placeholder-gray-400"
                placeholder="••••••••"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:scale-[1.01] active:scale-95"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                  Đang đăng ký...
                </span>
              ) : (
                'ĐĂNG KÝ'
              )}
            </button>
          </form>
        </div>

        {/* Login link */}
        <div className="text-center mt-6">
          <p className="text-gray-400">
            Đã có tài khoản?{' '}
            <Link href="/login" className="text-[var(--neon-cyan)] hover:text-[var(--neon-purple)] transition-colors font-semibold">
              Đăng nhập ngay
            </Link>
          </p>
        </div>

        {/* Back to home link */}
        <div className="text-center mt-4">
          <Link href="/" className="text-sm text-gray-400 hover:text-[var(--neon-cyan)] transition-colors">
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

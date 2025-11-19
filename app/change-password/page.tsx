'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/hooks';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (currentPassword === newPassword) {
      setError('Mật khẩu mới phải khác mật khẩu hiện tại');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Đổi mật khẩu thất bại');
        return;
      }

      setSuccess('Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-[var(--neon-cyan)] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xl text-gray-300">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[var(--neon-cyan)] opacity-10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[var(--neon-magenta)] opacity-10 rounded-full blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--neon-cyan)] to-white bg-clip-text text-transparent mb-2">
              Đổi mật khẩu
            </h1>
            <p className="text-gray-400">Cập nhật mật khẩu của bạn</p>
          </div>

          {/* Change Password Form */}
          <div className="glass-strong rounded-2xl p-8 shadow-2xl neon-border">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="glass rounded-lg border border-[var(--neon-pink)] bg-[var(--neon-pink)]/10 px-4 py-3">
                  <p className="text-[var(--neon-pink)] text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="glass rounded-lg border border-[var(--neon-green)] bg-[var(--neon-green)]/10 px-4 py-3">
                  <p className="text-[var(--neon-green)] text-sm font-medium">{success}</p>
                </div>
              )}

              {/* Current Password */}
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium mb-2 text-[var(--neon-cyan)]">
                  Mật khẩu hiện tại
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 glass rounded-xl border border-white/20 focus:outline-none focus:border-[var(--neon-cyan)] focus:shadow-[0_0_15px_var(--neon-cyan)] transition-all duration-300 text-white placeholder-gray-400"
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium mb-2 text-[var(--neon-cyan)]">
                  Mật khẩu mới
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 glass rounded-xl border border-white/20 focus:outline-none focus:border-[var(--neon-cyan)] focus:shadow-[0_0_15px_var(--neon-cyan)] transition-all duration-300 text-white placeholder-gray-400"
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-[var(--neon-cyan)]">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 glass rounded-xl border border-white/20 focus:outline-none focus:border-[var(--neon-cyan)] focus:shadow-[0_0_15px_var(--neon-cyan)] transition-all duration-300 text-white placeholder-gray-400"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:scale-[1.01] active:scale-95"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                    Đang xử lý...
                  </span>
                ) : (
                  '🔑 ĐỔI MẬT KHẨU'
                )}
              </button>

              {/* Back Link */}
              <div className="text-center pt-4">
                <Link
                  href="/profile"
                  className="text-sm text-gray-400 hover:text-[var(--neon-cyan)] transition-colors"
                >
                  ← Quay lại thông tin tài khoản
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

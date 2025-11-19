'use client';

import { useAuth } from '@/lib/auth/hooks';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[var(--neon-cyan)] opacity-10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[var(--neon-purple)] opacity-10 rounded-full blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--neon-cyan)] to-white bg-clip-text text-transparent mb-2">
              Thông tin tài khoản
            </h1>
            <p className="text-gray-400">Quản lý thông tin cá nhân của bạn</p>
          </div>

          {/* Profile Card */}
          <div className="glass-strong rounded-2xl p-8 shadow-2xl neon-border">
            <div className="space-y-6">
              {/* Avatar Section */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-purple)] flex items-center justify-center text-4xl font-bold text-white shadow-[0_0_20px_rgba(0,240,255,0.4)]">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-[var(--neon-green)] rounded-full border-4 border-[var(--bg-dark)]"></div>
                </div>
              </div>

              {/* User Info */}
              <div className="space-y-4">
                {/* Username */}
                <div className="glass rounded-xl p-4 border border-white/10">
                  <label className="block text-sm font-medium text-[var(--neon-cyan)] mb-2">
                    Tên đăng nhập
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">👤</span>
                    <span className="text-white font-semibold text-lg">{user.username}</span>
                  </div>
                </div>

                {/* Email */}
                <div className="glass rounded-xl p-4 border border-white/10">
                  <label className="block text-sm font-medium text-[var(--neon-cyan)] mb-2">
                    Email
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">📧</span>
                    <span className="text-white font-semibold text-lg">{user.email}</span>
                  </div>
                </div>

                {/* Role */}
                <div className="glass rounded-xl p-4 border border-white/10">
                  <label className="block text-sm font-medium text-[var(--neon-cyan)] mb-2">
                    Vai trò
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{user.role === 'admin' ? '⚡' : '🎮'}</span>
                    <span className={`font-semibold text-lg ${user.role === 'admin' ? 'text-[var(--neon-purple)]' : 'text-white'}`}>
                      {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                    </span>
                  </div>
                </div>

                {/* Created At */}
                <div className="glass rounded-xl p-4 border border-white/10">
                  <label className="block text-sm font-medium text-[var(--neon-cyan)] mb-2">
                    Ngày tạo tài khoản
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">📅</span>
                    <span className="text-gray-300">{formatDate(user.created_at)}</span>
                  </div>
                </div>

                {/* Updated At */}
                <div className="glass rounded-xl p-4 border border-white/10">
                  <label className="block text-sm font-medium text-[var(--neon-cyan)] mb-2">
                    Cập nhật lần cuối
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🔄</span>
                    <span className="text-gray-300">{formatDate(user.updated_at)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-white/10">
                <Link
                  href="/change-password"
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:scale-[1.02] active:scale-95 text-center"
                >
                  🔑 Đổi mật khẩu
                </Link>
                <Link
                  href="/"
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-300 transition-all duration-300 glass border border-white/20 hover:border-[var(--neon-cyan)]/50 hover:text-white hover:scale-[1.02] active:scale-95 text-center"
                >
                  ← Quay lại
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

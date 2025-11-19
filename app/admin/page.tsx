'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/hooks';
import Navigation from '@/components/Navigation';
import AdminGamesTab from '@/components/admin/AdminGamesTab';
import AdminUsersTab from '@/components/admin/AdminUsersTab';
import AdminSavesTab from '@/components/admin/AdminSavesTab';
import AdminAccountsTab from '@/components/admin/AdminAccountsTab';

type TabType = 'games' | 'users' | 'saves' | 'accounts';

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('games');
  const [games, setGames] = useState<any[]>([]);

  // Load games for accounts tab
  useEffect(() => {
    if (activeTab === 'accounts') {
      fetch('/api/games')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setGames(data.data);
          }
        })
        .catch(err => console.error('Failed to load games:', err));
    }
  }, [activeTab]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[var(--neon-cyan)] border-t-transparent"></div>
          <p className="mt-4 text-gray-400">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-[var(--neon-pink)] opacity-10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[var(--neon-purple)] opacity-10 rounded-full blur-[100px]"></div>
        </div>
        <div className="text-center max-w-md mx-auto px-4 relative z-10">
          <div className="text-8xl mb-6">🔒</div>
          <h1 className="text-4xl font-bold mb-4 text-white">Truy cập bị từ chối</h1>
          <p className="text-gray-300 mb-8 text-lg">Bạn không có quyền truy cập trang này. Chỉ admin mới có thể vào.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/" className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:scale-105">
              Về trang chủ
            </Link>
            <Link href="/login" className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 glass-strong border border-white/20 hover:border-[var(--neon-cyan)]/70">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--neon-purple)] opacity-8 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--neon-cyan)] opacity-8 rounded-full blur-[120px]"></div>
      </div>

      <Navigation />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-[var(--neon-cyan)] via-[var(--neon-purple)] to-[var(--neon-magenta)] bg-clip-text text-transparent">
            ⚡ ADMIN PANEL
          </h1>
          <p className="text-gray-300 text-lg">Quản lý games, người dùng và save files</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('games')}
            className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
              activeTab === 'games'
                ? 'bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'glass border border-white/20 text-gray-300 hover:border-[var(--neon-cyan)]/50'
            }`}
          >
            🎮 Games
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
              activeTab === 'accounts'
                ? 'bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'glass border border-white/20 text-gray-300 hover:border-[var(--neon-cyan)]/50'
            }`}
          >
            🔑 Accounts
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'glass border border-white/20 text-gray-300 hover:border-[var(--neon-cyan)]/50'
            }`}
          >
            👥 Người dùng
          </button>
          <button
            onClick={() => setActiveTab('saves')}
            className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
              activeTab === 'saves'
                ? 'bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'glass border border-white/20 text-gray-300 hover:border-[var(--neon-cyan)]/50'
            }`}
          >
            💾 Save Files
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'games' && <AdminGamesTab />}
        {activeTab === 'accounts' && <AdminAccountsTab games={games} />}
        {activeTab === 'users' && <AdminUsersTab />}
        {activeTab === 'saves' && <AdminSavesTab />}
      </div>
    </div>
  );
}

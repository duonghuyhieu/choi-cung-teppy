'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';
import HelpDialog from './HelpDialog';

export default function Navigation() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <nav className="glass-strong border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-[var(--neon-cyan)] to-white bg-clip-text text-transparent hover:from-white hover:to-[var(--neon-cyan)] transition-all duration-300 flex items-center gap-2">
            <span className="text-4xl">🎮</span>
            <span>GAME SAVER</span>
          </Link>
          <div className="flex gap-4 items-center">
            <HelpDialog />
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-[var(--neon-cyan)] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-400">Loading...</span>
              </div>
            ) : user ? (
              <>
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="px-4 py-2 glass rounded-lg border border-[var(--neon-purple)]/30 hover:border-[var(--neon-purple)]/70 hover:shadow-[0_0_10px_rgba(176,0,255,0.3)] transition-all duration-300 text-[var(--neon-purple)] font-semibold"
                  >
                    ⚡ Admin Panel
                  </Link>
                )}
                <div className="flex items-center gap-2 px-4 py-2 glass rounded-lg border border-white/10">
                  <div className="w-2 h-2 bg-[var(--neon-green)] rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-300">{user.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg font-semibold transition-all duration-300 bg-gradient-to-r from-[var(--neon-pink)] to-[var(--neon-magenta)] hover:shadow-[0_0_12px_rgba(255,0,110,0.4)] hover:scale-[1.02] active:scale-95"
                >
                  Logout
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}

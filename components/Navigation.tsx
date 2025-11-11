'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';
import { useHelpDialog } from '@/lib/contexts/HelpDialogContext';
import HelpButton from './HelpButton';

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const { openDialog } = useHelpDialog();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="glass-strong border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-[var(--neon-cyan)] to-white bg-clip-text text-transparent hover:from-white hover:to-[var(--neon-cyan)] transition-all duration-300 flex items-center gap-2">
            <span className="text-4xl">🎮</span>
            <span>GAME SAVER</span>
          </Link>

          {/* Navigation Tabs */}
          <div className="flex gap-2 items-center">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                isActive('/')
                  ? 'bg-[var(--neon-cyan)]/20 text-[var(--neon-cyan)] border border-[var(--neon-cyan)]/50'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              🎮 Danh sách Game
            </Link>
            {user && (
              <Link
                href="/my-saves"
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  isActive('/my-saves')
                    ? 'bg-[var(--neon-cyan)]/20 text-[var(--neon-cyan)] border border-[var(--neon-cyan)]/50'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                💾 My Saves
              </Link>
            )}
          </div>

          <div className="flex gap-4 items-center">
            <HelpButton onClick={openDialog} />
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
                  <div className="w-2 h-2 bg-[var(--neon-green)] rounded-full"></div>
                  <span className="text-sm text-gray-300">{user.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg font-semibold transition-all duration-300 bg-gradient-to-r from-[var(--neon-pink)] to-[var(--neon-magenta)] hover:shadow-[0_0_12px_rgba(255,0,110,0.4)] hover:scale-[1.02] active:scale-95"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-6 py-2 rounded-lg font-semibold transition-all duration-300 bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:scale-[1.02] active:scale-95"
              >
                🔐 Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

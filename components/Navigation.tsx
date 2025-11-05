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
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold hover:text-blue-400 transition-colors">
            🎮 Game Saver
          </Link>
          <div className="flex gap-4 items-center">
            <HelpDialog />
            {isLoading ? (
              <span className="text-gray-400">Loading...</span>
            ) : user ? (
              <>
                {user.role === 'admin' && (
                  <Link href="/admin" className="hover:text-blue-400 transition-colors">
                    Admin
                  </Link>
                )}
                <span className="text-gray-400">Admin: {user.username}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
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

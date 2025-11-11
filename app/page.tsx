'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { GameWithLinks, ApiResponse } from '@/types';
import Navigation from '@/components/Navigation';

async function fetchGames(): Promise<GameWithLinks[]> {
  const response = await fetch('/api/games');
  const data: ApiResponse<GameWithLinks[]> = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch games');
  }

  return data.data || [];
}

export default function Home() {
  const { data: games, isLoading, error } = useQuery({
    queryKey: ['games'],
    queryFn: fetchGames,
  });

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-[var(--neon-cyan)] opacity-10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-40 right-0 w-96 h-96 bg-[var(--neon-magenta)] opacity-10 rounded-full blur-[120px] animate-pulse delay-700"></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-[var(--neon-purple)] opacity-8 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      </div>

      {/* Navigation */}
      <Navigation />

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-[var(--neon-cyan)] via-white to-[var(--neon-cyan)] bg-clip-text text-transparent">
            GAME SAVER
          </h1>
          <p className="text-2xl text-gray-200 font-semibold">
            Tải game và quản lý save game của bạn
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[var(--neon-green)] rounded-full animate-pulse"></span>
              Cloud Storage
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[var(--neon-cyan)] rounded-full animate-pulse"></span>
              Auto Sync
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[var(--neon-magenta)] rounded-full animate-pulse"></span>
              Unlimited Games
            </span>
          </div>
        </header>

        {/* Games Section */}
        <main className="max-w-7xl mx-auto">
          <section className="mb-8">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] bg-clip-text text-transparent">
                Danh sách Game
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-[var(--neon-cyan)] to-transparent"></div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-[var(--neon-cyan)] border-r-[var(--neon-magenta)]"></div>
                <p className="mt-6 text-xl text-[var(--neon-cyan)]">Loading games...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="glass-strong rounded-xl border border-[var(--neon-pink)] bg-[var(--neon-pink)]/10 px-6 py-4">
                <p className="text-[var(--neon-pink)] font-medium">Lỗi: {(error as Error).message}</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && games && games.length === 0 && (
              <div className="text-center py-20 glass-strong rounded-2xl neon-border">
                <div className="text-8xl mb-6">🎮</div>
                <h2 className="text-3xl font-bold mb-3 neon-text-purple">Chưa có game nào</h2>
                <p className="text-gray-400 text-lg">Game sẽ được thêm sớm!</p>
              </div>
            )}

            {/* Games Grid */}
            {!isLoading && !error && games && games.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {games.map((game) => (
                  <Link
                    href={`/games/${game.id}`}
                    key={game.id}
                    className="group glass-strong rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] border border-white/10 hover:border-[var(--neon-cyan)]/50"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-video bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)] flex items-center justify-center relative overflow-hidden">
                      {game.thumbnail_url ? (
                        <>
                          <img
                            src={game.thumbnail_url}
                            alt={game.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-secondary)] via-transparent to-transparent opacity-60"></div>
                        </>
                      ) : (
                        <div className="text-7xl group-hover:scale-110 transition-transform duration-300">🎮</div>
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--neon-cyan)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-[var(--neon-cyan)] transition-colors">
                        {game.name}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {game.description || 'Chưa có mô tả'}
                      </p>

                      {/* Download Count */}
                      {game.download_links && game.download_links.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-[var(--neon-magenta)]">📥</span>
                          <span className="text-[var(--neon-cyan)] font-medium">
                            {game.download_links.length} link tải
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </main>

        {/* Footer */}
        <footer className="text-center mt-20 py-8 border-t border-white/10">
          <p className="text-gray-400">
            Game Saver -
            <span className="text-[var(--neon-cyan)] ml-2">Quản lý save game dễ dàng</span>
          </p>
        </footer>
      </div>
    </div>
  );
}

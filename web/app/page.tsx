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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Navigation */}
      <Navigation />

      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4">Game Saver</h1>
          <p className="text-xl text-gray-300">
            Tải game và quản lý save game của bạn
          </p>
        </header>

        {/* Games Section */}
        <main className="max-w-7xl mx-auto">
          <section className="mb-8">
            <h2 className="text-3xl font-bold mb-6">Danh sách Game</h2>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-400">Đang tải...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
                Lỗi: {(error as Error).message}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && games && games.length === 0 && (
              <div className="text-center py-12 bg-gray-800 rounded-lg">
                <div className="text-6xl mb-4">🎮</div>
                <h2 className="text-2xl font-bold mb-2">Chưa có game nào</h2>
                <p className="text-gray-400">Game sẽ được thêm sớm!</p>
              </div>
            )}

            {/* Games Grid */}
            {!isLoading && !error && games && games.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((game) => (
                  <Link
                    href={`/games/${game.id}`}
                    key={game.id}
                    className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-xl transition-all hover:scale-105"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-video bg-gray-700 flex items-center justify-center">
                      {game.thumbnail_url ? (
                        <img src={game.thumbnail_url} alt={game.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-6xl">🎮</div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2">{game.name}</h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {game.description || 'Chưa có mô tả'}
                      </p>

                      {/* Download Count */}
                      {game.download_links && game.download_links.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-blue-400">
                          <span>📥</span>
                          <span>{game.download_links.length} link tải</span>
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
        <footer className="text-center text-gray-400 mt-16">
          <p>Game Saver - Quản lý save game dễ dàng</p>
        </footer>
      </div>
    </div>
  );
}

'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { GameWithLinks, ApiResponse } from '@/types';
import Navigation from '@/components/Navigation';

async function fetchGameDetail(id: string): Promise<GameWithLinks> {
  const response = await fetch(`/api/games/${id}`);
  const data: ApiResponse<GameWithLinks> = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch game');
  }

  return data.data!;
}

export default function GameDetailPage() {
  const params = useParams();
  const gameId = params.id as string;

  const { data: game, isLoading, error } = useQuery({
    queryKey: ['game', gameId],
    queryFn: () => fetchGameDetail(gameId),
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Navigation */}
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6">
          <span className="mr-2">←</span>
          Quay lại
        </Link>

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

        {/* Game Detail */}
        {!isLoading && !error && game && (
          <div className="max-w-4xl mx-auto">
            {/* Game Header */}
            <div className="bg-gray-800 rounded-lg overflow-hidden mb-8">
              <div className="aspect-video bg-gray-700 flex items-center justify-center">
                {game.thumbnail_url ? (
                  <img src={game.thumbnail_url} alt={game.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-9xl">🎮</div>
                )}
              </div>

              <div className="p-8">
                <h1 className="text-4xl font-bold mb-4">{game.name}</h1>
                {game.description && (
                  <p className="text-gray-300 text-lg mb-6">{game.description}</p>
                )}

                {/* Game Info */}
                <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
                  <h3 className="font-bold mb-2">Thông tin:</h3>
                  <div className="text-sm text-gray-300">
                    <p className="mb-1">
                      <span className="font-semibold">Save file path:</span>{' '}
                      <code className="bg-gray-900 px-2 py-1 rounded text-xs">{game.save_file_path}</code>
                    </p>
                  </div>
                </div>

                {/* Download Links */}
                <div>
                  <h2 className="text-2xl font-bold mb-4">Link Tải Game</h2>

                  {!game.download_links || game.download_links.length === 0 ? (
                    <div className="bg-gray-700/50 rounded-lg p-6 text-center">
                      <p className="text-gray-400">Chưa có link tải cho game này</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {game.download_links.map((link, index) => (
                        <div key={link.id} className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-white">
                                {link.title}
                              </h3>
                              {link.file_size && (
                                <p className="text-xs text-gray-400 mt-1">
                                  Dung lượng: {link.file_size}
                                </p>
                              )}
                            </div>

                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors whitespace-nowrap"
                            >
                              📥 Tải xuống
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CLI Usage Guide */}
            <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-bold text-blue-400">🎮 Quản lý Save Game với CLI</h3>

              <p className="text-sm text-gray-300">
                Sau khi tải game, dùng CLI để backup và đồng bộ save game lên cloud:
              </p>

              <div className="bg-gray-900 rounded-lg p-4 space-y-2">
                <p className="text-xs text-gray-400 mb-2">Chạy các lệnh sau trong Command Prompt:</p>
                <code className="block text-sm text-green-400">
                  git clone https://github.com/duonghuyhieu/choi-cung-teppy.git
                </code>
                <code className="block text-sm text-green-400">
                  cd choi-cung-teppy
                </code>
                <code className="block text-sm text-green-400">
                  npm install && npm run cli
                </code>
              </div>

              <p className="text-xs text-gray-400">
                CLI sẽ giúp bạn upload/download save file, đồng bộ giữa nhiều máy tính.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

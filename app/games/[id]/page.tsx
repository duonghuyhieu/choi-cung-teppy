'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { GameWithLinks, ApiResponse } from '@/types';
import Navigation from '@/components/Navigation';
import UploadSaveModal from '@/components/UploadSaveModal';
import { useAuth } from '@/lib/auth/hooks';

interface SaveFileWithUser {
  id: string;
  game_id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  description: string | null;
  is_public: boolean;
  created_at: string;
  user: {
    username: string;
  };
}

async function fetchGameDetail(id: string): Promise<GameWithLinks> {
  const response = await fetch(`/api/games/${id}`);
  const data: ApiResponse<GameWithLinks> = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch game');
  }

  return data.data!;
}

async function fetchGameSaves(gameId: string): Promise<SaveFileWithUser[]> {
  const response = await fetch(`/api/games/${gameId}/saves`);
  const data: ApiResponse<SaveFileWithUser[]> = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch saves');
  }

  return data.data || [];
}

export default function GameDetailPage() {
  const params = useParams();
  const gameId = params.id as string;
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { user } = useAuth();

  const { data: game, isLoading, error } = useQuery({
    queryKey: ['game', gameId],
    queryFn: () => fetchGameDetail(gameId),
  });

  const { data: saves, isLoading: savesLoading } = useQuery({
    queryKey: ['gameSaves', gameId],
    queryFn: () => fetchGameSaves(gameId),
    enabled: !!gameId,
  });

  const handleDownload = async (id: string, fileName: string) => {
    setDownloadingId(id);
    try {
      // Get download URL from API
      const response = await fetch(`/api/saves/${id}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Không thể tải file');
      }

      // Download file
      const downloadUrl = data.data.download_url;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: any) {
      alert('Lỗi khi tải file: ' + error.message);
    } finally {
      setDownloadingId(null);
    }
  };

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

                {/* Save Files Section */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Save Files Công Khai</h2>
                    {user && (
                      <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:scale-[1.02] active:scale-95"
                      >
                        📤 Upload Save
                      </button>
                    )}
                  </div>

                  {savesLoading ? (
                    <div className="bg-gray-700/50 rounded-lg p-6 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <p className="mt-2 text-gray-400">Đang tải...</p>
                    </div>
                  ) : !saves || saves.length === 0 ? (
                    <div className="bg-gray-700/50 rounded-lg p-6 text-center">
                      <p className="text-gray-400">Chưa có save file công khai nào</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {saves.map((save) => (
                        <div key={save.id} className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-white mb-1 line-clamp-1">
                                {save.file_name}
                              </h3>
                              <p className="text-xs text-gray-400">
                                {(save.file_size / 1024).toFixed(2)} KB • By {save.user.username}
                              </p>
                            </div>
                            {save.is_public && (
                              <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded border border-green-500/30">
                                Public
                              </span>
                            )}
                          </div>

                          {save.description && (
                            <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                              {save.description}
                            </p>
                          )}

                          <div className="text-xs text-gray-500 mb-3">
                            {new Date(save.created_at).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>

                          <button
                            onClick={() => handleDownload(save.id, save.file_name)}
                            disabled={downloadingId === save.id}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {downloadingId === save.id ? 'Đang tải...' : '📥 Tải Save'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Info Boxes */}
            <div className="space-y-4">
              {user && (
                <div className="bg-[var(--neon-cyan)]/10 border border-[var(--neon-cyan)] text-[var(--neon-cyan)] px-4 py-3 rounded-lg">
                  <p className="text-sm">
                    <strong>📤 Upload Save:</strong> Click nút "Upload Save" ở trên để đẩy save file lên cloud. Chọn "Công khai" để chia sẻ với mọi người!
                  </p>
                </div>
              )}
              <div className="bg-blue-500/10 border border-blue-500 text-blue-400 px-4 py-3 rounded-lg">
                <p className="text-sm">
                  <strong>💡 CLI Tool:</strong> Sử dụng CLI để tự động đồng bộ save giữa các thiết bị. Click "Hướng dẫn" ở góc trên để xem cách dùng.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Save Modal */}
      <UploadSaveModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        gameId={gameId}
        gameName={game?.name || ''}
      />
    </div>
  );
}

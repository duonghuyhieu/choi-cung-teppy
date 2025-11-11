'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/hooks';
import { ApiResponse } from '@/types';

interface SaveFileWithGame {
  id: string;
  game_id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  description: string | null;
  is_public: boolean;
  created_at: string;
  game?: {
    id: string;
    name: string;
    description: string | null;
  };
}

async function fetchMySaves(): Promise<SaveFileWithGame[]> {
  const response = await fetch('/api/saves/me');
  const data: ApiResponse<SaveFileWithGame[]> = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch saves');
  }

  return data.data || [];
}

async function deleteSave(id: string): Promise<void> {
  const response = await fetch(`/api/saves/${id}`, {
    method: 'DELETE',
  });

  const data: ApiResponse = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to delete save');
  }
}

export default function MySavesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: isAuthLoading } = useAuth();

  const { data: saves, isLoading, error } = useQuery({
    queryKey: ['mySaves'],
    queryFn: fetchMySaves,
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySaves'] });
    },
  });

  const handleDelete = async (id: string, fileName: string) => {
    if (confirm(`Bạn có chắc muốn xóa save "${fileName}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error: any) {
        alert('Lỗi: ' + error.message);
      }
    }
  };

  const handleDownload = async (id: string, fileName: string) => {
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
    }
  };

  // Redirect if not logged in
  if (!isAuthLoading && !user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-[var(--neon-cyan)] opacity-10 rounded-full blur-[120px]"></div>
        <div className="absolute top-40 right-0 w-96 h-96 bg-[var(--neon-magenta)] opacity-10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-[var(--neon-purple)] opacity-8 rounded-full blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-[var(--neon-cyan)] via-white to-[var(--neon-cyan)] bg-clip-text text-transparent">
            My Save Files
          </h1>
          <p className="text-gray-400 text-lg">Quản lý tất cả save files của bạn</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-[var(--neon-cyan)] border-r-[var(--neon-magenta)]"></div>
            <p className="mt-6 text-xl text-[var(--neon-cyan)]">Loading saves...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="glass-strong rounded-xl border border-[var(--neon-pink)] bg-[var(--neon-pink)]/10 px-6 py-4">
            <p className="text-[var(--neon-pink)] font-medium">Lỗi: {(error as Error).message}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && saves && saves.length === 0 && (
          <div className="text-center py-20 glass-strong rounded-2xl neon-border">
            <div className="text-8xl mb-6">💾</div>
            <h2 className="text-3xl font-bold mb-3 neon-text-purple">Chưa có save file nào</h2>
            <p className="text-gray-400 text-lg">Sử dụng CLI tool để upload save files lên cloud</p>
          </div>
        )}

        {/* Saves Grid */}
        {!isLoading && !error && saves && saves.length > 0 && (
          <div className="space-y-6">
            {/* Group by game */}
            {Object.entries(
              saves.reduce((acc, save) => {
                const gameId = save.game_id;
                if (!acc[gameId]) {
                  acc[gameId] = [];
                }
                acc[gameId].push(save);
                return acc;
              }, {} as Record<string, SaveFileWithGame[]>)
            ).map(([gameId, gameSaves]) => {
              const game = gameSaves[0]?.game;
              return (
                <div key={gameId} className="glass-strong rounded-2xl p-6 neon-border">
                  {/* Game Header */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                    <div>
                      <h2 className="text-2xl font-bold text-[var(--neon-cyan)]">
                        {game?.name || 'Unknown Game'}
                      </h2>
                      {game?.description && (
                        <p className="text-gray-400 text-sm mt-1">{game.description}</p>
                      )}
                    </div>
                    <Link
                      href={`/games/${gameId}`}
                      className="px-4 py-2 glass rounded-lg border border-[var(--neon-purple)]/30 hover:border-[var(--neon-purple)]/70 hover:shadow-[0_0_10px_rgba(176,0,255,0.3)] transition-all duration-300 text-[var(--neon-purple)] font-semibold text-sm"
                    >
                      Xem game →
                    </Link>
                  </div>

                  {/* Saves List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gameSaves.map((save) => (
                      <div
                        key={save.id}
                        className="glass rounded-xl p-4 border border-white/10 hover:border-[var(--neon-cyan)]/50 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white mb-1 line-clamp-1">
                              {save.file_name}
                            </h3>
                            <p className="text-xs text-gray-400">
                              {(save.file_size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                          {save.is_public && (
                            <span className="px-2 py-1 text-xs bg-[var(--neon-green)]/20 text-[var(--neon-green)] rounded border border-[var(--neon-green)]/30">
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
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDownload(save.id, save.file_name)}
                            className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] hover:shadow-[0_0_10px_rgba(0,240,255,0.4)] hover:scale-[1.02] active:scale-95"
                          >
                            📥 Tải
                          </button>
                          <button
                            onClick={() => handleDelete(save.id, save.file_name)}
                            disabled={deleteMutation.isPending}
                            className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 bg-gradient-to-r from-[var(--neon-pink)] to-[var(--neon-magenta)] hover:shadow-[0_0_10px_rgba(255,0,110,0.4)] hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deleteMutation.isPending ? '...' : '🗑️ Xóa'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

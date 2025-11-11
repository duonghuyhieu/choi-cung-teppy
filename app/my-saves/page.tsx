'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/hooks';
import { ApiResponse } from '@/types';
import Navigation from '@/components/Navigation';
import { useHelpDialog } from '@/lib/contexts/HelpDialogContext';

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
  const { openDialog } = useHelpDialog();

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
      const response = await fetch(`/api/saves/${id}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Không thể tải file');
      }

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

  // Calculate stats
  const totalSaves = saves?.length || 0;
  const totalSize = saves?.reduce((acc, save) => acc + save.file_size, 0) || 0;
  const totalGames = saves ? new Set(saves.map(s => s.game_id)).size : 0;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-[var(--neon-cyan)] opacity-10 rounded-full blur-[120px]"></div>
        <div className="absolute top-40 right-0 w-96 h-96 bg-[var(--neon-magenta)] opacity-10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-[var(--neon-purple)] opacity-8 rounded-full blur-[100px]"></div>
      </div>

      {/* Navigation */}
      <Navigation />

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-[var(--neon-cyan)] via-white to-[var(--neon-cyan)] bg-clip-text text-transparent">
            My Save Files
          </h1>
          <p className="text-xl text-gray-300">
            Quản lý và đồng bộ tất cả save files của bạn
          </p>
        </header>

        {/* Stats Cards */}
        {!isLoading && !error && saves && saves.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="glass-strong rounded-xl p-6 neon-border border-[var(--neon-cyan)]/30">
              <div className="text-4xl mb-2">💾</div>
              <div className="text-3xl font-bold text-[var(--neon-cyan)]">{totalSaves}</div>
              <div className="text-sm text-gray-400">Total Saves</div>
            </div>
            <div className="glass-strong rounded-xl p-6 neon-border border-[var(--neon-purple)]/30">
              <div className="text-4xl mb-2">🎮</div>
              <div className="text-3xl font-bold text-[var(--neon-purple)]">{totalGames}</div>
              <div className="text-sm text-gray-400">Games</div>
            </div>
            <div className="glass-strong rounded-xl p-6 neon-border border-[var(--neon-magenta)]/30">
              <div className="text-4xl mb-2">📦</div>
              <div className="text-3xl font-bold text-[var(--neon-magenta)]">
                {(totalSize / 1024 / 1024).toFixed(2)} MB
              </div>
              <div className="text-sm text-gray-400">Total Size</div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-[var(--neon-cyan)] border-r-[var(--neon-magenta)]"></div>
            <p className="mt-6 text-xl text-[var(--neon-cyan)]">Đang tải saves...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="glass-strong rounded-xl border border-[var(--neon-pink)] bg-[var(--neon-pink)]/10 px-6 py-4 max-w-2xl mx-auto">
            <p className="text-[var(--neon-pink)] font-medium">Lỗi: {(error as Error).message}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && saves && saves.length === 0 && (
          <div className="text-center py-20 glass-strong rounded-2xl neon-border max-w-2xl mx-auto">
            <div className="text-8xl mb-6">💾</div>
            <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] bg-clip-text text-transparent">
              Chưa có save file nào
            </h2>
            <p className="text-gray-300 text-lg mb-6">
              Sử dụng CLI tool để upload save files lên cloud và đồng bộ giữa các thiết bị
            </p>
            <button
              onClick={openDialog}
              className="px-8 py-3 rounded-lg font-semibold transition-all duration-300 bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] hover:scale-[1.05] active:scale-95"
            >
              📖 Xem hướng dẫn CLI
            </button>
          </div>
        )}

        {/* Saves by Game */}
        {!isLoading && !error && saves && saves.length > 0 && (
          <div className="max-w-7xl mx-auto">
            <div className="space-y-8">
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
                  <div key={gameId} className="glass-strong rounded-2xl overflow-hidden neon-border">
                    {/* Game Header */}
                    <div className="bg-gradient-to-r from-[var(--neon-cyan)]/10 to-[var(--neon-purple)]/10 border-b border-white/10 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                            <span className="text-4xl">🎮</span>
                            {game?.name || 'Unknown Game'}
                          </h2>
                          {game?.description && (
                            <p className="text-gray-300">{game.description}</p>
                          )}
                          <div className="mt-2 text-sm text-gray-400">
                            {gameSaves.length} save file{gameSaves.length > 1 ? 's' : ''} • {' '}
                            {(gameSaves.reduce((acc, s) => acc + s.file_size, 0) / 1024).toFixed(2)} KB
                          </div>
                        </div>
                        <Link
                          href={`/games/${gameId}`}
                          className="px-6 py-3 glass rounded-lg border border-[var(--neon-cyan)]/30 hover:border-[var(--neon-cyan)] hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all duration-300 text-[var(--neon-cyan)] font-semibold whitespace-nowrap"
                        >
                          Xem game →
                        </Link>
                      </div>
                    </div>

                    {/* Saves Grid */}
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {gameSaves.map((save) => (
                          <div
                            key={save.id}
                            className="glass rounded-xl p-5 border border-white/10 hover:border-[var(--neon-cyan)]/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.1)]"
                          >
                            {/* Save Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-white mb-1 truncate text-lg">
                                  {save.file_name}
                                </h3>
                                <p className="text-xs text-gray-400">
                                  {(save.file_size / 1024).toFixed(2)} KB
                                </p>
                              </div>
                              {save.is_public && (
                                <span className="px-2 py-1 text-xs bg-[var(--neon-green)]/20 text-[var(--neon-green)] rounded border border-[var(--neon-green)]/30 ml-2">
                                  Public
                                </span>
                              )}
                            </div>

                            {/* Description */}
                            {save.description && (
                              <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                                {save.description}
                              </p>
                            )}

                            {/* Date */}
                            <div className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                              <span>📅</span>
                              {new Date(save.created_at).toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDownload(save.id, save.file_name)}
                                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:scale-[1.02] active:scale-95"
                              >
                                📥 Tải
                              </button>
                              <button
                                onClick={() => handleDelete(save.id, save.file_name)}
                                disabled={deleteMutation.isPending}
                                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 bg-gradient-to-r from-[var(--neon-pink)] to-[var(--neon-magenta)] hover:shadow-[0_0_15px_rgba(255,0,110,0.4)] hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {deleteMutation.isPending ? '⏳' : '🗑️ Xóa'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

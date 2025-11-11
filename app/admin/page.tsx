'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2, Plus } from 'lucide-react';
import { useAuth } from '@/lib/auth/hooks';
import { Game, CreateGameDto, UpdateGameDto, ApiResponse } from '@/types';
import Navigation from '@/components/Navigation';
import GameDialog from '@/components/GameDialog';

async function fetchGames(): Promise<Game[]> {
  const response = await fetch('/api/games');
  const data: ApiResponse<Game[]> = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch games');
  return data.data || [];
}

async function createGame(gameData: CreateGameDto): Promise<Game> {
  const response = await fetch('/api/games', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gameData),
  });
  const data: ApiResponse<Game> = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to create game');
  return data.data!;
}

async function updateGame(gameId: string, gameData: UpdateGameDto): Promise<Game> {
  const response = await fetch(`/api/games/${gameId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gameData),
  });
  const data: ApiResponse<Game> = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to update game');
  return data.data!;
}

async function deleteGame(gameId: string): Promise<void> {
  const response = await fetch(`/api/games/${gameId}`, {
    method: 'DELETE',
  });
  const data: ApiResponse = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to delete game');
}

export default function AdminPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading, logout } = useAuth();

  console.log('Admin page - user:', user);
  console.log('Admin page - authLoading:', authLoading);
  console.log('Admin page - token in localStorage:', typeof window !== 'undefined' ? localStorage.getItem('auth-token') : 'N/A (server)');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedGame, setSelectedGame] = useState<Game | undefined>();

  const { data: games, isLoading } = useQuery({
    queryKey: ['games'],
    queryFn: fetchGames,
    enabled: !!user && user.role === 'admin',
  });

  const createMutation = useMutation({
    mutationFn: createGame,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGameDto }) => updateGame(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGame,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });

  const handleDialogSubmit = async (gameData: CreateGameDto | UpdateGameDto, links?: { title: string; url: string }[]) => {
    // Include links in the game data
    const dataWithLinks = { ...gameData, links: links || [] };

    if (dialogMode === 'create') {
      await createMutation.mutateAsync(dataWithLinks as CreateGameDto);
    } else if (selectedGame) {
      await updateMutation.mutateAsync({ id: selectedGame.id, data: dataWithLinks as UpdateGameDto });
    }
  };

  const handleDelete = (game: Game) => {
    if (window.confirm(`Bạn có chắc muốn xóa game "${game.name}"? Hành động này không thể hoàn tác.`)) {
      deleteMutation.mutate(game.id);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-400">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-[var(--neon-pink)] opacity-10 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[var(--neon-purple)] opacity-10 rounded-full blur-[100px] animate-pulse delay-1000"></div>
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
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--neon-purple)] opacity-8 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--neon-cyan)] opacity-8 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-[var(--neon-cyan)] via-[var(--neon-purple)] to-[var(--neon-magenta)] bg-clip-text text-transparent">
            ⚡ ADMIN PANEL
          </h1>
          <p className="text-gray-300 text-lg">Quản lý games và hệ thống</p>
        </div>

        {/* Games List */}
        <div className="glass-strong rounded-2xl p-8 border border-white/10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-[var(--neon-cyan)]">Danh sách Games</h2>
            <button
              onClick={() => {
                setDialogMode('create');
                setSelectedGame(undefined);
                setDialogOpen(true);
              }}
              className="px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:scale-[1.02] active:scale-95"
            >
              <Plus size={20} />
              Thêm Game
            </button>
          </div>

          {isLoading && (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-[var(--neon-cyan)] border-r-[var(--neon-magenta)]"></div>
              <p className="mt-6 text-xl text-[var(--neon-cyan)]">Loading games...</p>
            </div>
          )}

          {!isLoading && games && games.length === 0 && (
            <div className="text-center py-16 glass rounded-xl border border-[var(--neon-purple)]/30">
              <div className="text-8xl mb-6">🎮</div>
              <h3 className="text-2xl font-bold mb-3 neon-text-purple">No Games Yet</h3>
              <p className="text-gray-400 text-lg">Add your first game to get started!</p>
            </div>
          )}

          {!isLoading && games && games.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-[var(--neon-cyan)]/30">
                  <tr className="text-left">
                    <th className="pb-4 pr-4 text-[var(--neon-cyan)] font-bold">Name</th>
                    <th className="pb-4 pr-4 text-[var(--neon-cyan)] font-bold">Save Path</th>
                    <th className="pb-4 pr-4 text-[var(--neon-cyan)] font-bold">Created</th>
                    <th className="pb-4 text-[var(--neon-cyan)] font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {games.map((game, index) => (
                    <tr
                      key={game.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-5 pr-4">
                        <div className="font-semibold text-white text-lg">{game.name}</div>
                        {game.description && (
                          <div className="text-sm text-gray-400 line-clamp-1 mt-1">
                            {game.description}
                          </div>
                        )}
                      </td>
                      <td className="py-5 pr-4 text-gray-400 text-sm font-mono">
                        {game.save_file_path}
                      </td>
                      <td className="py-5 pr-4 text-gray-400">
                        {new Date(game.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-5">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setDialogMode('view');
                              setSelectedGame(game);
                              setDialogOpen(true);
                            }}
                            className="p-2 text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10 rounded-lg transition-all hover:shadow-[0_0_10px_var(--neon-cyan)]"
                            title="Xem chi tiết"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setDialogMode('edit');
                              setSelectedGame(game);
                              setDialogOpen(true);
                            }}
                            className="p-2 text-[var(--neon-green)] hover:bg-[var(--neon-green)]/10 rounded-lg transition-all hover:shadow-[0_0_10px_var(--neon-green)]"
                            title="Sửa"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(game)}
                            disabled={deleteMutation.isPending}
                            className="p-2 text-[var(--neon-pink)] hover:bg-[var(--neon-pink)]/10 disabled:text-gray-500 rounded-lg transition-all hover:shadow-[0_0_10px_var(--neon-pink)]"
                            title="Xóa"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Game Dialog */}
      <GameDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        mode={dialogMode}
        game={selectedGame}
        onSubmit={handleDialogSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}

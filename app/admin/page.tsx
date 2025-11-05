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
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-2">Truy cập bị từ chối</h1>
          <p className="text-gray-400 mb-6">Bạn không có quyền truy cập trang này. Chỉ admin mới có thể vào.</p>
          <div className="space-x-4">
            <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors">
              Về trang chủ
            </Link>
            <Link href="/login" className="inline-block bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg transition-colors">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
          <p className="text-gray-400">Quản lý games và hệ thống</p>
        </div>

        {/* Games List */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Danh sách Games</h2>
            <button
              onClick={() => {
                setDialogMode('create');
                setSelectedGame(undefined);
                setDialogOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Thêm Game
            </button>
          </div>

          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-400">Loading games...</p>
            </div>
          )}

          {!isLoading && games && games.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-xl font-bold mb-2">No Games Yet</h3>
              <p className="text-gray-400">Add your first game to get started!</p>
            </div>
          )}

          {!isLoading && games && games.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-700">
                  <tr className="text-left">
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 pr-4">Save Path</th>
                    <th className="pb-3 pr-4">Created</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {games.map((game) => (
                    <tr key={game.id} className="border-b border-gray-700">
                      <td className="py-4 pr-4">
                        <div className="font-semibold">{game.name}</div>
                        {game.description && (
                          <div className="text-sm text-gray-400 line-clamp-1">
                            {game.description}
                          </div>
                        )}
                      </td>
                      <td className="py-4 pr-4 text-gray-400 text-sm font-mono">
                        {game.save_file_path}
                      </td>
                      <td className="py-4 pr-4 text-gray-400">
                        {new Date(game.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setDialogMode('view');
                              setSelectedGame(game);
                              setDialogOpen(true);
                            }}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded transition-colors"
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
                            className="p-2 text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded transition-colors"
                            title="Sửa"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(game)}
                            disabled={deleteMutation.isPending}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 disabled:text-gray-500 rounded transition-colors"
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

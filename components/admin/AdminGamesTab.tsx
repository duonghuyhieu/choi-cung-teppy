'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, Pencil, Trash2, Plus } from 'lucide-react';
import { Game, CreateGameDto, UpdateGameDto, ApiResponse } from '@/types';
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

export default function AdminGamesTab() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedGame, setSelectedGame] = useState<Game | undefined>();

  const { data: games, isLoading } = useQuery({
    queryKey: ['games'],
    queryFn: fetchGames,
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
    const dataWithLinks = { ...gameData, links: links || [] };

    if (dialogMode === 'create') {
      await createMutation.mutateAsync(dataWithLinks as CreateGameDto);
    } else if (selectedGame) {
      await updateMutation.mutateAsync({ id: selectedGame.id, data: dataWithLinks as UpdateGameDto });
    }
  };

  const handleDelete = (game: Game) => {
    if (window.confirm(`Bạn có chắc muốn xóa game "${game.name}"?`)) {
      deleteMutation.mutate(game.id);
    }
  };

  return (
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
          <p className="mt-6 text-xl text-[var(--neon-cyan)]">Đang tải...</p>
        </div>
      )}

      {!isLoading && games && games.length === 0 && (
        <div className="text-center py-16 glass rounded-xl border border-[var(--neon-purple)]/30">
          <div className="text-8xl mb-6">🎮</div>
          <h3 className="text-2xl font-bold mb-3 text-[var(--neon-purple)]">Chưa có game nào</h3>
          <p className="text-gray-400 text-lg">Thêm game đầu tiên để bắt đầu!</p>
        </div>
      )}

      {!isLoading && games && games.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[var(--neon-cyan)]/30">
              <tr className="text-left">
                <th className="pb-4 pr-4 text-[var(--neon-cyan)] font-bold">Tên Game</th>
                <th className="pb-4 pr-4 text-[var(--neon-cyan)] font-bold">Đường dẫn Save</th>
                <th className="pb-4 pr-4 text-[var(--neon-cyan)] font-bold">Ngày tạo</th>
                <th className="pb-4 text-[var(--neon-cyan)] font-bold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr key={game.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-5 pr-4">
                    <div className="font-semibold text-white text-lg">{game.name}</div>
                    {game.description && (
                      <div className="text-sm text-gray-400 line-clamp-1 mt-1">{game.description}</div>
                    )}
                  </td>
                  <td className="py-5 pr-4 text-gray-400 text-sm font-mono">{game.save_file_path}</td>
                  <td className="py-5 pr-4 text-gray-400">
                    {new Date(game.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-5">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setDialogMode('view');
                          setSelectedGame(game);
                          setDialogOpen(true);
                        }}
                        className="p-2 text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10 rounded-lg transition-all"
                        title="Xem"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setDialogMode('edit');
                          setSelectedGame(game);
                          setDialogOpen(true);
                        }}
                        className="p-2 text-[var(--neon-green)] hover:bg-[var(--neon-green)]/10 rounded-lg transition-all"
                        title="Sửa"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(game)}
                        className="p-2 text-[var(--neon-pink)] hover:bg-[var(--neon-pink)]/10 rounded-lg transition-all"
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

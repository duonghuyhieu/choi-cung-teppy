'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { Game, DownloadLink, CreateDownloadLinkDto, ApiResponse } from '@/types';
import { useAuth } from '@/lib/auth/hooks';
import Navigation from '@/components/Navigation';
import { useDialog } from '@/lib/hooks/useDialog';
import Dialog from '@/components/Dialog';

async function fetchGameWithLinks(gameId: string): Promise<Game & { download_links: DownloadLink[] }> {
  const [gameRes, linksRes] = await Promise.all([
    fetch(`/api/games/${gameId}`),
    fetch(`/api/games/${gameId}/links`),
  ]);

  const gameData: ApiResponse<Game> = await gameRes.json();
  const linksData: ApiResponse<DownloadLink[]> = await linksRes.json();

  if (!gameData.success) throw new Error(gameData.error || 'Failed to fetch game');

  return {
    ...gameData.data!,
    download_links: linksData.success ? linksData.data || [] : [],
  };
}

async function addDownloadLink(gameId: string, linkData: Omit<CreateDownloadLinkDto, 'game_id'>): Promise<DownloadLink> {
  const response = await fetch(`/api/games/${gameId}/links`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(linkData),
  });
  const data: ApiResponse<DownloadLink> = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to add download link');
  return data.data!;
}

async function deleteDownloadLink(gameId: string, linkId: string): Promise<void> {
  const response = await fetch(`/api/games/${gameId}/links/${linkId}`, {
    method: 'DELETE',
  });
  const data: ApiResponse = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to delete download link');
}


export default function ManageGamePage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();
  const { dialogState, closeDialog, confirm } = useDialog();
  const gameId = params.id as string;

  const [showAddLink, setShowAddLink] = useState(false);
  const [linkFormData, setLinkFormData] = useState({
    title: '',
    url: '',
    platform: 'PC', // Default platform
  });
  const [error, setError] = useState('');

  const { data: game, isLoading } = useQuery({
    queryKey: ['game', gameId],
    queryFn: () => fetchGameWithLinks(gameId),
    enabled: !!user && user.role === 'admin',
  });

  const addLinkMutation = useMutation({
    mutationFn: (linkData: Omit<CreateDownloadLinkDto, 'game_id'>) => addDownloadLink(gameId, linkData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game', gameId] });
      setShowAddLink(false);
      setLinkFormData({ title: '', url: '', platform: 'PC' });
      setError('');
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: (linkId: string) => deleteDownloadLink(gameId, linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game', gameId] });
    },
  });


  // Check auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-2">Truy cập bị từ chối</h1>
          <p className="text-gray-400 mb-6">Bạn không có quyền truy cập trang này.</p>
          <Link href="/admin" className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors">
            Quay lại Admin
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-400">Đang tải game...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Game không tồn tại</h1>
            <Link href="/admin" className="text-blue-400 hover:text-blue-300">
              Quay lại Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleAddLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    addLinkMutation.mutate(linkFormData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin" className="text-blue-400 hover:text-blue-300 mb-4 inline-flex items-center gap-2">
            <ArrowLeft size={20} />
            Quay lại Admin
          </Link>
          <div>
            <h1 className="text-4xl font-bold mb-2">{game.name}</h1>
            <p className="text-gray-400">{game.description || 'Chưa có mô tả'}</p>
          </div>
        </div>

        {/* Download Links Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Link tải Game</h2>
            <button
              onClick={() => setShowAddLink(!showAddLink)}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              {showAddLink ? 'Hủy' : 'Thêm Link'}
            </button>
          </div>

          {/* Add Link Form */}
          {showAddLink && (
            <form onSubmit={handleAddLinkSubmit} className="mb-6 p-4 bg-gray-700 rounded-lg space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tên Link
                  </label>
                  <input
                    type="text"
                    value={linkFormData.title}
                    onChange={(e) => setLinkFormData({ ...linkFormData, title: e.target.value })}
                    placeholder="Part 1, Part 2, Main Game..."
                    className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Platform <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={linkFormData.platform}
                    onChange={(e) => setLinkFormData({ ...linkFormData, platform: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="PC">PC</option>
                    <option value="Steam">Steam</option>
                    <option value="GOG">GOG</option>
                    <option value="Epic">Epic Games</option>
                    <option value="Torrent">Torrent</option>
                    <option value="Other">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={linkFormData.url}
                    onChange={(e) => setLinkFormData({ ...linkFormData, url: e.target.value })}
                    required
                    placeholder="https://drive.google.com/..."
                    className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={addLinkMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-3 rounded-lg font-bold transition-colors"
              >
                {addLinkMutation.isPending ? 'Đang thêm...' : 'Thêm Link'}
              </button>
            </form>
          )}

          {/* Links List */}
          {game.download_links.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>Chưa có link tải nào. Thêm link đầu tiên!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {game.download_links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{link.title}</h3>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300 break-all"
                    >
                      {link.url}
                    </a>
                  </div>
                  <button
                    onClick={() => {
                      confirm(
                        `Bạn có chắc muốn xóa link "${link.title}"?`,
                        () => {
                          deleteLinkMutation.mutate(link.id);
                        }
                      );
                    }}
                    disabled={deleteLinkMutation.isPending}
                    className="ml-4 p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 disabled:text-gray-500 rounded transition-colors"
                    title="Xóa link"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialog */}
      <Dialog
        isOpen={dialogState.isOpen}
        onClose={closeDialog}
        title={dialogState.title}
        message={dialogState.message}
        type={dialogState.type}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        onConfirm={dialogState.onConfirm}
        onCancel={dialogState.onCancel}
      />
    </div>
  );
}

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Download, Eye } from 'lucide-react';
import { ApiResponse } from '@/types';

interface SaveFileWithDetails {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  description: string | null;
  is_public: boolean;
  created_at: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
  game: {
    id: string;
    name: string;
  };
}

async function fetchSaves(): Promise<SaveFileWithDetails[]> {
  const token = localStorage.getItem('auth-token');
  const response = await fetch('/api/admin/saves', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data: ApiResponse<SaveFileWithDetails[]> = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch saves');
  return data.data || [];
}

async function deleteSave(saveId: string): Promise<void> {
  const token = localStorage.getItem('auth-token');
  const response = await fetch(`/api/admin/saves/${saveId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data: ApiResponse = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to delete save');
}

export default function AdminSavesTab() {
  const queryClient = useQueryClient();

  const { data: saves, isLoading } = useQuery({
    queryKey: ['admin-saves'],
    queryFn: fetchSaves,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-saves'] });
    },
  });

  const handleDelete = (save: SaveFileWithDetails) => {
    if (window.confirm(`Bạn có chắc muốn xóa save file "${save.file_name}"?`)) {
      deleteMutation.mutate(save.id);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="glass-strong rounded-2xl p-8 border border-white/10">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-[var(--neon-cyan)]">Save Files Công khai</h2>
        <div className="text-gray-400">
          Tổng: <span className="text-white font-bold">{saves?.length || 0}</span> files
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-[var(--neon-cyan)] border-r-[var(--neon-magenta)]"></div>
          <p className="mt-6 text-xl text-[var(--neon-cyan)]">Đang tải...</p>
        </div>
      )}

      {!isLoading && saves && saves.length === 0 && (
        <div className="text-center py-16 glass rounded-xl border border-[var(--neon-purple)]/30">
          <div className="text-8xl mb-6">💾</div>
          <h3 className="text-2xl font-bold mb-3 text-[var(--neon-purple)]">Chưa có save file công khai</h3>
          <p className="text-gray-400 text-lg">Người dùng chưa chia sẻ save file nào</p>
        </div>
      )}

      {!isLoading && saves && saves.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[var(--neon-cyan)]/30">
              <tr className="text-left">
                <th className="pb-4 pr-4 text-[var(--neon-cyan)] font-bold">File</th>
                <th className="pb-4 pr-4 text-[var(--neon-cyan)] font-bold">Game</th>
                <th className="pb-4 pr-4 text-[var(--neon-cyan)] font-bold">Người tải lên</th>
                <th className="pb-4 pr-4 text-[var(--neon-cyan)] font-bold">Kích thước</th>
                <th className="pb-4 pr-4 text-[var(--neon-cyan)] font-bold">Ngày tạo</th>
                <th className="pb-4 text-[var(--neon-cyan)] font-bold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {saves.map((save) => (
                <tr key={save.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-5 pr-4">
                    <div className="font-semibold text-white">{save.file_name}</div>
                    {save.description && (
                      <div className="text-sm text-gray-400 line-clamp-1 mt-1">{save.description}</div>
                    )}
                  </td>
                  <td className="py-5 pr-4 text-gray-300">{save.game.name}</td>
                  <td className="py-5 pr-4">
                    <div className="text-white">{save.user.username}</div>
                    <div className="text-xs text-gray-400">{save.user.email}</div>
                  </td>
                  <td className="py-5 pr-4 text-gray-400">{formatFileSize(save.file_size)}</td>
                  <td className="py-5 pr-4 text-gray-400">
                    {new Date(save.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-5">
                    <div className="flex gap-2">
                      <a
                        href={save.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10 rounded-lg transition-all"
                        title="Xem"
                      >
                        <Eye size={18} />
                      </a>
                      <a
                        href={save.file_url}
                        download
                        className="p-2 text-[var(--neon-green)] hover:bg-[var(--neon-green)]/10 rounded-lg transition-all"
                        title="Tải xuống"
                      >
                        <Download size={18} />
                      </a>
                      <button
                        onClick={() => handleDelete(save)}
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
    </div>
  );
}

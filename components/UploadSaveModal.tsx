'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UploadSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
  gameName: string;
}

export default function UploadSaveModal({
  isOpen,
  onClose,
  gameId,
  gameName,
}: UploadSaveModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Vui lòng chọn file');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);
      formData.append('description', description);
      formData.append('isPublic', isPublic.toString());

      const response = await fetch(`/api/games/${gameId}/saves`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Upload thất bại');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gameSaves', gameId] });
      queryClient.invalidateQueries({ queryKey: ['mySaves'] });
      handleClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    uploadMutation.mutate();
  };

  const handleClose = () => {
    setFile(null);
    setDescription('');
    setIsPublic(false);
    uploadMutation.reset();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="relative bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">📤 Upload Save File</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors text-3xl leading-none w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-700"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <p className="text-gray-300 mb-4">
              Game: <span className="text-[var(--neon-cyan)] font-semibold">{gameName}</span>
            </p>
          </div>

          {/* File Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Chọn file save *
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[var(--neon-cyan)] file:text-gray-900 hover:file:bg-[var(--neon-cyan)]/90 cursor-pointer"
              required
            />
            {file && (
              <p className="mt-2 text-sm text-gray-400">
                📁 {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Mô tả (tùy chọn)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Full progress, level 100, all items unlocked..."
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:border-[var(--neon-cyan)] focus:outline-none resize-none"
              rows={3}
            />
          </div>

          {/* Public Toggle */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-700 bg-gray-900 text-[var(--neon-cyan)] focus:ring-[var(--neon-cyan)] focus:ring-offset-0 cursor-pointer"
            />
            <label htmlFor="isPublic" className="flex-1 cursor-pointer">
              <div className="text-sm font-semibold text-white">Công khai save file</div>
              <div className="text-xs text-gray-400 mt-1">
                Người khác có thể xem và tải save của bạn
              </div>
            </label>
          </div>

          {/* Error Message */}
          {uploadMutation.isError && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500">
              <p className="text-red-400 text-sm">
                ❌ {(uploadMutation.error as Error).message}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={uploadMutation.isPending}
              className="flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-300 glass border border-white/10 hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={uploadMutation.isPending || !file}
              className="flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-300 bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {uploadMutation.isPending ? '⏳ Đang upload...' : '📤 Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

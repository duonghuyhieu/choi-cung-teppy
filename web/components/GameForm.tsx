'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Game, CreateGameDto, UpdateGameDto } from '@/types';

interface LinkFormData {
  id?: string;
  title: string;
  url: string;
}

interface GameFormProps {
  mode: 'create' | 'edit' | 'view';
  game?: Game;
  gameId?: string;
  onSubmit: (data: CreateGameDto | UpdateGameDto, links?: LinkFormData[]) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export default function GameForm({ mode, game, gameId, onSubmit, onCancel, isLoading }: GameFormProps) {
  const [formData, setFormData] = useState<CreateGameDto | UpdateGameDto>({
    name: '',
    description: '',
    thumbnail_url: '',
    save_file_path: '',
  });
  const [error, setError] = useState('');
  const [links, setLinks] = useState<LinkFormData[]>([]);
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLink, setNewLink] = useState<LinkFormData>({ title: '', url: '' });

  // Load game data when editing or viewing
  useEffect(() => {
    if ((mode === 'edit' || mode === 'view') && game) {
      setFormData({
        name: game.name,
        description: game.description || '',
        thumbnail_url: game.thumbnail_url || '',
        save_file_path: game.save_file_path,
      });
    }
  }, [mode, game]);

  // Load links when editing or viewing
  useEffect(() => {
    if ((mode === 'edit' || mode === 'view') && gameId) {
      fetch(`/api/games/${gameId}/links`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setLinks(data.data.map((link: any) => ({ id: link.id, title: link.title, url: link.url })));
          }
        })
        .catch(err => console.error('Failed to load links:', err));
    }
  }, [mode, gameId]);

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLink.title || !newLink.url) return;

    // Add to local state for both create and edit modes
    setLinks([...links, newLink]);
    setNewLink({ title: '', url: '' });
    setShowAddLink(false);
  };

  const handleDeleteLink = async (index: number) => {
    // Remove from local state for both create and edit modes
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Pass links for both create and edit modes
      await onSubmit(formData, links);

      // Reset form only in create mode
      if (mode === 'create') {
        setFormData({
          name: '',
          description: '',
          thumbnail_url: '',
          save_file_path: '',
        });
        setLinks([]);
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">
        {mode === 'create' ? 'Thêm Game Mới' : mode === 'edit' ? 'Sửa Thông Tin Game' : 'Chi tiết Game'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Tên Game {!isReadOnly && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required={!isReadOnly}
              disabled={isReadOnly}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="Cyberpunk 2077"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Save File Path {!isReadOnly && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={formData.save_file_path || ''}
              onChange={(e) => setFormData({ ...formData, save_file_path: e.target.value })}
              required={!isReadOnly}
              disabled={isReadOnly}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="%APPDATA%/GameName/saves/*.sav"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Mô tả</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            disabled={isReadOnly}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 h-24 disabled:opacity-60 disabled:cursor-not-allowed"
            placeholder="Mô tả ngắn về game..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Thumbnail URL</label>
          <input
            type="url"
            value={formData.thumbnail_url || ''}
            onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
            disabled={isReadOnly}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Download Links Section */}
        <div className="border-t border-gray-700 pt-4">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium">Link tải Game</label>
            {!isReadOnly && (
              <button
                type="button"
                onClick={() => setShowAddLink(!showAddLink)}
                className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded flex items-center gap-1"
              >
                <Plus size={16} />
                {showAddLink ? 'Hủy' : 'Thêm Link'}
              </button>
            )}
          </div>

          {showAddLink && !isReadOnly && (
            <div className="mb-3 p-3 bg-gray-700 rounded-lg space-y-2">
              <input
                type="text"
                value={newLink.title}
                onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                placeholder="Tên link (Part 1, Part 2...)"
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded focus:outline-none focus:border-blue-500 text-sm"
              />
              <input
                type="url"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                placeholder="URL (https://drive.google.com/...)"
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded focus:outline-none focus:border-blue-500 text-sm"
              />
              <button
                type="button"
                onClick={handleAddLink}
                className="w-full bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm font-medium"
              >
                Thêm
              </button>
            </div>
          )}

          {links.length > 0 ? (
            <div className="space-y-2">
              {links.map((link, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-700 rounded text-sm">
                  <div className="flex-1 truncate">
                    <div className="font-medium">{link.title}</div>
                    <div className="text-xs text-gray-400 truncate">{link.url}</div>
                  </div>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => handleDeleteLink(index)}
                      className="ml-2 p-1 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Chưa có link tải</p>
          )}
        </div>

        {!isReadOnly ? (
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-3 rounded-lg font-bold transition-colors"
            >
              {isLoading
                ? (mode === 'create' ? 'Đang tạo...' : 'Đang lưu...')
                : (mode === 'create' ? 'Tạo Game' : 'Lưu thay đổi')
              }
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition-colors"
              >
                Hủy
              </button>
            )}
          </div>
        ) : (
          onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition-colors"
            >
              Đóng
            </button>
          )
        )}
      </form>
    </div>
  );
}

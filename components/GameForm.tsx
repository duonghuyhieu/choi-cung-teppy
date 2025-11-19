'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Key } from 'lucide-react';
import { Game, CreateGameDto, UpdateGameDto, GameAccountType } from '@/types';

interface LinkFormData {
  id?: string;
  title: string;
  url: string;
}

interface AccountFormData {
  id?: string;
  type: GameAccountType;
  username: string;
  password: string;
  guard_link: string;
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
    game_type: 'crack',
  });
  const [error, setError] = useState('');
  const [links, setLinks] = useState<LinkFormData[]>([]);
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLink, setNewLink] = useState<LinkFormData>({ title: '', url: '' });
  
  // Steam Accounts state
  const [accounts, setAccounts] = useState<AccountFormData[]>([]);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccount, setNewAccount] = useState<AccountFormData>({
    type: 'steam_offline',
    username: '',
    password: '',
    guard_link: '',
  });

  // Load game data when editing or viewing
  useEffect(() => {
    if ((mode === 'edit' || mode === 'view') && game) {
      setFormData({
        name: game.name,
        description: game.description || '',
        thumbnail_url: game.thumbnail_url || '',
        save_file_path: game.save_file_path,
        game_type: game.game_type || 'crack',
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

  // Load accounts when editing or viewing (only for Steam games)
  useEffect(() => {
    if ((mode === 'edit' || mode === 'view') && gameId && game?.game_type !== 'crack') {
      fetch(`/api/games/${gameId}/accounts`)
        .then(res => res.json())
        .then(async data => {
          if (data.success && data.data) {
            // Fetch full account details
            const fullAccounts = await Promise.all(
              data.data.map(async (status: any) => {
                const accountRes = await fetch(`/api/accounts/${status.id}`);
                const accountData = await accountRes.json();
                return accountData.data;
              })
            );
            setAccounts(fullAccounts.map((acc: any) => ({
              id: acc.id,
              type: acc.type,
              username: acc.username,
              password: acc.password,
              guard_link: acc.guard_link || '',
            })));
          }
        })
        .catch(err => console.error('Failed to load accounts:', err));
    }
  }, [mode, gameId, game?.game_type]);

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

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccount.username || !newAccount.password) return;

    setAccounts([...accounts, newAccount]);
    setNewAccount({
      type: 'steam_offline',
      username: '',
      password: '',
      guard_link: '',
    });
    setShowAddAccount(false);
  };

  const handleDeleteAccount = async (index: number) => {
    const account = accounts[index];
    
    // If editing and account has ID, delete from server
    if (mode === 'edit' && account.id && gameId) {
      if (!confirm('Xóa tài khoản này?')) return;
      
      try {
        const res = await fetch(`/api/accounts/${account.id}`, {
          method: 'DELETE',
        });
        
        if (!res.ok) {
          throw new Error('Failed to delete account');
        }
      } catch (err) {
        alert('Lỗi khi xóa tài khoản');
        return;
      }
    }
    
    setAccounts(accounts.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Pass links for both create and edit modes
      await onSubmit(formData, links);

      // If Steam game, save accounts
      if (formData.game_type !== 'crack' && accounts.length > 0) {
        // Get the game ID (either from props or from the created game)
        const targetGameId = gameId || (await getLastCreatedGameId());
        
        if (targetGameId) {
          await saveAccounts(targetGameId);
        }
      }

      // Reset form only in create mode
      if (mode === 'create') {
        setFormData({
          name: '',
          description: '',
          thumbnail_url: '',
          save_file_path: '',
          game_type: 'crack',
        });
        setLinks([]);
        setAccounts([]);
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    }
  };

  const getLastCreatedGameId = async (): Promise<string | null> => {
    try {
      const res = await fetch('/api/games');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        return data.data[0].id; // Latest game
      }
    } catch (err) {
      console.error('Failed to get last game ID:', err);
    }
    return null;
  };

  const saveAccounts = async (targetGameId: string) => {
    for (const account of accounts) {
      // Skip if account already has ID (already saved)
      if (account.id) continue;

      try {
        await fetch(`/api/games/${targetGameId}/accounts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: account.type,
            username: account.username,
            password: account.password,
            guard_link: account.guard_link || undefined,
          }),
        });
      } catch (err) {
        console.error('Failed to save account:', err);
      }
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
              Loại Game {!isReadOnly && <span className="text-red-500">*</span>}
            </label>
            <select
              value={formData.game_type || 'crack'}
              onChange={(e) => setFormData({ ...formData, game_type: e.target.value as any })}
              disabled={isReadOnly}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="crack">Crack</option>
              <option value="steam_offline">Steam Offline</option>
              <option value="steam_online">Steam Online</option>
            </select>
          </div>
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

        {/* Steam Accounts Section - Only show for Steam games */}
        {(formData.game_type === 'steam_offline' || formData.game_type === 'steam_online') && (
          <div className="border-t border-gray-700 pt-4">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium flex items-center gap-2">
                <Key size={16} />
                Tài khoản Steam
              </label>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => setShowAddAccount(!showAddAccount)}
                  className="text-sm bg-green-700 hover:bg-green-600 px-3 py-1 rounded flex items-center gap-1"
                >
                  <Plus size={16} />
                  {showAddAccount ? 'Hủy' : 'Thêm Account'}
                </button>
              )}
            </div>

            {showAddAccount && !isReadOnly && (
              <div className="mb-3 p-3 bg-gray-700 rounded-lg space-y-2">
                <select
                  value={newAccount.type}
                  onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value as GameAccountType })}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded focus:outline-none focus:border-blue-500 text-sm"
                >
                  <option value="steam_offline">Steam Offline</option>
                  <option value="steam_online">Steam Online</option>
                </select>
                <input
                  type="text"
                  value={newAccount.username}
                  onChange={(e) => setNewAccount({ ...newAccount, username: e.target.value })}
                  placeholder="Username"
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded focus:outline-none focus:border-blue-500 text-sm"
                />
                <input
                  type="text"
                  value={newAccount.password}
                  onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                  placeholder="Password"
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded focus:outline-none focus:border-blue-500 text-sm"
                />
                <input
                  type="url"
                  value={newAccount.guard_link}
                  onChange={(e) => setNewAccount({ ...newAccount, guard_link: e.target.value })}
                  placeholder="Guard Link (optional)"
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded focus:outline-none focus:border-blue-500 text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddAccount}
                  className="w-full bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm font-medium"
                >
                  Thêm Account
                </button>
              </div>
            )}

            {accounts.length > 0 ? (
              <div className="space-y-2">
                {accounts.map((account, index) => (
                  <div key={index} className="flex items-start justify-between p-3 bg-gray-700 rounded text-sm">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{account.username}</span>
                        <span className={`px-2 py-0.5 text-xs rounded ${
                          account.type === 'steam_offline' 
                            ? 'bg-blue-500/20 text-blue-400' 
                            : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {account.type === 'steam_offline' ? 'Offline' : 'Online'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        Password: {account.password}
                      </div>
                      {account.guard_link && (
                        <div className="text-xs text-gray-400 truncate">
                          Guard: <a href={account.guard_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Link</a>
                        </div>
                      )}
                    </div>
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => handleDeleteAccount(index)}
                        className="ml-2 p-1 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Chưa có tài khoản Steam</p>
            )}
          </div>
        )}

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

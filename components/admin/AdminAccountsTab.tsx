'use client';

import { useState, useEffect } from 'react';
import { GameAccountWithUser, Game, GameAccountType } from '@/types';
import { useDialog } from '@/lib/hooks/useDialog';
import Dialog from '@/components/Dialog';

interface GameAccountWithGame extends GameAccountWithUser {
  game?: {
    id: string;
    name: string;
  };
}

interface AdminAccountsTabProps {
  games: Game[];
}

type TabType = 'steam_offline' | 'steam_online';

export default function AdminAccountsTab({ games }: AdminAccountsTabProps) {
  const { dialogState, closeDialog, confirm, success, error } = useDialog();
  const [activeTab, setActiveTab] = useState<TabType>('steam_offline');
  const [accounts, setAccounts] = useState<GameAccountWithGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<GameAccountWithGame | null>(null);
  const [formData, setFormData] = useState({
    game_id: '',
    type: 'steam_offline' as GameAccountType,
    username: '',
    password: '',
    guard_link: '',
  });

  // Filter only Steam games
  const steamGames = games.filter((g) => {
    if (Array.isArray(g.game_type)) {
      return g.game_type.includes('steam_offline') || g.game_type.includes('steam_online');
    }
    return g.game_type === 'steam_offline' || g.game_type === 'steam_online';
  });

  useEffect(() => {
    loadAccounts();
  }, [activeTab]);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/accounts?type=${activeTab}`);
      const data = await res.json();

      if (data.success) {
        setAccounts(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load accounts:', err);
      error('Không thể tải danh sách tài khoản');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.game_id) {
      error('Vui lòng chọn game');
      return;
    }

    try {
      const res = await fetch(`/api/games/${formData.game_id}/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formData.type,
          username: formData.username,
          password: formData.password,
          guard_link: formData.guard_link,
        }),
      });

      const data = await res.json();

      if (data.success) {
        success('Tài khoản đã được tạo thành công!');
        setShowForm(false);
        setFormData({
          game_id: '',
          type: activeTab,
          username: '',
          password: '',
          guard_link: '',
        });
        loadAccounts();
      } else {
        error(data.error || 'Không thể tạo tài khoản');
      }
    } catch (err) {
      console.error('Failed to create account:', err);
      error('Không thể tạo tài khoản');
    }
  };

  const handleEdit = (account: GameAccountWithGame) => {
    setEditingAccount(account);
    setFormData({
      game_id: account.game_id,
      type: account.type,
      username: account.username,
      password: account.password,
      guard_link: account.guard_link || '',
    });
    setShowForm(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

    try {
      const res = await fetch(`/api/accounts/${editingAccount.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formData.type,
          username: formData.username,
          password: formData.password,
          guard_link: formData.guard_link,
        }),
      });

      const data = await res.json();

      if (data.success) {
        success('Tài khoản đã được cập nhật thành công!');
        setEditingAccount(null);
        setFormData({
          game_id: '',
          type: activeTab,
          username: '',
          password: '',
          guard_link: '',
        });
        loadAccounts();
      } else {
        error(data.error || 'Không thể cập nhật tài khoản');
      }
    } catch (err) {
      console.error('Failed to update account:', err);
      error('Không thể cập nhật tài khoản');
    }
  };

  const handleDelete = async (accountId: string) => {
    confirm(
      'Bạn có chắc muốn xóa tài khoản này?',
      async () => {
        try {
          const res = await fetch(`/api/accounts/${accountId}`, {
            method: 'DELETE',
          });

          const data = await res.json();

          if (data.success) {
            success('Tài khoản đã được xóa thành công!');
            loadAccounts();
          } else {
            error(data.error || 'Không thể xóa tài khoản');
          }
        } catch (err) {
          console.error('Failed to delete account:', err);
          error('Không thể xóa tài khoản');
        }
      }
    );
  };

  return (
    <div className="glass-strong rounded-2xl p-8 border border-white/10">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-[var(--neon-cyan)]">Quản lý Tài khoản Steam</h2>
        <div className="text-gray-400">
          Tổng: <span className="text-white font-bold">{accounts.length}</span> tài khoản
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => {
            setActiveTab('steam_offline');
            setShowForm(false);
            setEditingAccount(null);
          }}
          className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
            activeTab === 'steam_offline'
              ? 'bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] shadow-[0_0_15px_rgba(0,240,255,0.4)]'
              : 'glass border border-white/20 text-gray-400 hover:text-white'
          }`}
        >
          🔵 Steam Offline
        </button>
        <button
          onClick={() => {
            setActiveTab('steam_online');
            setShowForm(false);
            setEditingAccount(null);
          }}
          className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
            activeTab === 'steam_online'
              ? 'bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-magenta)] shadow-[0_0_15px_rgba(168,85,247,0.4)]'
              : 'glass border border-white/20 text-gray-400 hover:text-white'
          }`}
        >
          🟣 Steam Online
        </button>
      </div>

      <div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingAccount(null);
            setFormData({
              game_id: '',
              type: activeTab,
              username: '',
              password: '',
              guard_link: '',
            });
          }}
          className="mb-6 px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:scale-[1.02] active:scale-95"
        >
          {showForm ? '✕ Hủy' : '➕ Thêm Tài khoản'}
        </button>

        {/* Add Account Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="glass rounded-xl p-6 border border-white/20 mb-6 space-y-4">
            <h3 className="text-xl font-bold text-[var(--neon-cyan)] mb-4">
              ➕ Thêm Tài khoản {activeTab === 'steam_offline' ? '🔵 Steam Offline' : '🟣 Steam Online'}
            </h3>

            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--neon-cyan)]">
                Chọn Game <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.game_id}
                onChange={(e) => setFormData({ ...formData, game_id: e.target.value })}
                className="w-full px-4 py-3 glass rounded-xl border border-white/20 focus:outline-none focus:border-[var(--neon-cyan)] focus:shadow-[0_0_15px_var(--neon-cyan)] transition-all text-white"
                required
              >
                <option value="">-- Chọn game --</option>
                {steamGames.map((game) => (
                  <option key={game.id} value={game.id}>
                    {game.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--neon-cyan)]">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 glass rounded-xl border border-white/20 focus:outline-none focus:border-[var(--neon-cyan)] focus:shadow-[0_0_15px_var(--neon-cyan)] transition-all text-white placeholder-gray-400"
                placeholder="Nhập username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--neon-cyan)]">Password</label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 glass rounded-xl border border-white/20 focus:outline-none focus:border-[var(--neon-cyan)] focus:shadow-[0_0_15px_var(--neon-cyan)] transition-all text-white placeholder-gray-400"
                placeholder="Nhập password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--neon-cyan)]">
                Guard Link (Tùy chọn)
              </label>
              <input
                type="url"
                value={formData.guard_link}
                onChange={(e) => setFormData({ ...formData, guard_link: e.target.value })}
                className="w-full px-4 py-3 glass rounded-xl border border-white/20 focus:outline-none focus:border-[var(--neon-cyan)] focus:shadow-[0_0_15px_var(--neon-cyan)] transition-all text-white placeholder-gray-400"
                placeholder="https://..."
              />
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 rounded-xl font-bold transition-all duration-300 bg-gradient-to-r from-[var(--neon-green)] to-[var(--neon-cyan)] hover:shadow-[0_0_15px_rgba(0,255,157,0.4)] hover:scale-[1.02] active:scale-95"
            >
              ✓ Tạo Tài khoản
            </button>
          </form>
        )}

        {/* Edit Account Form */}
        {editingAccount && (
          <form onSubmit={handleUpdate} className="glass rounded-xl p-6 border border-[var(--neon-purple)]/30 mb-6 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[var(--neon-purple)]">
                ✏️ Chỉnh sửa Tài khoản - {editingAccount.game?.name}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingAccount(null);
                  setFormData({
                    game_id: '',
                    type: activeTab,
                    username: '',
                    password: '',
                    guard_link: '',
                  });
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--neon-purple)]">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 glass rounded-xl border border-white/20 focus:outline-none focus:border-[var(--neon-purple)] focus:shadow-[0_0_15px_var(--neon-purple)] transition-all text-white placeholder-gray-400"
                placeholder="Nhập username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--neon-purple)]">Password</label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 glass rounded-xl border border-white/20 focus:outline-none focus:border-[var(--neon-purple)] focus:shadow-[0_0_15px_var(--neon-purple)] transition-all text-white placeholder-gray-400"
                placeholder="Nhập password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--neon-purple)]">
                Guard Link (Tùy chọn)
              </label>
              <input
                type="url"
                value={formData.guard_link}
                onChange={(e) => setFormData({ ...formData, guard_link: e.target.value })}
                className="w-full px-4 py-3 glass rounded-xl border border-white/20 focus:outline-none focus:border-[var(--neon-purple)] focus:shadow-[0_0_15px_var(--neon-purple)] transition-all text-white placeholder-gray-400"
                placeholder="https://..."
              />
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 rounded-xl font-bold transition-all duration-300 bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-magenta)] hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:scale-[1.02] active:scale-95"
            >
              ✓ Cập nhật Tài khoản
            </button>
          </form>
        )}

          {/* Accounts List */}
          <div>
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-[var(--neon-cyan)] border-r-[var(--neon-magenta)]"></div>
                <p className="mt-6 text-xl text-[var(--neon-cyan)]">Đang tải...</p>
              </div>
            ) : accounts.length === 0 ? (
              <div className="text-center py-16 glass rounded-xl border border-[var(--neon-purple)]/30">
                <div className="text-8xl mb-6">🎮</div>
                <h3 className="text-2xl font-bold mb-3 text-[var(--neon-purple)]">Chưa có tài khoản nào</h3>
                <p className="text-gray-400 text-lg">Thêm tài khoản đầu tiên cho game này!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="glass rounded-xl p-5 border border-white/10 hover:border-[var(--neon-cyan)]/50 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {account.type === 'steam_online' ? '🟣' : '🔵'}
                        </span>
                        <div>
                          <p className="font-bold text-white text-lg">{account.username}</p>
                          <p className="text-xs text-gray-400">
                            {account.game?.name || 'Unknown Game'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400">🔑</span>
                        <span className="text-gray-300 font-mono">{account.password}</span>
                      </div>

                      {account.guard_link && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-400">🛡️</span>
                          <a
                            href={account.guard_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--neon-cyan)] hover:text-[var(--neon-purple)] transition-colors truncate"
                          >
                            Guard Link
                          </a>
                        </div>
                      )}

                      {account.type === 'steam_online' && account.in_use_by && (
                        <div className="mt-3 p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                          <p className="text-xs text-orange-400">
                            ⏱️ Đang dùng: {account.user?.username || 'Unknown'}
                          </p>
                          <p className="text-xs text-orange-400">
                            Đến: {new Date(account.in_use_until!).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(account)}
                        className="flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:scale-[1.02] active:scale-95"
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(account.id)}
                        className="flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 bg-gradient-to-r from-[var(--neon-pink)] to-[var(--neon-magenta)] hover:shadow-[0_0_15px_rgba(255,0,110,0.4)] hover:scale-[1.02] active:scale-95"
                      >
                        🗑️ Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      {/* Confirm Dialog */}
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

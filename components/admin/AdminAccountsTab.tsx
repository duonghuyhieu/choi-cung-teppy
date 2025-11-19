'use client';

import { useState, useEffect } from 'react';
import { GameAccountWithUser, Game, GameAccountType } from '@/types';

interface AdminAccountsTabProps {
  games: Game[];
}

export default function AdminAccountsTab({ games }: AdminAccountsTabProps) {
  const [selectedGameId, setSelectedGameId] = useState<string>('');
  const [accounts, setAccounts] = useState<GameAccountWithUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'steam_offline' as GameAccountType,
    username: '',
    password: '',
    guard_link: '',
  });

  // Filter only Steam games
  const steamGames = games.filter(
    (g) => g.game_type === 'steam_offline' || g.game_type === 'steam_online'
  );

  useEffect(() => {
    if (selectedGameId) {
      loadAccounts();
    }
  }, [selectedGameId]);

  const loadAccounts = async () => {
    if (!selectedGameId) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/games/${selectedGameId}/accounts`);
      const data = await res.json();

      if (data.success) {
        // Fetch full account details
        const fullAccounts = await Promise.all(
          data.data.map(async (status: any) => {
            const accountRes = await fetch(`/api/accounts/${status.id}`);
            const accountData = await accountRes.json();
            return accountData.data;
          })
        );
        setAccounts(fullAccounts);
      }
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGameId) return;

    try {
      const res = await fetch(`/api/games/${selectedGameId}/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        alert('Account created successfully!');
        setShowForm(false);
        setFormData({
          type: 'steam_offline',
          username: '',
          password: '',
          guard_link: '',
        });
        loadAccounts();
      } else {
        alert(data.error || 'Failed to create account');
      }
    } catch (error) {
      console.error('Failed to create account:', error);
      alert('Failed to create account');
    }
  };

  const handleDelete = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return;

    try {
      const res = await fetch(`/api/accounts/${accountId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        alert('Account deleted successfully!');
        loadAccounts();
      } else {
        alert(data.error || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Game Accounts</h2>
      </div>

      {/* Game Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Select Game</label>
        <select
          value={selectedGameId}
          onChange={(e) => setSelectedGameId(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        >
          <option value="">-- Select a Steam game --</option>
          {steamGames.map((game) => (
            <option key={game.id} value={game.id}>
              {game.name} ({game.game_type})
            </option>
          ))}
        </select>
      </div>

      {selectedGameId && (
        <>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : 'Add Account'}
          </button>

          {/* Add Account Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as GameAccountType })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                >
                  <option value="steam_offline">Steam Offline</option>
                  <option value="steam_online">Steam Online</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Guard Link (Optional)
                </label>
                <input
                  type="url"
                  value={formData.guard_link}
                  onChange={(e) => setFormData({ ...formData, guard_link: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="https://..."
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create Account
              </button>
            </form>
          )}

          {/* Accounts List */}
          <div className="space-y-4">
            {loading ? (
              <p>Loading accounts...</p>
            ) : accounts.length === 0 ? (
              <p className="text-gray-500">No accounts found for this game.</p>
            ) : (
              accounts.map((account) => (
                <div key={account.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-semibold">{account.username}</p>
                      <p className="text-sm text-gray-600">
                        Type: <span className="font-medium">{account.type}</span>
                      </p>
                      <p className="text-sm text-gray-600">Password: {account.password}</p>
                      {account.guard_link && (
                        <p className="text-sm text-gray-600">
                          Guard:{' '}
                          <a
                            href={account.guard_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Link
                          </a>
                        </p>
                      )}
                      {account.type === 'steam_online' && account.in_use_by && (
                        <p className="text-sm text-orange-600">
                          In use by: {account.user?.username || 'Unknown'} until{' '}
                          {new Date(account.in_use_until!).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

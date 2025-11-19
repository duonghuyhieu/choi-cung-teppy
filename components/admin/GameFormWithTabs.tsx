'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Key, Download } from 'lucide-react';
import { Game, GameAccountType } from '@/types';

type TabType = 'info' | 'crack' | 'steam_offline' | 'steam_online';

interface LinkFormData {
  id?: string;
  title: string;
  url: string;
  version_type: 'crack' | 'steam_offline' | 'steam_online';
}

interface AccountFormData {
  id?: string;
  type: GameAccountType;
  username: string;
  password: string;
  guard_link: string;
}

interface GameFormWithTabsProps {
  mode: 'create' | 'edit';
  game?: Game;
  gameId?: string;
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export default function GameFormWithTabs({
  mode,
  game,
  gameId,
  onSubmit,
  onCancel,
  isLoading
}: GameFormWithTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [error, setError] = useState('');

  // Tab 1: Thông tin chung
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    thumbnail_url: '',
    save_file_path: '',
  });

  // Tab 2-4: Links và Accounts cho từng phiên bản
  const [crackLinks, setCrackLinks] = useState<LinkFormData[]>([]);
  const [steamOfflineLinks, setSteamOfflineLinks] = useState<LinkFormData[]>([]);
  const [steamOnlineLinks, setSteamOnlineLinks] = useState<LinkFormData[]>([]);
  
  const [steamOfflineAccounts, setSteamOfflineAccounts] = useState<AccountFormData[]>([]);
  const [steamOnlineAccounts, setSteamOnlineAccounts] = useState<AccountFormData[]>([]);

  // Load data when editing
  useEffect(() => {
    if (mode === 'edit' && game) {
      setFormData({
        name: game.name,
        description: game.description || '',
        thumbnail_url: game.thumbnail_url || '',
        save_file_path: game.save_file_path,
      });
    }
  }, [mode, game]);

  // Load links and accounts when editing
  useEffect(() => {
    if (mode === 'edit' && gameId) {
      loadGameData();
    }
  }, [mode, gameId]);

  const loadGameData = async () => {
    // Load links
    try {
      const res = await fetch(`/api/games/${gameId}/links`);
      const data = await res.json();
      if (data.success && data.data) {
        // Separate links by version type
        const crack = data.data.filter((l: any) => l.version_type === 'crack');
        const offline = data.data.filter((l: any) => l.version_type === 'steam_offline');
        const online = data.data.filter((l: any) => l.version_type === 'steam_online');
        
        setCrackLinks(crack);
        setSteamOfflineLinks(offline);
        setSteamOnlineLinks(online);
      }
    } catch (err) {
      console.error('Failed to load links:', err);
    }

    // Load accounts
    try {
      const res = await fetch(`/api/games/${gameId}/accounts`);
      const data = await res.json();
      if (data.success && data.data) {
        const fullAccounts = await Promise.all(
          data.data.map(async (status: any) => {
            const accountRes = await fetch(`/api/accounts/${status.id}`);
            const accountData = await accountRes.json();
            return accountData.data;
          })
        );

        const offline = fullAccounts.filter((a: any) => a.type === 'steam_offline');
        const online = fullAccounts.filter((a: any) => a.type === 'steam_online');

        setSteamOfflineAccounts(offline.map((a: any) => ({
          id: a.id,
          type: a.type,
          username: a.username,
          password: a.password,
          guard_link: a.guard_link || '',
        })));

        setSteamOnlineAccounts(online.map((a: any) => ({
          id: a.id,
          type: a.type,
          username: a.username,
          password: a.password,
          guard_link: a.guard_link || '',
        })));
      }
    } catch (err) {
      console.error('Failed to load accounts:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Determine game_type based on what versions are available
      let game_type = 'crack';
      if (steamOnlineAccounts.length > 0 || steamOnlineLinks.length > 0) {
        game_type = 'steam_online';
      } else if (steamOfflineAccounts.length > 0 || steamOfflineLinks.length > 0) {
        game_type = 'steam_offline';
      }

      // Submit game info
      const allLinks = [...crackLinks, ...steamOfflineLinks, ...steamOnlineLinks];
      await onSubmit({ ...formData, game_type }, allLinks);

      // Save accounts
      const targetGameId = gameId || (await getLastCreatedGameId());
      if (targetGameId) {
        await saveAccounts(targetGameId, steamOfflineAccounts, steamOnlineAccounts);
      }

      if (mode === 'create') {
        // Reset form
        setFormData({
          name: '',
          description: '',
          thumbnail_url: '',
          save_file_path: '',
        });
        setCrackLinks([]);
        setSteamOfflineLinks([]);
        setSteamOnlineLinks([]);
        setSteamOfflineAccounts([]);
        setSteamOnlineAccounts([]);
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
        return data.data[0].id;
      }
    } catch (err) {
      console.error('Failed to get last game ID:', err);
    }
    return null;
  };

  const saveAccounts = async (
    targetGameId: string,
    offlineAccounts: AccountFormData[],
    onlineAccounts: AccountFormData[]
  ) => {
    const allAccounts = [...offlineAccounts, ...onlineAccounts];
    
    for (const account of allAccounts) {
      if (account.id) continue; // Skip existing accounts

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

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">
        {mode === 'create' ? 'Thêm Game Mới' : 'Sửa Thông Tin Game'}
      </h2>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-700">
        <button
          type="button"
          onClick={() => setActiveTab('info')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'info'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          📋 Thông tin chung
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('crack')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'crack'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          🎮 Crack
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('steam_offline')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'steam_offline'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          🔵 Steam Offline
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('steam_online')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'steam_online'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          🟣 Steam Online
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tab Content */}
        {activeTab === 'info' && (
          <InfoTab formData={formData} setFormData={setFormData} />
        )}

        {activeTab === 'crack' && (
          <VersionTab
            title="Phiên bản Crack"
            links={crackLinks}
            setLinks={setCrackLinks}
            versionType="crack"
          />
        )}

        {activeTab === 'steam_offline' && (
          <SteamVersionTab
            title="Phiên bản Steam Offline"
            links={steamOfflineLinks}
            setLinks={setSteamOfflineLinks}
            accounts={steamOfflineAccounts}
            setAccounts={setSteamOfflineAccounts}
            accountType="steam_offline"
            versionType="steam_offline"
            gameId={gameId}
            mode={mode}
          />
        )}

        {activeTab === 'steam_online' && (
          <SteamVersionTab
            title="Phiên bản Steam Online"
            links={steamOnlineLinks}
            setLinks={setSteamOnlineLinks}
            accounts={steamOnlineAccounts}
            setAccounts={setSteamOnlineAccounts}
            accountType="steam_online"
            versionType="steam_online"
            gameId={gameId}
            mode={mode}
          />
        )}

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4 border-t border-gray-700">
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
      </form>
    </div>
  );
}

// Sub-components for each tab
function InfoTab({ formData, setFormData }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Tên Game <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
          placeholder="Cyberpunk 2077"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Save File Path <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.save_file_path}
          onChange={(e) => setFormData({ ...formData, save_file_path: e.target.value })}
          required
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
          placeholder="%APPDATA%/GameName/saves/*.sav"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Mô tả</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 h-24"
          placeholder="Mô tả ngắn về game..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Thumbnail URL</label>
        <input
          type="url"
          value={formData.thumbnail_url}
          onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="bg-blue-500/10 border border-blue-500 text-blue-400 px-4 py-3 rounded-lg text-sm">
        💡 Sau khi điền thông tin chung, chuyển sang các tab khác để thêm link tải và tài khoản cho từng phiên bản.
      </div>
    </div>
  );
}

function VersionTab({ title, links, setLinks, versionType }: any) {
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLink, setNewLink] = useState({ title: '', url: '' });

  const handleAddLink = () => {
    if (!newLink.title || !newLink.url) return;
    setLinks([...links, { ...newLink, version_type: versionType }]);
    setNewLink({ title: '', url: '' });
    setShowAddLink(false);
  };

  const handleDeleteLink = (index: number) => {
    setLinks(links.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">{title}</h3>

      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium">Link tải Game</label>
        <button
          type="button"
          onClick={() => setShowAddLink(!showAddLink)}
          className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded flex items-center gap-1"
        >
          <Plus size={16} />
          {showAddLink ? 'Hủy' : 'Thêm Link'}
        </button>
      </div>

      {showAddLink && (
        <div className="p-3 bg-gray-700 rounded-lg space-y-2">
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
          {links.map((link: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-700 rounded text-sm">
              <div className="flex-1 truncate">
                <div className="font-medium">{link.title}</div>
                <div className="text-xs text-gray-400 truncate">{link.url}</div>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteLink(index)}
                className="ml-2 p-1 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">Chưa có link tải cho phiên bản này</p>
      )}
    </div>
  );
}

function SteamVersionTab({ title, links, setLinks, accounts, setAccounts, accountType, versionType, gameId, mode }: any) {
  const [showAddLink, setShowAddLink] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newLink, setNewLink] = useState({ title: '', url: '' });
  const [newAccount, setNewAccount] = useState({
    username: '',
    password: '',
    guard_link: '',
  });

  const handleAddLink = () => {
    if (!newLink.title || !newLink.url) return;
    setLinks([...links, { ...newLink, version_type: versionType }]);
    setNewLink({ title: '', url: '' });
    setShowAddLink(false);
  };

  const handleDeleteLink = (index: number) => {
    setLinks(links.filter((_: any, i: number) => i !== index));
  };

  const handleAddAccount = () => {
    if (!newAccount.username || !newAccount.password) return;
    setAccounts([...accounts, { ...newAccount, type: accountType }]);
    setNewAccount({ username: '', password: '', guard_link: '' });
    setShowAddAccount(false);
  };

  const handleDeleteAccount = async (index: number) => {
    const account = accounts[index];
    
    if (mode === 'edit' && account.id && gameId) {
      if (!confirm('Xóa tài khoản này?')) return;
      
      try {
        await fetch(`/api/accounts/${account.id}`, { method: 'DELETE' });
      } catch (err) {
        alert('Lỗi khi xóa tài khoản');
        return;
      }
    }
    
    setAccounts(accounts.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold">{title}</h3>

      {/* Accounts Section */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium flex items-center gap-2">
            <Key size={16} />
            Tài khoản Steam
          </label>
          <button
            type="button"
            onClick={() => setShowAddAccount(!showAddAccount)}
            className="text-sm bg-green-700 hover:bg-green-600 px-3 py-1 rounded flex items-center gap-1"
          >
            <Plus size={16} />
            {showAddAccount ? 'Hủy' : 'Thêm Account'}
          </button>
        </div>

        {showAddAccount && (
          <div className="mb-3 p-3 bg-gray-700 rounded-lg space-y-2">
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
          <div className="space-y-2 mb-6">
            {accounts.map((account: any, index: number) => (
              <div key={index} className="flex items-start justify-between p-3 bg-gray-700 rounded text-sm">
                <div className="flex-1">
                  <div className="font-medium mb-1">{account.username}</div>
                  <div className="text-xs text-gray-400">Password: {account.password}</div>
                  {account.guard_link && (
                    <div className="text-xs text-gray-400 truncate">
                      Guard: <a href={account.guard_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Link</a>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteAccount(index)}
                  className="ml-2 p-1 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 mb-6">Chưa có tài khoản Steam</p>
        )}
      </div>

      {/* Links Section */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium flex items-center gap-2">
            <Download size={16} />
            Link tải Game
          </label>
          <button
            type="button"
            onClick={() => setShowAddLink(!showAddLink)}
            className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded flex items-center gap-1"
          >
            <Plus size={16} />
            {showAddLink ? 'Hủy' : 'Thêm Link'}
          </button>
        </div>

        {showAddLink && (
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
            {links.map((link: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-700 rounded text-sm">
                <div className="flex-1 truncate">
                  <div className="font-medium">{link.title}</div>
                  <div className="text-xs text-gray-400 truncate">{link.url}</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteLink(index)}
                  className="ml-2 p-1 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Chưa có link tải cho phiên bản này</p>
        )}
      </div>
    </div>
  );
}

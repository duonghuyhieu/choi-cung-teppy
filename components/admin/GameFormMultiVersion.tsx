'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Key, Download } from 'lucide-react';
import { Game, GameAccountType } from '@/types';
import { useDialog } from '@/lib/hooks/useDialog';
import Dialog from '@/components/Dialog';

type TabType = 'info' | 'game_types';
type GameTypeTab = 'crack' | 'steam_offline' | 'steam_online';

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

interface GameFormMultiVersionProps {
    mode: 'create' | 'edit';
    game?: Game;
    gameId?: string;
    onSubmit: (data: any) => Promise<void>;
    onCancel?: () => void;
    isLoading?: boolean;
}

export default function GameFormMultiVersion({
    mode,
    game,
    gameId,
    onSubmit,
    onCancel,
    isLoading
}: GameFormMultiVersionProps) {
    const { dialogState, closeDialog, confirm, error: showError } = useDialog();
    const [activeTab, setActiveTab] = useState<TabType>('info');
    const [gameTypeTab, setGameTypeTab] = useState<GameTypeTab>('crack');
    const [error, setError] = useState('');

    // Tab 1: Thông tin chung
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        thumbnail_url: '',
        save_file_path: '',
    });

    // Tab 2: Links cho phiên bản Crack
    const [crackLinks, setCrackLinks] = useState<LinkFormData[]>([]);

    // Tab 3-4: Accounts cho phiên bản Steam
    const [steamOfflineAccounts, setSteamOfflineAccounts] = useState<AccountFormData[]>([]);
    const [steamOnlineAccounts, setSteamOnlineAccounts] = useState<AccountFormData[]>([]);

    // Load data when editing
    useEffect(() => {
        if (mode === 'edit' && game) {
            setFormData({
                name: game.name,
                description: game.description || '',
                thumbnail_url: game.thumbnail_url || '',
                save_file_path: game.save_file_path || '',
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
                // Only load crack links
                const crack = data.data.filter((l: any) => l.version_type === 'crack');
                setCrackLinks(crack);
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
            // Build payload with new format - backend will derive game_type
            const payload = {
                ...formData,
                // Crack links
                crack: crackLinks.map(l => ({
                    title: l.title,
                    url: l.url
                })),
                // Steam Online accounts
                steam_on: steamOnlineAccounts.map(a => ({
                    username: a.username,
                    password: a.password,
                    guard_link: a.guard_link || undefined
                })),
                // Steam Offline accounts
                steam_off: steamOfflineAccounts.map(a => ({
                    username: a.username,
                    password: a.password,
                    guard_link: a.guard_link || undefined
                }))
            };

            // Submit all data in one request - backend handles everything
            await onSubmit(payload);

            if (mode === 'create') {
                // Reset form
                setFormData({
                    name: '',
                    description: '',
                    thumbnail_url: '',
                    save_file_path: '',
                });
                setCrackLinks([]);
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

            {/* Main Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-700">
                <button
                    type="button"
                    onClick={() => setActiveTab('info')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'info'
                            ? 'text-blue-400 border-b-2 border-blue-400'
                            : 'text-gray-400 hover:text-gray-300'
                        }`}
                >
                    📋 Thông tin chung
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('game_types')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'game_types'
                            ? 'text-blue-400 border-b-2 border-blue-400'
                            : 'text-gray-400 hover:text-gray-300'
                        }`}
                >
                    🎮 Loại game
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tab Content */}
                {activeTab === 'info' && (
                    <InfoTab formData={formData} setFormData={setFormData} />
                )}

                {activeTab === 'game_types' && (
                    <div className="flex gap-4">
                        {/* Sidebar */}
                        <div className="w-48 flex-shrink-0 space-y-2">
                            <button
                                type="button"
                                onClick={() => setGameTypeTab('crack')}
                                className={`w-full px-4 py-3 rounded-lg text-left font-medium transition-all ${
                                    gameTypeTab === 'crack'
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                🎮 Crack
                            </button>
                            <button
                                type="button"
                                onClick={() => setGameTypeTab('steam_offline')}
                                className={`w-full px-4 py-3 rounded-lg text-left font-medium transition-all ${
                                    gameTypeTab === 'steam_offline'
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                🔵 Steam Offline
                            </button>
                            <button
                                type="button"
                                onClick={() => setGameTypeTab('steam_online')}
                                className={`w-full px-4 py-3 rounded-lg text-left font-medium transition-all ${
                                    gameTypeTab === 'steam_online'
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                🟣 Steam Online
                            </button>
                        </div>

                        {/* Content Area - Fixed Height */}
                        <div className="flex-1 bg-gray-700/50 rounded-lg p-6 h-[400px] overflow-hidden">
                            {gameTypeTab === 'crack' && (
                                <VersionTab
                                    title="Phiên bản Crack"
                                    links={crackLinks}
                                    setLinks={setCrackLinks}
                                    versionType="crack"
                                />
                            )}

                            {gameTypeTab === 'steam_offline' && (
                                <SteamVersionTab
                                    title="Phiên bản Steam Offline"
                                    accounts={steamOfflineAccounts}
                                    setAccounts={setSteamOfflineAccounts}
                                    accountType="steam_offline"
                                    gameId={gameId}
                                    mode={mode}
                                    confirmDialog={confirm}
                                />
                            )}

                            {gameTypeTab === 'steam_online' && (
                                <SteamVersionTab
                                    title="Phiên bản Steam Online"
                                    accounts={steamOnlineAccounts}
                                    setAccounts={setSteamOnlineAccounts}
                                    accountType="steam_online"
                                    gameId={gameId}
                                    mode={mode}
                                    confirmDialog={confirm}
                                />
                            )}
                        </div>
                    </div>
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
                    Save File Path <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <input
                    type="text"
                    value={formData.save_file_path}
                    onChange={(e) => setFormData({ ...formData, save_file_path: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="%APPDATA%/GameName/saves/*.sav"
                />
                <p className="text-xs text-gray-400 mt-1">
                    Nếu không điền, CLI sẽ không có tính năng tự động sync save file
                </p>
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

function SteamVersionTab({ title, accounts, setAccounts, accountType, gameId, mode, confirmDialog }: any) {
    const [showAddAccount, setShowAddAccount] = useState(false);
    const [newAccount, setNewAccount] = useState({
        username: '',
        password: '',
        guard_link: '',
    });

    const handleAddAccount = () => {
        if (!newAccount.username || !newAccount.password) return;
        setAccounts([...accounts, { ...newAccount, type: accountType }]);
        setNewAccount({ username: '', password: '', guard_link: '' });
        setShowAddAccount(false);
    };

    const handleDeleteAccount = async (index: number) => {
        const account = accounts[index];

        const doDelete = async () => {
            if (mode === 'edit' && account.id && gameId) {
                try {
                    await fetch(`/api/accounts/${account.id}`, { method: 'DELETE' });
                } catch (err) {
                    // Error will be handled by parent
                    return;
                }
            }
            setAccounts(accounts.filter((_: any, i: number) => i !== index));
        };

        if (mode === 'edit' && account.id) {
            confirmDialog('Bạn có chắc muốn xóa tài khoản này?', () => {
                doDelete();
            });
        } else {
            await doDelete();
        }
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
        </div>
    );
}

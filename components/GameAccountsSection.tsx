'use client';

import { useState, useEffect } from 'react';
import { AccountStatus, GameType, GameAccount } from '@/types';
import { Copy, Check, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/auth/hooks';
import { useDialog } from '@/lib/hooks/useDialog';
import Dialog from '@/components/Dialog';

interface GameAccountsSectionProps {
  gameId: string;
  gameType: GameType[]; // Array of game types
}

interface AccountDetails {
  [key: string]: GameAccount | null;
}

export default function GameAccountsSection({
  gameId,
  gameType,
}: GameAccountsSectionProps) {
  const { user } = useAuth();
  const { dialogState, closeDialog, success, error, confirm } = useDialog();
  const [accounts, setAccounts] = useState<AccountStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedHours, setSelectedHours] = useState<{ [key: string]: number }>({});
  const [expandedAccounts, setExpandedAccounts] = useState<{ [key: string]: boolean }>({});
  const [accountDetails, setAccountDetails] = useState<AccountDetails>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    // Load accounts if game has any Steam type
    if (gameType && gameType.length > 0 && 
        (gameType.includes('steam_offline') || gameType.includes('steam_online'))) {
      loadAccounts();
    }
  }, [gameId, gameType]);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/games/${gameId}/accounts`);
      const data = await res.json();

      if (data.success) {
        setAccounts(data.data);
      }
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (accountId: string) => {
    const hours = selectedHours[accountId] || 1;

    try {
      const res = await fetch(`/api/accounts/${accountId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours }),
      });

      const data = await res.json();

      if (data.success) {
        success(`Account assigned for ${hours} hour(s)!`);
        loadAccounts();
      } else {
        error(data.error || 'Failed to assign account');
      }
    } catch (err) {
      console.error('Failed to assign account:', err);
      error('Failed to assign account');
    }
  };

  const handleRelease = async (accountId: string) => {
    confirm(
      'Are you sure you want to release this account?',
      async () => {
        try {
          const res = await fetch(`/api/accounts/${accountId}/release`, {
            method: 'POST',
          });

          const data = await res.json();

          if (data.success) {
            success('Account released successfully!');
            loadAccounts();
          } else {
            error(data.error || 'Failed to release account');
          }
        } catch (err) {
          console.error('Failed to release account:', err);
          error('Failed to release account');
        }
      }
    );
  };

  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getAccountDetails = async (accountId: string) => {
    try {
      const res = await fetch(`/api/accounts/${accountId}`);
      const data = await res.json();
      return data.success ? data.data : null;
    } catch (error) {
      return null;
    }
  };

  const toggleAccountDetails = async (accountId: string) => {
    const isExpanded = expandedAccounts[accountId];

    if (!isExpanded && !accountDetails[accountId]) {
      // Load details if not already loaded
      const details = await getAccountDetails(accountId);
      setAccountDetails(prev => ({ ...prev, [accountId]: details }));
    }

    setExpandedAccounts(prev => ({ ...prev, [accountId]: !isExpanded }));
  };

  const copyToClipboard = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const togglePasswordVisibility = (accountId: string) => {
    setShowPassword(prev => ({ ...prev, [accountId]: !prev[accountId] }));
  };

  // Don't show if no game types or only crack
  if (!gameType || gameType.length === 0 || (gameType.length === 1 && gameType[0] === 'crack')) {
    return null;
  }

  // Separate accounts by type
  const offlineAccounts = accounts.filter(a => a.type === 'steam_offline');
  const onlineAccounts = accounts.filter(a => a.type === 'steam_online');

  return (
    <div className="space-y-8">
      {/* Steam Offline Section */}
      {gameType.includes('steam_offline') && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">🔵 Steam Offline Accounts</h2>

          {loading ? (
            <p className="text-gray-400">Loading accounts...</p>
          ) : offlineAccounts.length === 0 ? (
            <p className="text-gray-500">No offline accounts available.</p>
          ) : (
            <div className="grid gap-4">
              {offlineAccounts.map((account) => (
                <div
                  key={account.id}
                  className="border border-green-500/30 rounded-lg bg-green-500/10 overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <p className="font-semibold text-lg text-white">{account.username}</p>
                        <p className="text-sm text-green-400">
                          ✅ Available for use (no restrictions)
                        </p>
                      </div>

                      <button
                        onClick={() => toggleAccountDetails(account.id)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          expandedAccounts[account.id]
                            ? 'bg-gray-600 text-white hover:bg-gray-500'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {expandedAccounts[account.id] ? 'Ẩn' : 'Xem chi tiết'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedAccounts[account.id] && accountDetails[account.id] && (
                    <div className="border-t border-green-500/30 bg-gray-800/50 p-4 space-y-3">
                      {/* Username */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Username</p>
                          <p className="text-white font-mono">{accountDetails[account.id]?.username}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(accountDetails[account.id]?.username || '', `username-${account.id}`)}
                          className="p-2 hover:bg-gray-700 rounded transition-colors"
                        >
                          {copiedField === `username-${account.id}` ? (
                            <Check size={16} className="text-green-400" />
                          ) : (
                            <Copy size={16} className="text-gray-400" />
                          )}
                        </button>
                      </div>

                      {/* Password */}
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-xs text-gray-400 mb-1">Password</p>
                          <p className="text-white font-mono">
                            {showPassword[account.id]
                              ? accountDetails[account.id]?.password
                              : '••••••••'}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => togglePasswordVisibility(account.id)}
                            className="p-2 hover:bg-gray-700 rounded transition-colors"
                          >
                            {showPassword[account.id] ? (
                              <EyeOff size={16} className="text-gray-400" />
                            ) : (
                              <Eye size={16} className="text-gray-400" />
                            )}
                          </button>
                          <button
                            onClick={() => copyToClipboard(accountDetails[account.id]?.password || '', `password-${account.id}`)}
                            className="p-2 hover:bg-gray-700 rounded transition-colors"
                          >
                            {copiedField === `password-${account.id}` ? (
                              <Check size={16} className="text-green-400" />
                            ) : (
                              <Copy size={16} className="text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Guard Link */}
                      {accountDetails[account.id]?.guard_link && (
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-400 mb-1">Guard Link</p>
                            <a
                              href={accountDetails[account.id]?.guard_link || ''}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 text-sm truncate block"
                            >
                              {accountDetails[account.id]?.guard_link}
                            </a>
                          </div>
                          <button
                            onClick={() => copyToClipboard(accountDetails[account.id]?.guard_link || '', `guard-${account.id}`)}
                            className="p-2 hover:bg-gray-700 rounded transition-colors ml-2"
                          >
                            {copiedField === `guard-${account.id}` ? (
                              <Check size={16} className="text-green-400" />
                            ) : (
                              <Copy size={16} className="text-gray-400" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Steam Online Section */}
      {gameType.includes('steam_online') && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">🟣 Steam Online Accounts</h2>

          {loading ? (
            <p className="text-gray-400">Loading accounts...</p>
          ) : onlineAccounts.length === 0 ? (
            <p className="text-gray-500">No online accounts available.</p>
          ) : (
            <div className="grid gap-4">
              {onlineAccounts.map((account) => (
                <div
                  key={account.id}
                  className={`border rounded-lg overflow-hidden ${
                    account.is_available
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <p className="font-semibold text-lg text-white">{account.username}</p>

                        {account.is_available ? (
                          <p className="text-sm text-green-400 font-medium">✅ Available</p>
                        ) : (
                          <div className="text-sm text-red-400">
                            <p className="font-medium">
                              🔒 In use by: {account.in_use_by?.username}
                            </p>
                            <p>
                              ⏱️ Time remaining: {formatTimeRemaining(account.time_remaining || 0)}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        {account.is_available ? (
                          <div className="flex gap-2">
                            <select
                              value={selectedHours[account.id] || 1}
                              onChange={(e) =>
                                setSelectedHours({
                                  ...selectedHours,
                                  [account.id]: parseInt(e.target.value),
                                })
                              }
                              className="px-2 py-2 border rounded-lg bg-gray-700 text-white border-gray-600"
                            >
                              <option value={1}>1 hour</option>
                              <option value={2}>2 hours</option>
                              <option value={4}>4 hours</option>
                              <option value={8}>8 hours</option>
                              <option value={12}>12 hours</option>
                              <option value={24}>24 hours</option>
                            </select>
                            <button
                              onClick={() => handleAssign(account.id)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 whitespace-nowrap"
                            >
                              Get Now
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            {account.in_use_by && user && account.in_use_by.id === user.id && (
                              <>
                                <button
                                  onClick={() => toggleAccountDetails(account.id)}
                                  className={`px-4 py-2 rounded-lg transition-colors ${
                                    expandedAccounts[account.id]
                                      ? 'bg-gray-600 text-white hover:bg-gray-500'
                                      : 'bg-blue-600 text-white hover:bg-blue-700'
                                  }`}
                                >
                                  {expandedAccounts[account.id] ? 'Ẩn' : 'Xem chi tiết'}
                                </button>
                                <button
                                  onClick={() => handleRelease(account.id)}
                                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                                >
                                  Release
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedAccounts[account.id] && accountDetails[account.id] && (
                    <div className="border-t border-purple-500/30 bg-gray-800/50 p-4 space-y-3">
                      {/* Username */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Username</p>
                          <p className="text-white font-mono">{accountDetails[account.id]?.username}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(accountDetails[account.id]?.username || '', `username-${account.id}`)}
                          className="p-2 hover:bg-gray-700 rounded transition-colors"
                        >
                          {copiedField === `username-${account.id}` ? (
                            <Check size={16} className="text-green-400" />
                          ) : (
                            <Copy size={16} className="text-gray-400" />
                          )}
                        </button>
                      </div>

                      {/* Password */}
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-xs text-gray-400 mb-1">Password</p>
                          <p className="text-white font-mono">
                            {showPassword[account.id]
                              ? accountDetails[account.id]?.password
                              : '••••••••'}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => togglePasswordVisibility(account.id)}
                            className="p-2 hover:bg-gray-700 rounded transition-colors"
                          >
                            {showPassword[account.id] ? (
                              <EyeOff size={16} className="text-gray-400" />
                            ) : (
                              <Eye size={16} className="text-gray-400" />
                            )}
                          </button>
                          <button
                            onClick={() => copyToClipboard(accountDetails[account.id]?.password || '', `password-${account.id}`)}
                            className="p-2 hover:bg-gray-700 rounded transition-colors"
                          >
                            {copiedField === `password-${account.id}` ? (
                              <Check size={16} className="text-green-400" />
                            ) : (
                              <Copy size={16} className="text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Guard Link */}
                      {accountDetails[account.id]?.guard_link && (
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-400 mb-1">Guard Link</p>
                            <a
                              href={accountDetails[account.id]?.guard_link || ''}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 text-sm truncate block"
                            >
                              {accountDetails[account.id]?.guard_link}
                            </a>
                          </div>
                          <button
                            onClick={() => copyToClipboard(accountDetails[account.id]?.guard_link || '', `guard-${account.id}`)}
                            className="p-2 hover:bg-gray-700 rounded transition-colors ml-2"
                          >
                            {copiedField === `guard-${account.id}` ? (
                              <Check size={16} className="text-green-400" />
                            ) : (
                              <Copy size={16} className="text-gray-400" />
                            )}
                          </button>
                        </div>
                      )}

                      {/* Time remaining */}
                      <div className="pt-2 border-t border-gray-700">
                        <p className="text-sm text-yellow-400">
                          ⏰ Time remaining: {formatTimeRemaining(account.time_remaining || 0)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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

'use client';

import { useState, useEffect } from 'react';
import { AccountStatus, GameType } from '@/types';

interface GameAccountsSectionProps {
  gameId: string;
  gameType: GameType[]; // Array of game types
}

export default function GameAccountsSection({
  gameId,
  gameType,
}: GameAccountsSectionProps) {
  const [accounts, setAccounts] = useState<AccountStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedHours, setSelectedHours] = useState<{ [key: string]: number }>({});

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
        alert(`Account assigned for ${hours} hour(s)!`);
        loadAccounts();
      } else {
        alert(data.error || 'Failed to assign account');
      }
    } catch (error) {
      console.error('Failed to assign account:', error);
      alert('Failed to assign account');
    }
  };

  const handleRelease = async (accountId: string) => {
    if (!confirm('Are you sure you want to release this account?')) return;

    try {
      const res = await fetch(`/api/accounts/${accountId}/release`, {
        method: 'POST',
      });

      const data = await res.json();

      if (data.success) {
        alert('Account released successfully!');
        loadAccounts();
      } else {
        alert(data.error || 'Failed to release account');
      }
    } catch (error) {
      console.error('Failed to release account:', error);
      alert('Failed to release account');
    }
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

  // Don't show if no game types or only crack
  if (!gameType || gameType.length === 0 || (gameType.length === 1 && gameType[0] === 'crack')) {
    return null;
  }

  // Separate accounts by type (accounts already have type field from API)
  const offlineAccounts = accounts.filter(a => {
    // Need to check actual account type from backend
    return true; // Will be filtered when rendering
  });

  const onlineAccounts = accounts.filter(a => {
    return true; // Will be filtered when rendering
  });

  return (
    <div className="space-y-8">
      {/* Steam Offline Section */}
      {gameType.includes('steam_offline') && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">🔵 Steam Offline Accounts</h2>

          {loading ? (
            <p>Loading accounts...</p>
          ) : accounts.filter(a => {
            // Filter offline accounts - need to check from full account data
            return true; // Simplified for now
          }).length === 0 ? (
            <p className="text-gray-500">No offline accounts available.</p>
          ) : (
            <div className="grid gap-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="p-4 border rounded-lg bg-green-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <p className="font-semibold text-lg">{account.username}</p>
                      <p className="text-sm text-gray-600">
                        Available for use (no restrictions)
                      </p>
                    </div>

                    <button
                      onClick={async () => {
                        const acc = await getAccountDetails(account.id);
                        if (acc) {
                          const details = `
🎮 Steam Offline Account

Username: ${acc.username}
Password: ${acc.password}
${acc.guard_link ? `Guard Link: ${acc.guard_link}` : ''}

✅ You can use this account anytime!
No time limit, no restrictions.
                          `.trim();
                          alert(details);
                        } else {
                          alert('Failed to load account details');
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Steam Online Section */}
      {gameType.includes('steam_online') && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">🟣 Steam Online Accounts</h2>

          {loading ? (
            <p>Loading accounts...</p>
          ) : accounts.length === 0 ? (
            <p className="text-gray-500">No online accounts available.</p>
          ) : (
            <div className="grid gap-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className={`p-4 border rounded-lg ${
                    account.is_available ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <p className="font-semibold text-lg">{account.username}</p>

                      {account.is_available ? (
                        <p className="text-sm text-green-600 font-medium">Available</p>
                      ) : (
                        <div className="text-sm text-red-600">
                          <p className="font-medium">
                            In use by: {account.in_use_by?.username}
                          </p>
                          <p>
                            Time remaining: {formatTimeRemaining(account.time_remaining || 0)}
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
                            className="px-2 py-2 border rounded-lg"
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
                          {account.in_use_by && (
                            <>
                              <button
                                onClick={async () => {
                                  const acc = await getAccountDetails(account.id);
                                  if (acc) {
                                    const details = `
🎮 Steam Online Account

Username: ${acc.username}
Password: ${acc.password}
${acc.guard_link ? `Guard Link: ${acc.guard_link}` : ''}

⏰ Time remaining: ${formatTimeRemaining(account.time_remaining || 0)}
                                    `.trim();
                                    alert(details);
                                  } else {
                                    alert('Failed to load account details');
                                  }
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                              >
                                View Details
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
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

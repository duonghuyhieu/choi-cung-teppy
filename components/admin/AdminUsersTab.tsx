'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Key, Trash2, Edit } from 'lucide-react';
import { User, ApiResponse } from '@/types';

async function fetchUsers(): Promise<User[]> {
  const token = localStorage.getItem('auth-token');
  const response = await fetch('/api/admin/users', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data: ApiResponse<User[]> = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch users');
  return data.data || [];
}

async function resetPassword(userId: string): Promise<void> {
  const token = localStorage.getItem('auth-token');
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'reset-password' }),
  });
  const data: ApiResponse = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to reset password');
}

async function updateUser(userId: string, userData: { username?: string; email?: string; role?: 'admin' | 'user' }): Promise<void> {
  const token = localStorage.getItem('auth-token');
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'update-info', ...userData }),
  });
  const data: ApiResponse = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to update user');
}

async function deleteUser(userId: string): Promise<void> {
  const token = localStorage.getItem('auth-token');
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data: ApiResponse = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to delete user');
}

export default function AdminUsersTab() {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'user'>('user');

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchUsers,
  });

  const resetPasswordMutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      alert('Mật khẩu đã được đặt lại thành 123456');
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, userData }: { userId: string; userData: { username?: string; email?: string; role?: 'admin' | 'user' } }) =>
      updateUser(userId, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setShowEditDialog(false);
      setSelectedUser(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const handleResetPassword = (user: User) => {
    if (window.confirm(`Đặt lại mật khẩu của "${user.username}" về 123456?`)) {
      resetPasswordMutation.mutate(user.id);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditUsername(user.username);
    setEditEmail(user.email);
    setEditRole(user.role);
    setShowEditDialog(true);
  };

  const handleSubmitEdit = () => {
    if (!selectedUser) return;
    
    if (!editUsername.trim() || !editEmail.trim()) {
      alert('Username và email không được để trống');
      return;
    }

    updateUserMutation.mutate({
      userId: selectedUser.id,
      userData: {
        username: editUsername.trim(),
        email: editEmail.trim(),
        role: editRole,
      },
    });
  };

  const handleDelete = (user: User) => {
    if (window.confirm(`Bạn có chắc muốn xóa người dùng "${user.username}"? Hành động này không thể hoàn tác.`)) {
      deleteMutation.mutate(user.id);
    }
  };

  return (
    <div className="glass-strong rounded-2xl p-8 border border-white/10">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-[var(--neon-cyan)]">Danh sách Người dùng</h2>
        <div className="text-gray-400">
          Tổng: <span className="text-white font-bold">{users?.length || 0}</span> người dùng
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-[var(--neon-cyan)] border-r-[var(--neon-magenta)]"></div>
          <p className="mt-6 text-xl text-[var(--neon-cyan)]">Đang tải...</p>
        </div>
      )}

      {!isLoading && users && users.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[var(--neon-cyan)]/30">
              <tr className="text-left">
                <th className="pb-4 pr-4 text-[var(--neon-cyan)] font-bold">Người dùng</th>
                <th className="pb-4 pr-4 text-[var(--neon-cyan)] font-bold">Email</th>
                <th className="pb-4 pr-4 text-[var(--neon-cyan)] font-bold">Vai trò</th>
                <th className="pb-4 pr-4 text-[var(--neon-cyan)] font-bold">Ngày tạo</th>
                <th className="pb-4 text-[var(--neon-cyan)] font-bold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-5 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-purple)] flex items-center justify-center text-white font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="font-semibold text-white">{user.username}</div>
                    </div>
                  </td>
                  <td className="py-5 pr-4 text-gray-400">{user.email}</td>
                  <td className="py-5 pr-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        user.role === 'admin'
                          ? 'bg-[var(--neon-purple)]/20 text-[var(--neon-purple)] border border-[var(--neon-purple)]/50'
                          : 'bg-[var(--neon-cyan)]/20 text-[var(--neon-cyan)] border border-[var(--neon-cyan)]/50'
                      }`}
                    >
                      {user.role === 'admin' ? '⚡ Admin' : '👤 User'}
                    </span>
                  </td>
                  <td className="py-5 pr-4 text-gray-400">
                    {new Date(user.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-5">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10 rounded-lg transition-all"
                        title="Sửa thông tin"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleResetPassword(user)}
                        className="p-2 text-[var(--neon-green)] hover:bg-[var(--neon-green)]/10 rounded-lg transition-all"
                        title="Reset mật khẩu"
                      >
                        <Key size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
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

      {/* Edit User Dialog */}
      {showEditDialog && selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-strong rounded-2xl p-8 max-w-md w-full mx-4 border border-white/20">
            <h3 className="text-2xl font-bold mb-4 text-[var(--neon-cyan)]">Sửa thông tin người dùng</h3>
            <p className="text-gray-300 mb-6">
              Chỉnh sửa thông tin cho <span className="font-bold text-white">{selectedUser.username}</span>
            </p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--neon-cyan)]">
                  Username
                </label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-4 py-3 glass rounded-xl border border-white/20 focus:outline-none focus:border-[var(--neon-cyan)] focus:shadow-[0_0_15px_var(--neon-cyan)] transition-all duration-300 text-white placeholder-gray-400"
                  placeholder="Nhập username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--neon-cyan)]">
                  Email
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-4 py-3 glass rounded-xl border border-white/20 focus:outline-none focus:border-[var(--neon-cyan)] focus:shadow-[0_0_15px_var(--neon-cyan)] transition-all duration-300 text-white placeholder-gray-400"
                  placeholder="Nhập email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--neon-cyan)]">
                  Vai trò
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditRole('user')}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      editRole === 'user'
                        ? 'bg-[var(--neon-cyan)]/20 text-[var(--neon-cyan)] border-2 border-[var(--neon-cyan)]'
                        : 'glass border border-white/20 text-gray-400 hover:border-[var(--neon-cyan)]/50'
                    }`}
                  >
                    👤 User
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditRole('admin')}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      editRole === 'admin'
                        ? 'bg-[var(--neon-purple)]/20 text-[var(--neon-purple)] border-2 border-[var(--neon-purple)]'
                        : 'glass border border-white/20 text-gray-400 hover:border-[var(--neon-purple)]/50'
                    }`}
                  >
                    ⚡ Admin
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSubmitEdit}
                disabled={updateUserMutation.isPending}
                className="flex-1 px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all disabled:opacity-50"
              >
                {updateUserMutation.isPending ? 'Đang lưu...' : 'Lưu'}
              </button>
              <button
                onClick={() => {
                  setShowEditDialog(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-6 py-3 rounded-xl font-bold glass border border-white/20 hover:border-white/40 transition-all"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

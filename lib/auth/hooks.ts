'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, LoginDto, CreateUserDto, ApiResponse, AuthResponse } from '@/types';

// Fetch current user
async function fetchCurrentUser(): Promise<User | null> {
  console.log('[fetchCurrentUser] Starting...');

  // Check if running in browser
  if (typeof window === 'undefined') {
    console.log('[fetchCurrentUser] Running on server, returning null');
    return null;
  }

  const token = localStorage.getItem('auth-token');
  console.log('[fetchCurrentUser] Token from localStorage:', token ? 'exists' : 'missing');

  if (!token) {
    console.log('[fetchCurrentUser] No token, returning null');
    return null;
  }

  console.log('[fetchCurrentUser] Calling /api/auth/me with Bearer token');
  const response = await fetch('/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  console.log('[fetchCurrentUser] Response status:', response.status);
  const data: ApiResponse<User> = await response.json();
  console.log('[fetchCurrentUser] Response data:', data);

  if (!data.success) {
    console.log('[fetchCurrentUser] API returned error:', data.error);
    return null;
  }

  console.log('[fetchCurrentUser] User loaded:', data.data);
  return data.data || null;
}

// Login function
async function login(credentials: LoginDto): Promise<AuthResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  const data: ApiResponse<AuthResponse> = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Login failed');
  }

  return data.data!;
}

// Register function
async function register(userData: CreateUserDto): Promise<AuthResponse> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  const data: ApiResponse<AuthResponse> = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Registration failed');
  }

  return data.data!;
}

// Logout function
async function logout(): Promise<void> {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
  });

  const data: ApiResponse = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Logout failed');
  }
}

// Custom hook for authentication
export function useAuth() {
  const queryClient = useQueryClient();

  // Query for current user
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data.user);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data.user);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
      }
      queryClient.setQueryData(['currentUser'], null);
      queryClient.clear();
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    error,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}

// Hook to require authentication (throws if not authenticated)
export function useRequireAuth() {
  const { user, isLoading } = useAuth();

  if (!isLoading && !user) {
    throw new Error('Authentication required');
  }

  return { user, isLoading };
}

// Hook to require admin role
export function useRequireAdmin() {
  const { user, isLoading, isAdmin } = useAuth();

  if (!isLoading && (!user || !isAdmin)) {
    throw new Error('Admin access required');
  }

  return { user, isLoading };
}

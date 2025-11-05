export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface CreateUserDto {
  username: string;
  password: string;
  role?: UserRole;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
}

export type GameAccountType = 'steam_offline' | 'steam_online';

export interface GameAccount {
  id: string;
  game_id: string;
  type: GameAccountType;
  username: string;
  password: string;
  guard_link: string | null;
  in_use_by: string | null;
  in_use_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface GameAccountWithUser extends GameAccount {
  user?: {
    id: string;
    username: string;
  };
}

export interface CreateGameAccountDto {
  game_id: string;
  type: GameAccountType;
  username: string;
  password: string;
  guard_link?: string;
}

export interface UpdateGameAccountDto {
  username?: string;
  password?: string;
  guard_link?: string;
}

export interface AssignAccountDto {
  hours: number; // Số giờ muốn chơi (1, 2, 4, 8...)
}

export interface AccountStatus {
  id: string;
  username: string;
  type: GameAccountType;
  is_available: boolean;
  in_use_by?: {
    id: string;
    username: string;
  };
  time_remaining?: number; // seconds
  in_use_until?: string;
}

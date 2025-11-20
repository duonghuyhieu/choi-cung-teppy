import { supabaseAdmin } from '../supabase/client';
import {
  GameAccount,
  GameAccountWithUser,
  CreateGameAccountDto,
  UpdateGameAccountDto,
  AccountStatus,
} from '@/types';

// ===== GAME ACCOUNTS =====

export async function createGameAccount(
  data: CreateGameAccountDto
): Promise<GameAccount> {
  // Check if username already exists
  const { data: existingAccount } = await supabaseAdmin
    .from('game_accounts')
    .select('id, username, game_id, game:games(name)')
    .eq('username', data.username)
    .single();

  if (existingAccount) {
    throw new Error(
      `Tài khoản Steam với username "${data.username}" đã tồn tại trong hệ thống. Vui lòng sử dụng username khác.`
    );
  }

  const { data: account, error } = await supabaseAdmin
    .from('game_accounts')
    .insert({
      game_id: data.game_id,
      type: data.type,
      username: data.username,
      password: data.password,
      guard_link: data.guard_link || null,
    })
    .select()
    .single();

  if (error) {
    // Handle unique constraint violation from database
    if (error.code === '23505' && error.message.includes('username')) {
      throw new Error(
        `Tài khoản Steam với username "${data.username}" đã tồn tại trong hệ thống. Vui lòng sử dụng username khác.`
      );
    }
    throw new Error(error.message);
  }

  return account;
}

export async function getAccountsByGame(
  gameId: string
): Promise<GameAccountWithUser[]> {
  // Reset expired accounts first
  await resetExpiredAccounts();

  const { data, error } = await supabaseAdmin
    .from('game_accounts')
    .select(`
      *,
      user:in_use_by (
        id,
        username
      )
    `)
    .eq('game_id', gameId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function getAccountById(id: string): Promise<GameAccount | null> {
  // Reset expired accounts first
  await resetExpiredAccounts();

  const { data, error } = await supabaseAdmin
    .from('game_accounts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function updateGameAccount(
  id: string,
  data: UpdateGameAccountDto
): Promise<GameAccount> {
  // If username is being updated, check if it already exists
  if (data.username) {
    const { data: existingAccount } = await supabaseAdmin
      .from('game_accounts')
      .select('id, username')
      .eq('username', data.username)
      .neq('id', id) // Exclude current account
      .single();

    if (existingAccount) {
      throw new Error(
        `Tài khoản Steam với username "${data.username}" đã tồn tại trong hệ thống. Vui lòng sử dụng username khác.`
      );
    }
  }

  const { data: account, error } = await supabaseAdmin
    .from('game_accounts')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    // Handle unique constraint violation from database
    if (error.code === '23505' && error.message.includes('username')) {
      throw new Error(
        `Tài khoản Steam với username "${data.username}" đã tồn tại trong hệ thống. Vui lòng sử dụng username khác.`
      );
    }
    throw new Error(error.message);
  }

  return account;
}

export async function deleteGameAccount(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('game_accounts')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

// ===== STEAM ONLINE LOGIC =====

export async function assignSteamOnlineAccount(
  accountId: string,
  userId: string,
  hours: number
): Promise<GameAccount> {
  // Reset expired accounts first
  await resetExpiredAccounts();

  // Get account and check if available
  const account = await getAccountById(accountId);
  
  if (!account) {
    throw new Error('Account not found');
  }

  if (account.type !== 'steam_online') {
    throw new Error('This account is not Steam Online type');
  }

  // Check if account is currently in use
  if (account.in_use_by && account.in_use_until) {
    const now = new Date();
    const inUseUntil = new Date(account.in_use_until);
    
    if (now < inUseUntil) {
      throw new Error('Account is currently in use');
    }
  }

  // Assign account to user
  const inUseUntil = new Date();
  inUseUntil.setHours(inUseUntil.getHours() + hours);

  const { data: updatedAccount, error } = await supabaseAdmin
    .from('game_accounts')
    .update({
      in_use_by: userId,
      in_use_until: inUseUntil.toISOString(),
    })
    .eq('id', accountId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return updatedAccount;
}

export async function releaseAccount(
  accountId: string,
  userId: string
): Promise<GameAccount> {
  const account = await getAccountById(accountId);
  
  if (!account) {
    throw new Error('Account not found');
  }

  // Only the user who is using the account can release it
  if (account.in_use_by !== userId) {
    throw new Error('You are not using this account');
  }

  const { data: updatedAccount, error } = await supabaseAdmin
    .from('game_accounts')
    .update({
      in_use_by: null,
      in_use_until: null,
    })
    .eq('id', accountId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return updatedAccount;
}

export async function getAccountStatus(
  accountId: string
): Promise<AccountStatus> {
  // Reset expired accounts first
  await resetExpiredAccounts();

  const { data: account, error } = await supabaseAdmin
    .from('game_accounts')
    .select(`
      *,
      user:in_use_by (
        id,
        username
      )
    `)
    .eq('id', accountId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const now = new Date();
  const isAvailable = !account.in_use_by || 
    !account.in_use_until || 
    now >= new Date(account.in_use_until);

  let timeRemaining: number | undefined;
  if (!isAvailable && account.in_use_until) {
    const inUseUntil = new Date(account.in_use_until);
    timeRemaining = Math.max(0, Math.floor((inUseUntil.getTime() - now.getTime()) / 1000));
  }

  return {
    id: account.id,
    type: account.type,
    username: account.username,
    is_available: isAvailable,
    in_use_by: account.user || undefined,
    time_remaining: timeRemaining,
    in_use_until: account.in_use_until || undefined,
  };
}

export async function getAccountsStatusByGame(
  gameId: string
): Promise<AccountStatus[]> {
  const accounts = await getAccountsByGame(gameId);
  
  return Promise.all(
    accounts.map(async (account) => {
      const now = new Date();
      const isAvailable = !account.in_use_by || 
        !account.in_use_until || 
        now >= new Date(account.in_use_until);

      let timeRemaining: number | undefined;
      if (!isAvailable && account.in_use_until) {
        const inUseUntil = new Date(account.in_use_until);
        timeRemaining = Math.max(0, Math.floor((inUseUntil.getTime() - now.getTime()) / 1000));
      }

      return {
        id: account.id,
        username: account.username,
        type: account.type,
        is_available: isAvailable,
        in_use_by: account.user || undefined,
        time_remaining: timeRemaining,
        in_use_until: account.in_use_until || undefined,
      };
    })
  );
}

// ===== HELPER FUNCTIONS =====

export async function resetExpiredAccounts(): Promise<void> {
  const { error } = await supabaseAdmin.rpc('reset_expired_accounts');
  
  if (error) {
    console.error('Error resetting expired accounts:', error);
  }
}

export async function getUserActiveAccounts(
  userId: string
): Promise<GameAccountWithUser[]> {
  // Reset expired accounts first
  await resetExpiredAccounts();

  const { data, error } = await supabaseAdmin
    .from('game_accounts')
    .select(`
      *,
      user:in_use_by (
        id,
        username
      )
    `)
    .eq('in_use_by', userId)
    .not('in_use_until', 'is', null)
    .order('in_use_until', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

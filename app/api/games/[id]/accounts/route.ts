import { NextRequest, NextResponse } from 'next/server';
import {
  getAccountsByGame,
  createGameAccount,
  getAccountsStatusByGame,
} from '@/lib/db/game-accounts';
import { requireAuth, requireAdmin } from '@/lib/auth/session';
import { ApiResponse, CreateGameAccountDto, AccountStatus } from '@/types';

// GET /api/games/[id]/accounts - Get all accounts for a game
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id: gameId } = await params;

    // Get account status (includes availability info)
    const statuses = await getAccountsStatusByGame(gameId);

    return NextResponse.json<ApiResponse<AccountStatus[]>>(
      {
        success: true,
        data: statuses,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get game accounts error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to get game accounts',
      },
      { status: 500 }
    );
  }
}

// POST /api/games/[id]/accounts - Create account for a game (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id: gameId } = await params;
    const body: Omit<CreateGameAccountDto, 'game_id'> = await request.json();

    // Validate input
    if (!body.type || !body.username || !body.password) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Type, username, and password are required',
        },
        { status: 400 }
      );
    }

    if (body.type !== 'steam_offline' && body.type !== 'steam_online') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Type must be steam_offline or steam_online',
        },
        { status: 400 }
      );
    }

    const account = await createGameAccount({
      ...body,
      game_id: gameId,
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: account,
        message: 'Account created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create game account error:', error);

    if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: error.message,
        },
        { status: error.message.includes('Unauthorized') ? 401 : 403 }
      );
    }

    // Check if it's a duplicate username error
    if (error.message.includes('đã tồn tại trong hệ thống')) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: error.message,
        },
        { status: 409 } // Conflict status code
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to create account',
      },
      { status: 500 }
    );
  }
}

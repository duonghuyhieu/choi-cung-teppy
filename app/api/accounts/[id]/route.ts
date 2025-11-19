import { NextRequest, NextResponse } from 'next/server';
import {
  getAccountById,
  updateGameAccount,
  deleteGameAccount,
  getAccountStatus,
} from '@/lib/db/game-accounts';
import { requireAuth, requireAdmin } from '@/lib/auth/session';
import { ApiResponse, UpdateGameAccountDto, AccountStatus } from '@/types';

// GET /api/accounts/[id] - Get account by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const account = await getAccountById(id);

    if (!account) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Account not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: account,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get account error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to get account',
      },
      { status: 500 }
    );
  }
}

// PATCH /api/accounts/[id] - Update account (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body: UpdateGameAccountDto = await request.json();

    const account = await updateGameAccount(id, body);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: account,
        message: 'Account updated successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update account error:', error);

    if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: error.message,
        },
        { status: error.message.includes('Unauthorized') ? 401 : 403 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to update account',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/accounts/[id] - Delete account (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await deleteGameAccount(id);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Account deleted successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete account error:', error);

    if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: error.message,
        },
        { status: error.message.includes('Unauthorized') ? 401 : 403 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to delete account',
      },
      { status: 500 }
    );
  }
}

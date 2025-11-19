import { NextRequest, NextResponse } from 'next/server';
import { getUserActiveAccounts } from '@/lib/db/game-accounts';
import { requireAuth } from '@/lib/auth/session';
import { ApiResponse } from '@/types';

// GET /api/users/[id]/active-accounts - Get user's active accounts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id: userId } = await params;

    // Users can only view their own active accounts
    if (session.userId !== userId && session.role !== 'admin') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Forbidden: You can only view your own active accounts',
        },
        { status: 403 }
      );
    }

    const accounts = await getUserActiveAccounts(userId);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: accounts,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get user active accounts error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to get active accounts',
      },
      { status: 500 }
    );
  }
}

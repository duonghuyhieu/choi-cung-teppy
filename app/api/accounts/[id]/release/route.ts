import { NextRequest, NextResponse } from 'next/server';
import { releaseAccount } from '@/lib/db/game-accounts';
import { requireAuth } from '@/lib/auth/session';
import { ApiResponse } from '@/types';

// POST /api/accounts/[id]/release - Release Steam Online account
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const account = await releaseAccount(id, session.userId);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: account,
        message: 'Account released successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Release account error:', error);

    if (error.message.includes('Unauthorized')) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: error.message,
        },
        { status: 401 }
      );
    }

    if (error.message.includes('not using')) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: error.message,
        },
        { status: 403 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to release account',
      },
      { status: 500 }
    );
  }
}

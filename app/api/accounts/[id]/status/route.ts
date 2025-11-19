import { NextRequest, NextResponse } from 'next/server';
import { getAccountStatus } from '@/lib/db/game-accounts';
import { requireAuth } from '@/lib/auth/session';
import { ApiResponse, AccountStatus } from '@/types';

// GET /api/accounts/[id]/status - Get account status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const status = await getAccountStatus(id);

    return NextResponse.json<ApiResponse<AccountStatus>>(
      {
        success: true,
        data: status,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get account status error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to get account status',
      },
      { status: 500 }
    );
  }
}

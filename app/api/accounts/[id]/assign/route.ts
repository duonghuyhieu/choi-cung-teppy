import { NextRequest, NextResponse } from 'next/server';
import { assignSteamOnlineAccount } from '@/lib/db/game-accounts';
import { requireAuth } from '@/lib/auth/session';
import { ApiResponse, AssignAccountDto } from '@/types';

// POST /api/accounts/[id]/assign - Assign Steam Online account to user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body: AssignAccountDto = await request.json();

    // Validate input
    if (!body.hours || body.hours <= 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Hours must be a positive number',
        },
        { status: 400 }
      );
    }

    // Limit max hours to 24
    if (body.hours > 24) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Maximum 24 hours allowed',
        },
        { status: 400 }
      );
    }

    const account = await assignSteamOnlineAccount(
      id,
      session.userId,
      body.hours
    );

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: account,
        message: `Account assigned for ${body.hours} hour(s)`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Assign account error:', error);

    if (error.message.includes('Unauthorized')) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: error.message,
        },
        { status: 401 }
      );
    }

    if (error.message.includes('currently in use')) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: error.message,
        },
        { status: 409 } // Conflict
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to assign account',
      },
      { status: 500 }
    );
  }
}

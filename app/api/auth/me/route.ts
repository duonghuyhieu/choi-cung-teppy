import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { findUserById } from '@/lib/db/users';
import { ApiResponse, User } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header or cookie
    const authHeader = request.headers.get('authorization');
    let token = authHeader?.replace('Bearer ', '');

    // Fallback to cookie if no header
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get('game-saver-session')?.value;
    }

    console.log('Token:', token ? 'exists' : 'missing');

    if (!token) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Not authenticated',
        },
        { status: 401 }
      );
    }

    // Verify token
    const session = verifySession(token);
    console.log('Session data:', session);

    if (!session) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Invalid token',
        },
        { status: 401 }
      );
    }

    const user = await findUserById(session.userId);

    if (!user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // Remove password hash
    const { password_hash, ...userWithoutPassword } = user as any;

    return NextResponse.json<ApiResponse<User>>(
      {
        success: true,
        data: userWithoutPassword,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get session error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to get session',
      },
      { status: 500 }
    );
  }
}

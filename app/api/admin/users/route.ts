import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { getAllUsers } from '@/lib/db/users';
import { ApiResponse, User } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifySession(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const users = await getAllUsers();

    return NextResponse.json<ApiResponse<User[]>>(
      { success: true, data: users },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get users error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to get users' },
      { status: 500 }
    );
  }
}

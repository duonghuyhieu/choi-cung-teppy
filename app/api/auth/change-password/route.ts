import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/db/users';
import { findUserById } from '@/lib/db/users';
import { updateUserPassword } from '@/lib/db/users-helpers';
import { verifySession } from '@/lib/auth/session';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    const payload = verifySession(token);
    if (!payload) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Invalid or expired token',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Current password and new password are required',
        },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'New password must be at least 6 characters',
        },
        { status: 400 }
      );
    }

    // Get user with password hash
    const user = await findUserById(payload.userId) as any;
    if (!user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Current password is incorrect',
        },
        { status: 401 }
      );
    }

    // Update password
    await updateUserPassword(payload.userId, newPassword);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Password changed successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Change password error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to change password',
      },
      { status: 500 }
    );
  }
}

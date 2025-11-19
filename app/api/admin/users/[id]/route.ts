import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { updateUserInfo, updateUserPassword, deleteUser } from '@/lib/db/users-helpers';
import { ApiResponse } from '@/types';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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

    const body = await request.json();
    const { action, username, email, role } = body;

    if (action === 'reset-password') {
      await updateUserPassword(id, '123456');
      return NextResponse.json<ApiResponse>(
        { success: true, message: 'Password reset to 123456' },
        { status: 200 }
      );
    }

    if (action === 'update-info') {
      if (!username || !email) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Username and email are required' },
          { status: 400 }
        );
      }
      
      const updateData: { username: string; email: string; role?: 'admin' | 'user' } = { username, email };
      if (role) {
        updateData.role = role;
      }
      
      await updateUserInfo(id, updateData);
      return NextResponse.json<ApiResponse>(
        { success: true, message: 'User info updated' },
        { status: 200 }
      );
    }

    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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

    // Prevent admin from deleting themselves
    if (payload.userId === id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    await deleteUser(id);

    return NextResponse.json<ApiResponse>(
      { success: true, message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}

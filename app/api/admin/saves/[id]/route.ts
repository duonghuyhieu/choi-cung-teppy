import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { deleteSaveById } from '@/lib/db/saves-helpers';
import { ApiResponse } from '@/types';

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

    await deleteSaveById(id);

    return NextResponse.json<ApiResponse>(
      { success: true, message: 'Save deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete save error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to delete save' },
      { status: 500 }
    );
  }
}

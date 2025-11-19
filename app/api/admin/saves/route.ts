import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { getAllPublicSaves } from '@/lib/db/saves-helpers';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
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

    const saves = await getAllPublicSaves();

    return NextResponse.json<ApiResponse>(
      { success: true, data: saves },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get saves error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to get saves' },
      { status: 500 }
    );
  }
}

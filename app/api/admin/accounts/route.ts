import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { ApiResponse } from '@/types';
import { supabaseAdmin } from '@/lib/supabase/client';

// GET /api/admin/accounts - Get all accounts with game info (admin only)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // optional filter: steam_offline or steam_online

    let query = supabaseAdmin
      .from('game_accounts')
      .select(`
        *,
        game:games(id, name),
        user:users(id, username, email)
      `)
      .order('created_at', { ascending: false });

    // Filter by type if provided
    if (type === 'steam_offline' || type === 'steam_online') {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Failed to fetch accounts',
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: data || [],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get accounts error:', error);

    if (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden')) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: error.message,
        },
        { status: error.message.includes('Unauthorized') ? 401 : 403 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to fetch accounts',
      },
      { status: 500 }
    );
  }
}

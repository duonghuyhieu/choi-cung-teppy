import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { supabaseAdmin } from '@/lib/supabase/client';
import { ApiResponse, SaveFile } from '@/types';

interface SaveFileWithGame extends SaveFile {
  game?: {
    id: string;
    name: string;
    description: string | null;
  };
}

// GET /api/saves/me - Get current user's saves
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    // Fetch saves with game info
    const { data, error } = await supabaseAdmin
      .from('save_files')
      .select(`
        *,
        game:games(id, name, description)
      `)
      .eq('user_id', session.userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json<ApiResponse<SaveFileWithGame[]>>(
      {
        success: true,
        data: data || [],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get my saves error:', error);

    if (error.message.includes('Unauthorized')) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: error.message,
        },
        { status: 401 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to get saves',
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { ApiResponse, CreateDownloadLinkDto, DownloadLink } from '@/types';

// Helper function to validate UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// GET /api/games/[id]/links - Get all download links for a game
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate UUID
    if (!id || id === 'undefined' || !isValidUUID(id)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Invalid game ID',
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('download_links')
      .select('*')
      .eq('game_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching download links:', error);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<DownloadLink[]>>(
      {
        success: true,
        data: data || [],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/games/[id]/links:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to fetch download links',
      },
      { status: 500 }
    );
  }
}

// POST /api/games/[id]/links - Add a download link
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate UUID
    if (!id || id === 'undefined' || !isValidUUID(id)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Invalid game ID',
        },
        { status: 400 }
      );
    }

    const body: Omit<CreateDownloadLinkDto, 'game_id'> = await request.json();

    // Validate input
    if (!body.title || !body.url) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Title and URL are required',
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('download_links')
      .insert({
        game_id: id,
        title: body.title,
        url: body.url,
        file_size: null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating download link:', error);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<DownloadLink>>(
      {
        success: true,
        data,
        message: 'Download link added successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/games/[id]/links:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to add download link',
      },
      { status: 500 }
    );
  }
}

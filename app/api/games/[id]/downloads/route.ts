import { NextRequest, NextResponse } from 'next/server';
import { createDownloadLink, getDownloadLinksByGame } from '@/lib/db/games';
import { requireAdmin } from '@/lib/auth/session';
import { ApiResponse, DownloadLink, CreateDownloadLinkDto } from '@/types';

// GET /api/games/[id]/downloads - Get download links for a game
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const links = await getDownloadLinksByGame(id);

    return NextResponse.json<ApiResponse<DownloadLink[]>>(
      {
        success: true,
        data: links,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get download links error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to get download links',
      },
      { status: 500 }
    );
  }
}

// POST /api/games/[id]/downloads - Create download link (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id: gameId } = await params;
    const body = await request.json();

    // Validate input
    if (!body.url || !body.platform) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'URL and platform are required',
        },
        { status: 400 }
      );
    }

    const linkData: CreateDownloadLinkDto = {
      game_id: gameId,
      url: body.url,
      platform: body.platform,
      version: body.version,
      file_size: body.file_size,
    };

    const link = await createDownloadLink(linkData);

    return NextResponse.json<ApiResponse<DownloadLink>>(
      {
        success: true,
        data: link,
        message: 'Download link created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create download link error:', error);

    if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
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
        error: error.message || 'Failed to create download link',
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getGameWithLinks, updateGameWithLinks, deleteGame } from '@/lib/db/games';
import { requireAdmin } from '@/lib/auth/session';
import { ApiResponse, GameWithLinks, UpdateGameDto } from '@/types';

// GET /api/games/[id] - Get game by ID with download links
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const game = await getGameWithLinks(id);

    if (!game) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Game not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<GameWithLinks>>(
      {
        success: true,
        data: game,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get game error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to get game',
      },
      { status: 500 }
    );
  }
}

// PUT /api/games/[id] - Update game with links (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body: UpdateGameDto = await request.json();

    // Validate links if provided
    if (body.links && body.links.length > 0) {
      for (const link of body.links) {
        if (!link.title || !link.url) {
          return NextResponse.json<ApiResponse>(
            {
              success: false,
              error: 'Each link must have a title and URL',
            },
            { status: 400 }
          );
        }
      }
    }

    const gameWithLinks = await updateGameWithLinks(id, body);

    return NextResponse.json<ApiResponse<GameWithLinks>>(
      {
        success: true,
        data: gameWithLinks,
        message: 'Game updated successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update game error:', error);

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
        error: error.message || 'Failed to update game',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/games/[id] - Delete game (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await deleteGame(id);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Game deleted successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete game error:', error);

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
        error: error.message || 'Failed to delete game',
      },
      { status: 500 }
    );
  }
}

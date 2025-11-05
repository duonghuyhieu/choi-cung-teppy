import { NextRequest, NextResponse } from 'next/server';
import { getAllGames, createGameWithLinks, getDownloadLinksByGame } from '@/lib/db/games';
import { requireAuth, requireAdmin } from '@/lib/auth/session';
import { ApiResponse, Game, GameWithLinks, CreateGameDto } from '@/types';

// GET /api/games - Get all games with download links (public)
export async function GET(request: NextRequest) {
  try {
    const games = await getAllGames();

    // Fetch download links for each game
    const gamesWithLinks: GameWithLinks[] = await Promise.all(
      games.map(async (game) => {
        const download_links = await getDownloadLinksByGame(game.id);
        return { ...game, download_links };
      })
    );

    return NextResponse.json<ApiResponse<GameWithLinks[]>>(
      {
        success: true,
        data: gamesWithLinks,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get games error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to get games',
      },
      { status: 500 }
    );
  }
}

// POST /api/games - Create game with links (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body: CreateGameDto = await request.json();

    // Validate input
    if (!body.name || !body.save_file_path) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Name and save_file_path are required',
        },
        { status: 400 }
      );
    }

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

    const gameWithLinks = await createGameWithLinks(body, session.userId);

    return NextResponse.json<ApiResponse<GameWithLinks>>(
      {
        success: true,
        data: gameWithLinks,
        message: 'Game created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create game error:', error);

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
        error: error.message || 'Failed to create game',
      },
      { status: 500 }
    );
  }
}

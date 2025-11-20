import { NextRequest, NextResponse } from 'next/server';
import { getAllGames, createGame, createMultipleDownloadLinks, getDownloadLinksByGame } from '@/lib/db/games';
import { createGameAccount } from '@/lib/db/game-accounts';
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

// POST /api/games - Create game with links and accounts (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();

    // Validate input
    if (!body.name) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Name is required',
        },
        { status: 400 }
      );
    }

    // Derive game_type from provided data
    const gameTypes: string[] = [];
    if (body.crack && body.crack.length > 0) gameTypes.push('crack');
    if (body.steam_on && body.steam_on.length > 0) gameTypes.push('steam_online');
    if (body.steam_off && body.steam_off.length > 0) gameTypes.push('steam_offline');

    // Create game
    const gameData: CreateGameDto = {
      name: body.name,
      description: body.description,
      thumbnail_url: body.thumbnail_url,
      save_file_path: body.save_file_path,
      game_type: gameTypes as any, // Cast to match GameType[]
    };

    // We use createGame directly instead of createGameWithLinks because we handle links/accounts manually
    const game = await createGame(gameData, session.userId);

    // 1. Handle Crack Links
    if (body.crack && body.crack.length > 0) {
      const linksToCreate = body.crack.map((link: any) => ({
        title: link.title,
        url: link.url,
        version_type: 'crack'
      }));
      await createMultipleDownloadLinks(game.id, linksToCreate);
    }

    // 2. Handle Steam Online Accounts
    if (body.steam_on && body.steam_on.length > 0) {
      for (const acc of body.steam_on) {
        await createGameAccount({
          game_id: game.id,
          type: 'steam_online',
          username: acc.username,
          password: acc.password,
          guard_link: acc.guard_link
        });
      }
    }

    // 3. Handle Steam Offline Accounts
    if (body.steam_off && body.steam_off.length > 0) {
      for (const acc of body.steam_off) {
        await createGameAccount({
          game_id: game.id,
          type: 'steam_offline',
          username: acc.username,
          password: acc.password,
          guard_link: acc.guard_link
        });
      }
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: game,
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

    // Check if it's a duplicate username error
    if (error.message.includes('đã tồn tại trong hệ thống')) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: error.message,
        },
        { status: 409 } // Conflict status code
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

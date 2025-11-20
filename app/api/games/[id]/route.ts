import { NextRequest, NextResponse } from 'next/server';
import { getGameWithLinks, updateGame, deleteGame, createMultipleDownloadLinks, deleteDownloadLink, getDownloadLinksByGame } from '@/lib/db/games';
import { createGameAccount, getAccountsByGame, deleteGameAccount } from '@/lib/db/game-accounts';
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

// PUT /api/games/[id] - Update game with links and accounts (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    // Derive game_type from provided data
    const gameTypes: string[] = [];
    if (body.crack && body.crack.length > 0) gameTypes.push('crack');
    if (body.steam_on && body.steam_on.length > 0) gameTypes.push('steam_online');
    if (body.steam_off && body.steam_off.length > 0) gameTypes.push('steam_offline');

    // Update game basic info
    const gameData: UpdateGameDto = {
      name: body.name,
      description: body.description,
      thumbnail_url: body.thumbnail_url,
      save_file_path: body.save_file_path,
      game_type: gameTypes.length > 0 ? gameTypes as any : undefined,
    };

    await updateGame(id, gameData);

    // 1. Handle Crack Links - Delete old and create new
    if (body.crack !== undefined) {
      const existingLinks = await getDownloadLinksByGame(id);
      const crackLinks = existingLinks.filter(l => l.version_type === 'crack');

      // Delete old crack links
      for (const link of crackLinks) {
        await deleteDownloadLink(link.id);
      }

      // Create new crack links
      if (body.crack.length > 0) {
        const linksToCreate = body.crack.map((link: any) => ({
          title: link.title,
          url: link.url,
          version_type: 'crack'
        }));
        await createMultipleDownloadLinks(id, linksToCreate);
      }
    }

    // 2. Handle Steam Online Accounts - Delete old and create new
    if (body.steam_on !== undefined) {
      const existingAccounts = await getAccountsByGame(id);
      const onlineAccounts = existingAccounts.filter((a: any) => a.type === 'steam_online');

      // Delete old steam online accounts
      for (const acc of onlineAccounts) {
        await deleteGameAccount(acc.id);
      }

      // Create new steam online accounts
      if (body.steam_on.length > 0) {
        for (const acc of body.steam_on) {
          await createGameAccount({
            game_id: id,
            type: 'steam_online',
            username: acc.username,
            password: acc.password,
            guard_link: acc.guard_link
          });
        }
      }
    }

    // 3. Handle Steam Offline Accounts - Delete old and create new
    if (body.steam_off !== undefined) {
      const existingAccounts = await getAccountsByGame(id);
      const offlineAccounts = existingAccounts.filter((a: any) => a.type === 'steam_offline');

      // Delete old steam offline accounts
      for (const acc of offlineAccounts) {
        await deleteGameAccount(acc.id);
      }

      // Create new steam offline accounts
      if (body.steam_off.length > 0) {
        for (const acc of body.steam_off) {
          await createGameAccount({
            game_id: id,
            type: 'steam_offline',
            username: acc.username,
            password: acc.password,
            guard_link: acc.guard_link
          });
        }
      }
    }

    // Get updated game with links
    const gameWithLinks = await getGameWithLinks(id);

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

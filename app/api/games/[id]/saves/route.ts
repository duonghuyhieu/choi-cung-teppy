import { NextRequest, NextResponse } from 'next/server';
import { getSaveFilesByGame, upsertSaveFile } from '@/lib/db/saves';
import { uploadFile, deleteFile } from '@/lib/storage/files';
import { requireAuth, getSession } from '@/lib/auth/session';
import { ApiResponse, SaveFileWithUser, SaveFile } from '@/types';

// GET /api/games/[id]/saves - Get save files for a game
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: gameId } = await params;

    // Get session (optional - if no session, only show public saves)
    const session = await getSession();
    const userId = session?.userId;

    const saves = await getSaveFilesByGame(gameId, userId);

    return NextResponse.json<ApiResponse<SaveFileWithUser[]>>(
      {
        success: true,
        data: saves,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get save files error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to get save files',
      },
      { status: 500 }
    );
  }
}

// POST /api/games/[id]/saves - Upload save file (authenticated users)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id: gameId } = await params;

    // Parse FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;
    const description = formData.get('description') as string | null;
    const isPublic = formData.get('isPublic') === 'true';

    // Validate input
    if (!file || !fileName) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'File and fileName are required',
        },
        { status: 400 }
      );
    }

    // Upload file to storage
    const { url: fileUrl, size: fileSize } = await uploadFile(
      file,
      session.userId,
      gameId
    );

    // Upsert save file record (update if exists, create if not)
    const { saveFile, isUpdate, oldFileUrl } = await upsertSaveFile(
      {
        game_id: gameId,
        file_name: fileName,
        description: description || undefined,
        is_public: isPublic,
      },
      session.userId,
      fileUrl,
      fileSize
    );

    // If updated, delete old file from storage
    if (isUpdate && oldFileUrl && oldFileUrl !== fileUrl) {
      try {
        await deleteFile(oldFileUrl);
      } catch (error) {
        console.error('Failed to delete old file:', error);
        // Don't fail the request if old file deletion fails
      }
    }

    return NextResponse.json<ApiResponse<SaveFile>>(
      {
        success: true,
        data: saveFile,
        message: isUpdate
          ? 'Save file updated successfully'
          : 'Save file uploaded successfully',
      },
      { status: isUpdate ? 200 : 201 }
    );
  } catch (error: any) {
    console.error('Upload save file error:', error);

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
        error: error.message || 'Failed to upload save file',
      },
      { status: 500 }
    );
  }
}

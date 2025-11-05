import { NextRequest, NextResponse } from 'next/server';
import {
  getSaveFileById,
  updateSaveFile,
  deleteSaveFile,
  checkSaveFileOwnership,
} from '@/lib/db/saves';
import { deleteFile, getSignedDownloadUrl } from '@/lib/storage/files';
import { requireAuth, getSession, isAdmin } from '@/lib/auth/session';
import { ApiResponse, SaveFile, DownloadSaveResponse } from '@/types';

// GET /api/saves/[id] - Get download URL for save file
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    const saveFile = await getSaveFileById(id);

    if (!saveFile) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Save file not found',
        },
        { status: 404 }
      );
    }

    // Check access: public OR owned by user
    const hasAccess =
      saveFile.is_public || (session && saveFile.user_id === session.userId);

    if (!hasAccess) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Access denied',
        },
        { status: 403 }
      );
    }

    // Get signed download URL (expires in 1 hour)
    const downloadUrl = await getSignedDownloadUrl(saveFile.file_url);

    const response: DownloadSaveResponse = {
      download_url: downloadUrl,
    };

    return NextResponse.json<ApiResponse<DownloadSaveResponse>>(
      {
        success: true,
        data: response,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get save file download URL error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to get download URL',
      },
      { status: 500 }
    );
  }
}

// PUT /api/saves/[id] - Update save file (owner or admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    const saveFile = await getSaveFileById(id);

    if (!saveFile) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Save file not found',
        },
        { status: 404 }
      );
    }

    // Check ownership or admin
    const isOwner = saveFile.user_id === session.userId;
    const isAdminUser = await isAdmin();

    if (!isOwner && !isAdminUser) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Access denied',
        },
        { status: 403 }
      );
    }

    // Update save file
    const updatedSaveFile = await updateSaveFile(id, {
      description: body.description,
      is_public: body.is_public,
    });

    return NextResponse.json<ApiResponse<SaveFile>>(
      {
        success: true,
        data: updatedSaveFile,
        message: 'Save file updated successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update save file error:', error);

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
        error: error.message || 'Failed to update save file',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/saves/[id] - Delete save file (owner or admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const saveFile = await getSaveFileById(id);

    if (!saveFile) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Save file not found',
        },
        { status: 404 }
      );
    }

    // Check ownership or admin
    const isOwner = saveFile.user_id === session.userId;
    const isAdminUser = await isAdmin();

    if (!isOwner && !isAdminUser) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Access denied',
        },
        { status: 403 }
      );
    }

    // Delete file from storage
    await deleteFile(saveFile.file_url);

    // Delete database record
    await deleteSaveFile(id);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Save file deleted successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete save file error:', error);

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
        error: error.message || 'Failed to delete save file',
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { ApiResponse } from '@/types';

// DELETE /api/games/[id]/links/[linkId] - Delete a download link
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; linkId: string }> }
) {
  try {
    const { linkId } = await params;

    const { error } = await supabaseAdmin
      .from('download_links')
      .delete()
      .eq('id', linkId);

    if (error) {
      console.error('Error deleting download link:', error);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Download link deleted successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in DELETE /api/games/[id]/links/[linkId]:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to delete download link',
      },
      { status: 500 }
    );
  }
}

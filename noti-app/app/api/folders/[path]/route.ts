import { NextResponse } from 'next/server';
import { renameFolder, deleteFolder } from '@/lib/folders';

// PUT /api/folders/[path] - Rename a folder
export async function PUT(
  request: Request,
  { params }: { params: { path: string } }
) {
  try {
    const { newName } = await request.json();
    const folderPath = decodeURIComponent(params.path);

    if (!newName) {
      return NextResponse.json(
        { error: 'New folder name is required' },
        { status: 400 }
      );
    }

    const folder = await renameFolder(folderPath, newName);
    return NextResponse.json(folder);
  } catch (error: any) {
    console.error('Error renaming folder:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to rename folder' },
      { status: 500 }
    );
  }
}

// DELETE /api/folders/[path] - Delete a folder
export async function DELETE(
  request: Request,
  { params }: { params: { path: string } }
) {
  try {
    const folderPath = decodeURIComponent(params.path);
    await deleteFolder(folderPath);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting folder:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete folder' },
      { status: 500 }
    );
  }
}

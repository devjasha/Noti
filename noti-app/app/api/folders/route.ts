import { NextResponse } from 'next/server';
import { getAllFolders, createFolder } from '@/lib/folders';

// GET /api/folders - Get all folders
export async function GET() {
  try {
    const folders = await getAllFolders();
    return NextResponse.json(folders);
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folders' },
      { status: 500 }
    );
  }
}

// POST /api/folders - Create a new folder
export async function POST(request: Request) {
  try {
    const { path } = await request.json();

    if (!path) {
      return NextResponse.json(
        { error: 'Folder path is required' },
        { status: 400 }
      );
    }

    const folder = await createFolder(path);
    return NextResponse.json(folder, { status: 201 });
  } catch (error: any) {
    console.error('Error creating folder:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create folder' },
      { status: 500 }
    );
  }
}

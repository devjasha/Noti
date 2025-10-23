import { NextRequest, NextResponse } from 'next/server';
import { getFileAtCommit } from '@/lib/notes';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filePath = searchParams.get('file');
    const commit = searchParams.get('commit');

    if (!filePath || !commit) {
      return NextResponse.json(
        { error: 'File path and commit hash are required' },
        { status: 400 }
      );
    }

    const note = await getFileAtCommit(filePath, commit);

    if (!note) {
      return NextResponse.json(
        { error: 'File not found at specified commit' },
        { status: 404 }
      );
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error('Error getting file at commit:', error);
    return NextResponse.json(
      { error: 'Failed to get file version' },
      { status: 500 }
    );
  }
}

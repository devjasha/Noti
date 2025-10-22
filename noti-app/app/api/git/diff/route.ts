import { NextRequest, NextResponse } from 'next/server';
import { getDiff, getFileDiff } from '@/lib/notes';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const staged = searchParams.get('staged') === 'true';
    const filePath = searchParams.get('file');

    let diff: string;

    if (filePath) {
      diff = await getFileDiff(filePath, staged);
    } else {
      diff = await getDiff(staged);
    }

    return NextResponse.json({ diff });
  } catch (error) {
    console.error('Error getting diff:', error);
    return NextResponse.json(
      { error: 'Failed to get diff' },
      { status: 500 }
    );
  }
}

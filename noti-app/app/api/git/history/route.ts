import { NextRequest, NextResponse } from 'next/server';
import { getFileHistory } from '@/lib/notes';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filePath = searchParams.get('file');

    if (!filePath) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      );
    }

    const history = await getFileHistory(filePath);

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error getting file history:', error);
    return NextResponse.json(
      { error: 'Failed to get file history' },
      { status: 500 }
    );
  }
}

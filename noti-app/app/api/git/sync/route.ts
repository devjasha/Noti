import { NextResponse } from 'next/server';
import { pullChanges, pushChanges } from '@/lib/notes';

export async function POST(request: Request) {
  try {
    const { action } = await request.json();

    if (action === 'pull') {
      const result = await pullChanges();
      return NextResponse.json(result);
    } else if (action === 'push') {
      const result = await pushChanges();
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "pull" or "push"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error syncing:', error);
    return NextResponse.json(
      { error: 'Failed to sync' },
      { status: 500 }
    );
  }
}

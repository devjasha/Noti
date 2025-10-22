import { NextResponse } from 'next/server';
import { commitChanges } from '@/lib/notes';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Commit message is required' },
        { status: 400 }
      );
    }

    const result = await commitChanges(message);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error committing changes:', error);
    return NextResponse.json(
      { error: 'Failed to commit changes' },
      { status: 500 }
    );
  }
}

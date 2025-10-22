import { NextResponse } from 'next/server';
import { getGitRemotes } from '@/lib/notes';

export async function GET() {
  try {
    const remotes = await getGitRemotes();
    return NextResponse.json(remotes);
  } catch (error) {
    console.error('Error getting git remotes:', error);
    return NextResponse.json(
      { error: 'Failed to get git remotes' },
      { status: 500 }
    );
  }
}

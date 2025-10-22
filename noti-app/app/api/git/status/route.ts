import { NextResponse } from 'next/server';
import { getGitStatus } from '@/lib/notes';

export async function GET() {
  try {
    const status = await getGitStatus();

    // Debug: log raw status
    console.log('Raw git status:', JSON.stringify(status, null, 2));

    // Transform the status to match the expected format
    const transformed = {
      modified: status.modified || [],
      created: (status.created && status.created.length > 0) ? status.created : (status.not_added || []),
      deleted: status.deleted || [],
      current: status.current || 'main',
    };

    console.log('Transformed status:', JSON.stringify(transformed, null, 2));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error getting git status:', error);
    return NextResponse.json(
      { error: 'Failed to get git status' },
      { status: 500 }
    );
  }
}

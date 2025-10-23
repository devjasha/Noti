import { NextRequest, NextResponse } from 'next/server';
import { getAllThemes, saveTheme, validateTheme } from '@/lib/themes';

/**
 * GET /api/themes
 * Get all available themes
 */
export async function GET() {
  try {
    const themes = await getAllThemes();
    return NextResponse.json(themes);
  } catch (error) {
    console.error('Error fetching themes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch themes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/themes
 * Create a new theme
 */
export async function POST(request: NextRequest) {
  try {
    const theme = await request.json();

    if (!validateTheme(theme)) {
      return NextResponse.json(
        { error: 'Invalid theme format' },
        { status: 400 }
      );
    }

    const success = await saveTheme(theme);

    if (success) {
      return NextResponse.json(theme);
    } else {
      return NextResponse.json(
        { error: 'Failed to save theme' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating theme:', error);
    return NextResponse.json(
      { error: 'Failed to create theme' },
      { status: 500 }
    );
  }
}

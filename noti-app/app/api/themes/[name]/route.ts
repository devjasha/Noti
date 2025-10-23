import { NextRequest, NextResponse } from 'next/server';
import { getTheme, saveTheme, deleteTheme, validateTheme } from '@/lib/themes';

/**
 * GET /api/themes/[name]
 * Get a specific theme
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const theme = await getTheme(params.name);

    if (!theme) {
      return NextResponse.json(
        { error: 'Theme not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(theme);
  } catch (error) {
    console.error('Error fetching theme:', error);
    return NextResponse.json(
      { error: 'Failed to fetch theme' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/themes/[name]
 * Update a theme
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
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
        { error: 'Failed to update theme' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error updating theme:', error);
    return NextResponse.json(
      { error: 'Failed to update theme' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/themes/[name]
 * Delete a theme
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const success = await deleteTheme(params.name);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to delete theme' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error deleting theme:', error);
    return NextResponse.json(
      { error: 'Failed to delete theme' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getTemplate, deleteTemplate } from '@/lib/templates';

// GET /api/templates/[slug] - Get a single template
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const template = await getTemplate(params.slug);

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

// DELETE /api/templates/[slug] - Delete a template
export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const success = await deleteTemplate(params.slug);

    if (!success) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}

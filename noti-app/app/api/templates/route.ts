import { NextResponse } from 'next/server';
import { getAllTemplates, createTemplate } from '@/lib/templates';

// GET /api/templates - Get all templates
export async function GET() {
  try {
    const templates = await getAllTemplates();
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST /api/templates - Create a new template
export async function POST(request: Request) {
  try {
    const { slug, content, metadata } = await request.json();

    if (!slug || !content || !metadata?.title) {
      return NextResponse.json(
        { error: 'Slug, content, and title are required' },
        { status: 400 }
      );
    }

    const template = await createTemplate(slug, content, metadata);
    return NextResponse.json(template, { status: 201 });
  } catch (error: any) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create template' },
      { status: 500 }
    );
  }
}

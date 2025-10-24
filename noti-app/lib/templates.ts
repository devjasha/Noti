import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { getNotesDir, Note } from './notes.js';

export interface Template {
  slug: string;
  title: string;
  content: string;
  description?: string;
  created: string;
}

const TEMPLATES_DIR_NAME = '.templates';

/**
 * Get the templates directory path
 */
export function getTemplatesDir(): string {
  return path.join(getNotesDir(), TEMPLATES_DIR_NAME);
}

/**
 * Ensure templates directory exists
 */
async function ensureTemplatesDir() {
  const templatesDir = getTemplatesDir();
  try {
    await fs.access(templatesDir);
  } catch (error) {
    await fs.mkdir(templatesDir, { recursive: true });
  }
}

/**
 * Get all templates
 */
export async function getAllTemplates(): Promise<Template[]> {
  await ensureTemplatesDir();
  const templatesDir = getTemplatesDir();

  try {
    const files = await fs.readdir(templatesDir);
    const templateFiles = files.filter(f => f.endsWith('.md'));

    const templates = await Promise.all(
      templateFiles.map(async (file) => {
        const filePath = path.join(templatesDir, file);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const { data, content } = matter(fileContent);

        const slug = file.replace(/\.md$/, '');
        return {
          slug,
          title: data.title || slug,
          content,
          description: data.description,
          created: data.created || new Date().toISOString(),
        };
      })
    );

    return templates.sort((a, b) => a.title.localeCompare(b.title));
  } catch (error) {
    return [];
  }
}

/**
 * Get a single template by slug
 */
export async function getTemplate(slug: string): Promise<Template | null> {
  await ensureTemplatesDir();
  const templatesDir = getTemplatesDir();
  const filePath = path.join(templatesDir, `${slug}.md`);

  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    return {
      slug,
      title: data.title || slug,
      content,
      description: data.description,
      created: data.created || new Date().toISOString(),
    };
  } catch (error) {
    return null;
  }
}

/**
 * Create a new template
 */
export async function createTemplate(
  slug: string,
  content: string,
  metadata: { title: string; description?: string }
): Promise<Template> {
  await ensureTemplatesDir();
  const templatesDir = getTemplatesDir();

  // Sanitize slug
  const sanitizedSlug = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!sanitizedSlug) {
    throw new Error('Invalid template name');
  }

  const filePath = path.join(templatesDir, `${sanitizedSlug}.md`);

  // Check if template already exists
  try {
    await fs.access(filePath);
    throw new Error('Template already exists');
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  // Prepare frontmatter
  const frontmatter = {
    title: metadata.title,
    description: metadata.description,
    created: new Date().toISOString(),
    isTemplate: true,
  };

  // Write template file
  const fileContent = matter.stringify(content, frontmatter);
  await fs.writeFile(filePath, fileContent, 'utf-8');

  return {
    slug: sanitizedSlug,
    title: metadata.title,
    content,
    description: metadata.description,
    created: frontmatter.created,
  };
}

/**
 * Delete a template
 */
export async function deleteTemplate(slug: string): Promise<boolean> {
  await ensureTemplatesDir();
  const templatesDir = getTemplatesDir();
  const filePath = path.join(templatesDir, `${slug}.md`);

  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Create a note from a template
 */
export async function createNoteFromTemplate(
  templateSlug: string,
  noteSlug: string,
  metadata: { title: string; tags?: string[]; folder?: string }
): Promise<{ slug: string; content: string; metadata: any }> {
  const template = await getTemplate(templateSlug);
  if (!template) {
    throw new Error('Template not found');
  }

  // Prepare note data with template content
  return {
    slug: noteSlug,
    content: template.content,
    metadata: {
      title: metadata.title,
      tags: metadata.tags || [],
      folder: metadata.folder || '',
    },
  };
}

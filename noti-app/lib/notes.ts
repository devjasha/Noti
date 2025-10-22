import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { simpleGit, SimpleGit } from 'simple-git';

export interface Note {
  slug: string;
  title: string;
  content: string;
  tags: string[];
  created: string;
  modified: string;
  folder: string;
  filePath: string;
}

export interface NoteMetadata {
  slug: string;
  title: string;
  tags: string[];
  created: string;
  modified: string;
  folder: string;
}

const NOTES_DIR = process.env.NOTES_DIR || path.join(process.cwd(), '..', 'notes');

/**
 * Get the absolute path to the notes directory
 */
export function getNotesDir(): string {
  return NOTES_DIR;
}

/**
 * Initialize git client for the notes directory
 */
function getGit(): SimpleGit {
  return simpleGit(NOTES_DIR);
}

/**
 * Get all markdown files recursively from a directory
 */
async function getMarkdownFiles(dir: string, baseDir: string = dir): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        return getMarkdownFiles(fullPath, baseDir);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        return [path.relative(baseDir, fullPath)];
      }
      return [];
    })
  );
  return files.flat();
}

/**
 * Parse a markdown file and extract metadata
 */
async function parseNote(relativePath: string): Promise<Note> {
  const fullPath = path.join(NOTES_DIR, relativePath);
  const fileContent = await fs.readFile(fullPath, 'utf-8');
  const { data, content } = matter(fileContent);

  const stats = await fs.stat(fullPath);
  const folder = path.dirname(relativePath);
  const slug = relativePath.replace(/\.md$/, '').replace(/\\/g, '/');

  return {
    slug,
    title: data.title || path.basename(relativePath, '.md'),
    content,
    tags: data.tags || [],
    created: data.created || stats.birthtime.toISOString(),
    modified: stats.mtime.toISOString(),
    folder: folder === '.' ? '' : folder,
    filePath: relativePath,
  };
}

/**
 * Get metadata for a note without loading the full content
 */
async function getNoteMetadata(relativePath: string): Promise<NoteMetadata> {
  const note = await parseNote(relativePath);
  return {
    slug: note.slug,
    title: note.title,
    tags: note.tags,
    created: note.created,
    modified: note.modified,
    folder: note.folder,
  };
}

/**
 * Get all notes metadata
 */
export async function getAllNotes(): Promise<NoteMetadata[]> {
  const files = await getMarkdownFiles(NOTES_DIR);
  const notes = await Promise.all(
    files.map(file => getNoteMetadata(file))
  );
  return notes.sort((a, b) =>
    new Date(b.modified).getTime() - new Date(a.modified).getTime()
  );
}

/**
 * Get a single note by slug
 */
export async function getNote(slug: string): Promise<Note | null> {
  try {
    const relativePath = `${slug}.md`.replace(/\//g, path.sep);
    return await parseNote(relativePath);
  } catch (error) {
    return null;
  }
}

/**
 * Create or update a note
 */
export async function saveNote(
  slug: string,
  content: string,
  metadata: { title?: string; tags?: string[] }
): Promise<Note> {
  const relativePath = `${slug}.md`.replace(/\//g, path.sep);
  const fullPath = path.join(NOTES_DIR, relativePath);

  // Ensure directory exists
  await fs.mkdir(path.dirname(fullPath), { recursive: true });

  // Prepare frontmatter
  const frontmatter = {
    title: metadata.title || path.basename(slug),
    tags: metadata.tags || [],
    created: new Date().toISOString(),
  };

  // Check if file exists to preserve created date
  try {
    const existing = await parseNote(relativePath);
    frontmatter.created = existing.created;
  } catch (error) {
    // File doesn't exist, use new date
  }

  // Write file with frontmatter
  const fileContent = matter.stringify(content, frontmatter);
  await fs.writeFile(fullPath, fileContent, 'utf-8');

  return parseNote(relativePath);
}

/**
 * Delete a note
 */
export async function deleteNote(slug: string): Promise<boolean> {
  try {
    const relativePath = `${slug}.md`.replace(/\//g, path.sep);
    const fullPath = path.join(NOTES_DIR, relativePath);
    await fs.unlink(fullPath);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get git status for notes
 */
export async function getGitStatus() {
  const git = getGit();
  return await git.status();
}

/**
 * Commit changes with a message
 */
export async function commitChanges(message: string) {
  const git = getGit();
  await git.add('.');
  await git.commit(message);
  return await git.log({ maxCount: 1 });
}

/**
 * Push changes to remote
 */
export async function pushChanges() {
  const git = getGit();
  return await git.push();
}

/**
 * Pull changes from remote
 */
export async function pullChanges() {
  const git = getGit();
  return await git.pull();
}

/**
 * Get recent git commits
 */
export async function getRecentCommits(limit: number = 10) {
  const git = getGit();
  return await git.log({ maxCount: limit });
}

/**
 * Get git remote information
 */
export async function getGitRemotes() {
  const git = getGit();
  const remotes = await git.getRemotes(true);
  return remotes;
}

/**
 * Get git diff for unstaged or staged changes
 * Includes untracked files as full additions
 */
export async function getDiff(staged: boolean = false) {
  const git = getGit();

  // Get regular diff for tracked files
  const diff = staged
    ? await git.diff(['--cached'])
    : await git.diff();

  // For unstaged, also include untracked files
  if (!staged) {
    const status = await git.status();
    const untrackedFiles = status.not_added || [];

    if (untrackedFiles.length > 0) {
      let untrackedDiff = diff;

      // Read and format each untracked file as a new addition
      for (const filePath of untrackedFiles) {
        const fullPath = path.join(NOTES_DIR, filePath);
        try {
          const content = await fs.readFile(fullPath, 'utf-8');
          const lines = content.split('\n');

          // Format as git diff
          untrackedDiff += `\ndiff --git a/${filePath} b/${filePath}\n`;
          untrackedDiff += `new file mode 100644\n`;
          untrackedDiff += `index 0000000..0000000\n`;
          untrackedDiff += `--- /dev/null\n`;
          untrackedDiff += `+++ b/${filePath}\n`;
          untrackedDiff += `@@ -0,0 +1,${lines.length} @@\n`;
          untrackedDiff += lines.map(line => `+${line}`).join('\n') + '\n';
        } catch (error) {
          console.error(`Error reading untracked file ${filePath}:`, error);
        }
      }

      return untrackedDiff;
    }
  }

  return diff;
}

/**
 * Get diff for a specific file
 */
export async function getFileDiff(filePath: string, staged: boolean = false) {
  const git = getGit();
  const diff = staged
    ? await git.diff(['--cached', '--', filePath])
    : await git.diff(['--', filePath]);
  return diff;
}

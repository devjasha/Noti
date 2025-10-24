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

/**
 * Get the absolute path to the notes directory
 * This reads from environment variable each time to support dynamic directory changes
 */
export function getNotesDir(): string {
  return process.env.NOTES_DIR || path.join(process.cwd(), '..', 'notes');
}

/**
 * Initialize git client for the notes directory
 */
function getGit(): SimpleGit {
  return simpleGit(getNotesDir());
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
  const fullPath = path.join(getNotesDir(), relativePath);
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
 * Get all notes metadata (excluding templates)
 */
export async function getAllNotes(): Promise<NoteMetadata[]> {
  const files = await getMarkdownFiles(getNotesDir());
  // Filter out files from .templates directory
  const noteFiles = files.filter(file => !file.startsWith('.templates'));
  const notes = await Promise.all(
    noteFiles.map(file => getNoteMetadata(file))
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
  const fullPath = path.join(getNotesDir(), relativePath);

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
    const fullPath = path.join(getNotesDir(), relativePath);
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
  const status = await git.status();

  // Categorize files by their status
  const modified: string[] = [];
  const created: string[] = [];
  const deleted: string[] = [];

  // Process each file in the status
  status.files.forEach(file => {
    // Check working directory status (unstaged changes)
    if (file.working_dir === 'M' || file.index === 'M') {
      modified.push(file.path);
    } else if (file.working_dir === 'D' || file.index === 'D') {
      deleted.push(file.path);
    } else if (file.working_dir === '?' || file.index === 'A') {
      // '?' means untracked, 'A' means added to staging
      created.push(file.path);
    }
  });

  // Convert to plain object for IPC serialization
  return {
    current: status.current,
    tracking: status.tracking,
    ahead: status.ahead,
    behind: status.behind,
    files: status.files.map(f => ({ path: f.path, index: f.index, working_dir: f.working_dir })),
    staged: status.staged,
    modified,
    created,
    deleted,
    renamed: status.renamed,
    conflicted: status.conflicted,
    not_added: status.not_added,
    isClean: status.isClean(),
  };
}

/**
 * Commit changes with a message
 */
export async function commitChanges(message: string) {
  const git = getGit();
  await git.add('.');
  await git.commit(message);
  const log = await git.log({ maxCount: 1 });
  // Convert to plain object for IPC serialization
  return {
    latest: log.latest ? {
      hash: log.latest.hash,
      date: log.latest.date,
      message: log.latest.message,
      author_name: log.latest.author_name,
      author_email: log.latest.author_email,
    } : null,
    total: log.total,
  };
}

/**
 * Push changes to remote
 */
export async function pushChanges() {
  const git = getGit();
  const result = await git.push();
  // Convert to plain object
  return { success: true, result: String(result) };
}

/**
 * Pull changes from remote
 */
export async function pullChanges() {
  const git = getGit();
  const result = await git.pull();
  // Convert to plain object
  return {
    summary: result.summary,
    files: result.files,
    insertions: result.insertions,
    deletions: result.deletions,
  };
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
        const fullPath = path.join(getNotesDir(), filePath);
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

export interface FileCommit {
  hash: string;
  date: string;
  message: string;
  author_name: string;
  author_email: string;
  refs: string;
}

/**
 * Get commit history for a specific file
 * Uses --follow to track file renames
 */
export async function getFileHistory(filePath: string): Promise<FileCommit[]> {
  const git = getGit();

  // Use --follow to track file renames, and format output for easy parsing
  const log = await git.log({
    file: filePath,
    '--follow': null,
  });

  return log.all.map(commit => ({
    hash: commit.hash,
    date: commit.date,
    message: commit.message,
    author_name: commit.author_name,
    author_email: commit.author_email,
    refs: commit.refs,
  }));
}

/**
 * Get file content at a specific commit
 */
export async function getFileAtCommit(filePath: string, commitHash: string): Promise<Note | null> {
  const git = getGit();

  try {
    // Get file content at specific commit
    const content = await git.show([`${commitHash}:${filePath}`]);

    // Parse the content with gray-matter
    const { data, content: markdownContent } = matter(content);

    const slug = filePath.replace(/\.md$/, '').replace(/\\/g, '/');
    const folder = path.dirname(filePath);

    return {
      slug,
      title: data.title || path.basename(filePath, '.md'),
      content: markdownContent,
      tags: data.tags || [],
      created: data.created || '',
      modified: data.modified || '',
      folder: folder === '.' ? '' : folder,
      filePath,
    };
  } catch (error) {
    console.error(`Error getting file at commit ${commitHash}:`, error);
    return null;
  }
}

/**
 * Move a note to a different folder
 */
export async function moveNote(slug: string, targetFolder: string): Promise<Note> {
  const oldRelativePath = `${slug}.md`.replace(/\//g, path.sep);
  const oldFullPath = path.join(getNotesDir(), oldRelativePath);

  // Read the existing note first
  const note = await parseNote(oldRelativePath);
  if (!note) {
    throw new Error('Note not found');
  }

  // Calculate new path
  const fileName = path.basename(slug) + '.md';
  const newRelativePath = targetFolder
    ? path.join(targetFolder, fileName)
    : fileName;
  const newFullPath = path.join(getNotesDir(), newRelativePath);

  // Ensure target directory exists
  await fs.mkdir(path.dirname(newFullPath), { recursive: true });

  // Move the file (preserves git history better than copy + delete)
  await fs.rename(oldFullPath, newFullPath);

  // Return the note with updated slug and folder
  return parseNote(newRelativePath);
}

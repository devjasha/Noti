import fs from 'fs/promises';
import path from 'path';
import { getNotesDir } from './notes.js';

export interface Folder {
  name: string;
  path: string;
  noteCount: number;
}

/**
 * Get all folders in the notes directory
 */
export async function getAllFolders(): Promise<Folder[]> {
  const notesDir = getNotesDir();
  const folders: Folder[] = [];

  async function scanDirectory(dir: string, relativePath: string = '') {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        const folderPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
        const fullPath = path.join(dir, entry.name);

        // Count notes in this folder
        const files = await fs.readdir(fullPath);
        const noteCount = files.filter(f => f.endsWith('.md')).length;

        folders.push({
          name: entry.name,
          path: folderPath,
          noteCount,
        });

        // Recursively scan subdirectories
        await scanDirectory(fullPath, folderPath);
      }
    }
  }

  await scanDirectory(notesDir);
  return folders.sort((a, b) => a.path.localeCompare(b.path));
}

/**
 * Validate folder name
 */
export function validateFolderName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Folder name cannot be empty' };
  }

  if (name.includes('/') || name.includes('\\')) {
    return { valid: false, error: 'Folder name cannot contain slashes' };
  }

  if (name.startsWith('.')) {
    return { valid: false, error: 'Folder name cannot start with a dot' };
  }

  if (/[<>:"|?*]/.test(name)) {
    return { valid: false, error: 'Folder name contains invalid characters' };
  }

  return { valid: true };
}

/**
 * Create a new folder
 */
export async function createFolder(folderPath: string): Promise<Folder> {
  const notesDir = getNotesDir();
  const fullPath = path.join(notesDir, folderPath);

  // Validate folder name
  const folderName = path.basename(folderPath);
  const validation = validateFolderName(folderName);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Check if folder already exists
  try {
    await fs.access(fullPath);
    throw new Error('Folder already exists');
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  // Create folder
  await fs.mkdir(fullPath, { recursive: true });

  return {
    name: folderName,
    path: folderPath,
    noteCount: 0,
  };
}

/**
 * Rename a folder
 */
export async function renameFolder(oldPath: string, newName: string): Promise<Folder> {
  const notesDir = getNotesDir();
  const oldFullPath = path.join(notesDir, oldPath);

  // Validate new name
  const validation = validateFolderName(newName);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Calculate new path
  const parentDir = path.dirname(oldPath);
  const newPath = parentDir === '.' ? newName : `${parentDir}/${newName}`;
  const newFullPath = path.join(notesDir, newPath);

  // Check if target already exists
  try {
    await fs.access(newFullPath);
    throw new Error('A folder with that name already exists');
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  // Rename folder
  await fs.rename(oldFullPath, newFullPath);

  // Count notes in renamed folder
  const files = await fs.readdir(newFullPath);
  const noteCount = files.filter(f => f.endsWith('.md')).length;

  return {
    name: newName,
    path: newPath,
    noteCount,
  };
}

/**
 * Delete a folder (only if empty)
 */
export async function deleteFolder(folderPath: string): Promise<boolean> {
  const notesDir = getNotesDir();
  const fullPath = path.join(notesDir, folderPath);

  // Check if folder exists
  try {
    const stats = await fs.stat(fullPath);
    if (!stats.isDirectory()) {
      throw new Error('Not a folder');
    }
  } catch (error) {
    throw new Error('Folder not found');
  }

  // Check if folder is empty
  const entries = await fs.readdir(fullPath);
  if (entries.length > 0) {
    throw new Error('Folder is not empty');
  }

  // Delete folder
  await fs.rmdir(fullPath);
  return true;
}

/**
 * Check if a folder is empty
 */
export async function isFolderEmpty(folderPath: string): Promise<boolean> {
  const notesDir = getNotesDir();
  const fullPath = path.join(notesDir, folderPath);

  try {
    const entries = await fs.readdir(fullPath);
    return entries.length === 0;
  } catch (error) {
    return true; // If folder doesn't exist, consider it "empty"
  }
}

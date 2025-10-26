import { ipcMain } from 'electron';
import Store from 'electron-store';
import { getAllNotes, getNote, saveNote, deleteNote, getAllTags } from '../../lib/notes.js';
import fs from 'fs/promises';
import { simpleGit } from 'simple-git';

async function getNotesDirectory(store: Store): Promise<string> {
  const notesDir = store.get('notesDirectory') as string;
  if (!notesDir) {
    throw new Error('Notes directory not configured');
  }

  // Ensure directory exists
  try {
    await fs.mkdir(notesDir, { recursive: true });

    // Ensure git is initialized
    const git = simpleGit(notesDir);
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      await git.init();
    }
  } catch (error) {
    console.error('Error ensuring notes directory:', error);
  }

  return notesDir;
}

export function registerNoteHandlers(ipcMainInstance: typeof ipcMain, store: Store) {
  // Get all notes
  ipcMainInstance.handle('notes:get-all', async () => {
    try {
      const notesDir = await getNotesDirectory(store);
      process.env.NOTES_DIR = notesDir;

      const notes = await getAllNotes();
      return notes;
    } catch (error) {
      console.error('Error getting notes:', error);
      throw error;
    }
  });

  // Get specific note
  ipcMainInstance.handle('notes:get', async (event, slug: string) => {
    try {
      const notesDir = await getNotesDirectory(store);
      process.env.NOTES_DIR = notesDir;

      const note = await getNote(slug);
      return note;
    } catch (error) {
      console.error('Error getting note:', error);
      throw error;
    }
  });

  // Create note
  ipcMainInstance.handle('notes:create', async (event, data: { slug: string; content: string; metadata: any }) => {
    try {
      const notesDir = await getNotesDirectory(store);
      process.env.NOTES_DIR = notesDir;

      const result = await saveNote(data.slug, data.content, data.metadata);
      return result;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  });

  // Update note
  ipcMainInstance.handle('notes:update', async (event, slug: string, data: { content: string; metadata: any }) => {
    try {
      const notesDir = await getNotesDirectory(store);
      process.env.NOTES_DIR = notesDir;

      const result = await saveNote(slug, data.content, data.metadata);
      return result;
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  });

  // Delete note
  ipcMainInstance.handle('notes:delete', async (event, slug: string) => {
    try {
      const notesDir = await getNotesDirectory(store);
      process.env.NOTES_DIR = notesDir;

      await deleteNote(slug);
      return { success: true };
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  });

  // Move note
  ipcMainInstance.handle('notes:move', async (event, slug: string, targetFolder: string) => {
    try {
      const notesDir = await getNotesDirectory(store);
      process.env.NOTES_DIR = notesDir;

      // Get the current note
      const note = await getNote(slug);
      if (!note) {
        throw new Error('Note not found');
      }

      // Create new slug in target folder
      const baseName = slug.split('/').pop();
      const newSlug = targetFolder ? `${targetFolder}/${baseName}` : baseName!;

      // Save to new location
      await saveNote(newSlug, note.content, { title: note.title, tags: note.tags });

      // Delete old note
      await deleteNote(slug);

      return { slug: newSlug };
    } catch (error) {
      console.error('Error moving note:', error);
      throw error;
    }
  });

  // Get all tags
  ipcMainInstance.handle('tags:get-all', async () => {
    try {
      const notesDir = await getNotesDirectory(store);
      process.env.NOTES_DIR = notesDir;

      const tags = await getAllTags();
      return tags;
    } catch (error) {
      console.error('Error getting tags:', error);
      throw error;
    }
  });
}

const path = require('path');
const fs = require('fs').promises;
const { getNotes, getNote, createNote, updateNote, deleteNote, moveNote } = require('../../lib/notes');

async function getNotesDirectory(store) {
  const notesDir = store.get('notesDirectory');
  if (!notesDir) {
    throw new Error('Notes directory not configured');
  }
  return notesDir;
}

function registerNoteHandlers(ipcMain, store) {
  // Get all notes
  ipcMain.handle('notes:get-all', async () => {
    try {
      const notesDir = await getNotesDirectory(store);

      // Set the environment variable for the notes lib to use
      process.env.NOTES_DIR = notesDir;

      const notes = await getNotes();
      return notes;
    } catch (error) {
      console.error('Error getting notes:', error);
      throw error;
    }
  });

  // Get specific note
  ipcMain.handle('notes:get', async (event, slug) => {
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
  ipcMain.handle('notes:create', async (event, data) => {
    try {
      const notesDir = await getNotesDirectory(store);
      process.env.NOTES_DIR = notesDir;

      const result = await createNote(data);
      return result;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  });

  // Update note
  ipcMain.handle('notes:update', async (event, slug, data) => {
    try {
      const notesDir = await getNotesDirectory(store);
      process.env.NOTES_DIR = notesDir;

      const result = await updateNote(slug, data);
      return result;
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  });

  // Delete note
  ipcMain.handle('notes:delete', async (event, slug) => {
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
  ipcMain.handle('notes:move', async (event, slug, targetFolder) => {
    try {
      const notesDir = await getNotesDirectory(store);
      process.env.NOTES_DIR = notesDir;

      const result = await moveNote(slug, targetFolder);
      return result;
    } catch (error) {
      console.error('Error moving note:', error);
      throw error;
    }
  });
}

module.exports = { registerNoteHandlers };

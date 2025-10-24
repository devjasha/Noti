import { ipcMain } from 'electron';
import Store from 'electron-store';
import { getFolders, createFolder, renameFolder, deleteFolder } from '../../lib/folders';

async function getNotesDirectory(store: Store): Promise<string> {
  const notesDir = store.get('notesDirectory') as string;
  if (!notesDir) {
    throw new Error('Notes directory not configured');
  }
  return notesDir;
}

export function registerFolderHandlers(ipcMainInstance: typeof ipcMain, store: Store) {
  // Get all folders
  ipcMainInstance.handle('folders:get-all', async () => {
    try {
      const notesDir = await getNotesDirectory(store);
      process.env.NOTES_DIR = notesDir;

      const folders = await getFolders();
      return folders;
    } catch (error) {
      console.error('Error getting folders:', error);
      throw error;
    }
  });

  // Create folder
  ipcMainInstance.handle('folders:create', async (event, folderPath: string) => {
    try {
      const notesDir = await getNotesDirectory(store);
      process.env.NOTES_DIR = notesDir;

      const result = await createFolder(folderPath);
      return result;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  });

  // Rename folder
  ipcMainInstance.handle('folders:rename', async (event, folderPath: string, newName: string) => {
    try {
      const notesDir = await getNotesDirectory(store);
      process.env.NOTES_DIR = notesDir;

      const result = await renameFolder(folderPath, newName);
      return result;
    } catch (error) {
      console.error('Error renaming folder:', error);
      throw error;
    }
  });

  // Delete folder
  ipcMainInstance.handle('folders:delete', async (event, folderPath: string) => {
    try {
      const notesDir = await getNotesDirectory(store);
      process.env.NOTES_DIR = notesDir;

      await deleteFolder(folderPath);
      return { success: true };
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  });
}

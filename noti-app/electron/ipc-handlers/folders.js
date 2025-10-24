const { getFolders, createFolder, renameFolder, deleteFolder } = require('../../lib/folders');

async function getNotesDirectory(store) {
  const notesDir = store.get('notesDirectory');
  if (!notesDir) {
    throw new Error('Notes directory not configured');
  }
  return notesDir;
}

function registerFolderHandlers(ipcMain, store) {
  // Get all folders
  ipcMain.handle('folders:get-all', async () => {
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
  ipcMain.handle('folders:create', async (event, folderPath) => {
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
  ipcMain.handle('folders:rename', async (event, folderPath, newName) => {
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
  ipcMain.handle('folders:delete', async (event, folderPath) => {
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

module.exports = { registerFolderHandlers };

const {
  getGitStatus,
  commitChanges,
  syncWithRemote,
  getFileDiff,
  getFileHistory,
  getFileAtCommit,
  getGitRemotes,
} = require('../../lib/notes');

async function getNotesDirectory(store) {
  const notesDir = store.get('notesDirectory');
  if (!notesDir) {
    throw new Error('Notes directory not configured');
  }
  return notesDir;
}

function registerGitHandlers(ipcMain, store) {
  // Get git status
  ipcMain.handle('git:status', async () => {
    try {
      const notesDir = await getNotesDirectory(store);
      process.env.NOTES_DIR = notesDir;

      const status = await getGitStatus();
      return status;
    } catch (error) {
      console.error('Error getting git status:', error);
      throw error;
    }
  });

  // Commit changes
  ipcMain.handle('git:commit', async (event, message) => {
    try {
      const notesDir = await getNotesDirectory(store);
      process.env.NOTES_DIR = notesDir;

      const result = await commitChanges(message);
      return result;
    } catch (error) {
      console.error('Error committing changes:', error);
      throw error;
    }
  });

  // Sync with remote (pull/push)
  ipcMain.handle('git:sync', async (event, action) => {
    try {
      const notesDir = await getNotesDirectory(store);
      process.env.NOTES_DIR = notesDir;

      const result = await syncWithRemote(action);
      return result;
    } catch (error) {
      console.error('Error syncing with remote:', error);
      throw error;
    }
  });

  // Get file diff
  ipcMain.handle('git:diff', async (event, file) => {
    try {
      const notesDir = await getNotesDirectory(store);
      process.env.NOTES_DIR = notesDir;

      const diff = await getFileDiff(file);
      return diff;
    } catch (error) {
      console.error('Error getting diff:', error);
      throw error;
    }
  });

  // Get file history
  ipcMain.handle('git:history', async (event, file) => {
    try {
      const notesDir = await getNotesDirectory(store);
      process.env.NOTES_DIR = notesDir;

      const history = await getFileHistory(file);
      return history;
    } catch (error) {
      console.error('Error getting history:', error);
      throw error;
    }
  });

  // Get file at specific commit
  ipcMain.handle('git:file-version', async (event, file, commitHash) => {
    try {
      const notesDir = await getNotesDirectory(store);
      process.env.NOTES_DIR = notesDir;

      const content = await getFileAtCommit(file, commitHash);
      return content;
    } catch (error) {
      console.error('Error getting file version:', error);
      throw error;
    }
  });

  // Get git remotes
  ipcMain.handle('git:remotes', async () => {
    try {
      const notesDir = await getNotesDirectory(store);
      process.env.NOTES_DIR = notesDir;

      const remotes = await getGitRemotes();
      return remotes;
    } catch (error) {
      console.error('Error getting git remotes:', error);
      throw error;
    }
  });
}

module.exports = { registerGitHandlers };

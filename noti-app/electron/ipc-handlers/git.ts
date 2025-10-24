import { ipcMain } from 'electron';
import Store from 'electron-store';
import {
  getGitStatus as libGetGitStatus,
  commitChanges,
  pushChanges,
  pullChanges,
  getDiff,
  getFileHistory,
  getFileAtCommit,
  getGitRemotes,
} from '../../lib/notes.js';

async function getNotesDirectory(store: Store): Promise<string> {
  const notesDir = store.get('notesDirectory') as string;
  if (!notesDir) {
    throw new Error('Notes directory not configured');
  }
  return notesDir;
}

export function registerGitHandlers(ipcMainInstance: typeof ipcMain, store: Store) {
  // Get git status
  ipcMainInstance.handle('git:status', async () => {
    try {
      const notesDir = await getNotesDirectory(store);
      process.env.NOTES_DIR = notesDir;

      const status = await libGetGitStatus();
      return status;
    } catch (error) {
      console.error('Error getting git status:', error);
      throw error;
    }
  });

  // Commit changes
  ipcMainInstance.handle('git:commit', async (event, message: string) => {
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
  ipcMainInstance.handle('git:sync', async (event, action: 'pull' | 'push') => {
    try {
      const notesDir = await getNotesDirectory(store);
      process.env.NOTES_DIR = notesDir;

      const result = action === 'pull' ? await pullChanges() : await pushChanges();
      return result;
    } catch (error) {
      console.error('Error syncing with remote:', error);
      throw error;
    }
  });

  // Get file diff
  ipcMainInstance.handle('git:diff', async (event, file?: string) => {
    try {
      const notesDir = await getNotesDirectory(store);
      process.env.NOTES_DIR = notesDir;

      const diff = await getDiff(false);
      return { diff };
    } catch (error) {
      console.error('Error getting diff:', error);
      throw error;
    }
  });

  // Get file history
  ipcMainInstance.handle('git:history', async (event, file: string) => {
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
  ipcMainInstance.handle('git:file-version', async (event, file: string, commitHash: string) => {
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
  ipcMainInstance.handle('git:remotes', async () => {
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

import { ipcMain } from 'electron';
import Store from 'electron-store';
import { getAllThemes, getTheme, saveTheme, deleteTheme } from '../../lib/themes.js';

export function registerThemeHandlers(ipcMainInstance: typeof ipcMain, store: Store) {
  // Get all themes
  ipcMainInstance.handle('themes:get-all', async () => {
    try {
      const themes = await getAllThemes();
      return themes;
    } catch (error) {
      console.error('Error getting themes:', error);
      throw error;
    }
  });

  // Get specific theme
  ipcMainInstance.handle('themes:get', async (event, name: string) => {
    try {
      const theme = await getTheme(name);
      return theme;
    } catch (error) {
      console.error('Error getting theme:', error);
      throw error;
    }
  });

  // Create theme
  ipcMainInstance.handle('themes:create', async (event, data: any) => {
    try {
      const result = await saveTheme(data);
      return result;
    } catch (error) {
      console.error('Error creating theme:', error);
      throw error;
    }
  });

  // Delete theme
  ipcMainInstance.handle('themes:delete', async (event, name: string) => {
    try {
      await deleteTheme(name);
      return { success: true };
    } catch (error) {
      console.error('Error deleting theme:', error);
      throw error;
    }
  });
}

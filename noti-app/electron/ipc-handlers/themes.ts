import { ipcMain } from 'electron';
import Store from 'electron-store';
import { getThemes, getTheme, createTheme, deleteTheme } from '../../lib/themes';

export function registerThemeHandlers(ipcMainInstance: typeof ipcMain, store: Store) {
  // Get all themes
  ipcMainInstance.handle('themes:get-all', async () => {
    try {
      const themes = await getThemes();
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
      const result = await createTheme(data);
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

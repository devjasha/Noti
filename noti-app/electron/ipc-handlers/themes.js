const { getThemes, getTheme, createTheme, deleteTheme } = require('../../lib/themes');

function registerThemeHandlers(ipcMain, store) {
  // Get all themes
  ipcMain.handle('themes:get-all', async () => {
    try {
      const themes = await getThemes();
      return themes;
    } catch (error) {
      console.error('Error getting themes:', error);
      throw error;
    }
  });

  // Get specific theme
  ipcMain.handle('themes:get', async (event, name) => {
    try {
      const theme = await getTheme(name);
      return theme;
    } catch (error) {
      console.error('Error getting theme:', error);
      throw error;
    }
  });

  // Create theme
  ipcMain.handle('themes:create', async (event, data) => {
    try {
      const result = await createTheme(data);
      return result;
    } catch (error) {
      console.error('Error creating theme:', error);
      throw error;
    }
  });

  // Delete theme
  ipcMain.handle('themes:delete', async (event, name) => {
    try {
      await deleteTheme(name);
      return { success: true };
    } catch (error) {
      console.error('Error deleting theme:', error);
      throw error;
    }
  });
}

module.exports = { registerThemeHandlers };

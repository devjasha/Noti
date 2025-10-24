const { getTemplates, getTemplate, createTemplate, deleteTemplate } = require('../../lib/templates');

async function getNotesDirectory(store) {
  const notesDir = store.get('notesDirectory');
  if (!notesDir) {
    throw new Error('Notes directory not configured');
  }
  return notesDir;
}

function registerTemplateHandlers(ipcMain, store) {
  // Get all templates
  ipcMain.handle('templates:get-all', async () => {
    try {
      const notesDir = await getNotesDirectory(store);
      process.env.NOTES_DIR = notesDir;

      const templates = await getTemplates();
      return templates;
    } catch (error) {
      console.error('Error getting templates:', error);
      throw error;
    }
  });

  // Get specific template
  ipcMain.handle('templates:get', async (event, slug) => {
    try {
      const notesDir = await getNotesDirectory(store);
      process.env.NOTES_DIR = notesDir;

      const template = await getTemplate(slug);
      return template;
    } catch (error) {
      console.error('Error getting template:', error);
      throw error;
    }
  });

  // Create template
  ipcMain.handle('templates:create', async (event, data) => {
    try {
      const notesDir = await getNotesDirectory(store);
      process.env.NOTES_DIR = notesDir;

      const result = await createTemplate(data);
      return result;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  });

  // Delete template
  ipcMain.handle('templates:delete', async (event, slug) => {
    try {
      const notesDir = await getNotesDirectory(store);
      process.env.NOTES_DIR = notesDir;

      await deleteTemplate(slug);
      return { success: true };
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  });
}

module.exports = { registerTemplateHandlers };

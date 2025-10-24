import { ipcMain } from 'electron';
import Store from 'electron-store';
import { getAllTemplates, getTemplate, createTemplate, deleteTemplate } from '../../lib/templates.js';

async function getNotesDirectory(store: Store): Promise<string> {
  const notesDir = store.get('notesDirectory') as string;
  if (!notesDir) {
    throw new Error('Notes directory not configured');
  }
  return notesDir;
}

export function registerTemplateHandlers(ipcMainInstance: typeof ipcMain, store: Store) {
  // Get all templates
  ipcMainInstance.handle('templates:get-all', async () => {
    try {
      const notesDir = await getNotesDirectory(store);
      process.env.NOTES_DIR = notesDir;

      const templates = await getAllTemplates();
      return templates;
    } catch (error) {
      console.error('Error getting templates:', error);
      throw error;
    }
  });

  // Get specific template
  ipcMainInstance.handle('templates:get', async (event, slug: string) => {
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
  ipcMainInstance.handle('templates:create', async (event, data: any) => {
    try {
      const notesDir = await getNotesDirectory(store);
      process.env.NOTES_DIR = notesDir;

      const { slug, content, metadata } = data;
      const result = await createTemplate(slug, content, metadata);
      return result;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  });

  // Delete template
  ipcMainInstance.handle('templates:delete', async (event, slug: string) => {
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

import { ipcMain, dialog, BrowserWindow, protocol } from 'electron';
import * as fs from 'fs/promises';
import * as path from 'path';

export function registerImageHandlers(getMainWindow: () => BrowserWindow | null) {
  // Resolve relative image path to base64 data URL
  ipcMain.handle('images:resolve-path', async (_event, relativePath: string, noteSlug: string) => {
    try {
      const notesDir = process.env.NOTES_DIR;
      if (!notesDir) {
        throw new Error('Notes directory not set');
      }

      // Handle paths that may start with ../ (for notes in subfolders)
      // Remove leading ../ and join with notesDir
      const cleanPath = relativePath.replace(/^(\.\.\/)+/, '');
      const absolutePath = path.join(notesDir, cleanPath);

      console.log('[IPC] Resolving image:', { relativePath, cleanPath, absolutePath });

      // Check if file exists
      try {
        await fs.access(absolutePath);
      } catch {
        console.error('[IPC] File not found:', absolutePath);
        return {
          success: false,
          error: 'File not found',
        };
      }

      // Read file and convert to base64
      const fileBuffer = await fs.readFile(absolutePath);
      const ext = path.extname(absolutePath);
      const mimeType = getMimeType(ext);
      const base64Data = fileBuffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64Data}`;

      return {
        success: true,
        url: dataUrl,
        absolutePath,
      };
    } catch (error) {
      console.error('Error resolving image path:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  // Copy image to .attachments folder
  ipcMain.handle('images:copy-to-attachments', async (_event, filePath: string, noteSlug: string) => {
    try {
      console.log('[IPC] copy-to-attachments called:', { filePath, noteSlug });

      const notesDir = process.env.NOTES_DIR;
      if (!notesDir) {
        throw new Error('Notes directory not set');
      }

      if (!filePath) {
        throw new Error('File path is required');
      }

      if (!noteSlug) {
        throw new Error('Note slug is required');
      }

      // Create .attachments directory structure
      const attachmentsDir = path.join(notesDir, '.attachments', noteSlug);
      await fs.mkdir(attachmentsDir, { recursive: true });

      // Get original filename
      const originalName = path.basename(filePath);
      const ext = path.extname(originalName);
      const baseName = path.basename(originalName, ext);

      // Check if file already exists, add number suffix if needed
      let fileName = originalName;
      let counter = 1;
      while (await fileExists(path.join(attachmentsDir, fileName))) {
        fileName = `${baseName}-${counter}${ext}`;
        counter++;
      }

      // Copy file
      const destPath = path.join(attachmentsDir, fileName);
      await fs.copyFile(filePath, destPath);

      // Read file and convert to base64 for immediate display
      const fileBuffer = await fs.readFile(destPath);
      const mimeType = getMimeType(ext);
      const base64Data = fileBuffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64Data}`;

      // Calculate relative path from the note's location to the image
      // noteSlug can be 'my-note' or 'folder/my-note'
      // If noteSlug has folders, we need to go up with ../
      const folderDepth = noteSlug.split('/').length - 1;
      const upPath = folderDepth > 0 ? '../'.repeat(folderDepth) : '';
      const relativePath = `${upPath}.attachments/${noteSlug}/${fileName}`;

      console.log('[IPC] Generated paths:', { noteSlug, folderDepth, relativePath });

      return {
        success: true,
        path: relativePath,
        absolutePath: destPath,
        dataUrl: dataUrl,
      };
    } catch (error) {
      console.error('Error copying image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  // Select image file dialog
  ipcMain.handle('images:select-file', async (_event) => {
    try {
      const mainWindow = getMainWindow();
      if (!mainWindow) {
        return {
          success: false,
          error: 'Main window not available',
        };
      }

      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
          { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'] },
        ],
        title: 'Select Image',
      });

      if (!result.canceled && result.filePaths.length > 0) {
        return {
          success: true,
          path: result.filePaths[0],
        };
      }

      return {
        success: false,
        canceled: true,
      };
    } catch (error) {
      console.error('Error selecting image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });
}

// Helper function to check if file exists
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Helper function to get MIME type from file extension
function getMimeType(ext: string): string {
  const mimeTypes: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.bmp': 'image/bmp',
  };
  return mimeTypes[ext.toLowerCase()] || 'image/png';
}

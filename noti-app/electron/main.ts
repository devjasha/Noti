import { app, BrowserWindow, ipcMain, dialog, Menu, MenuItemConstructorOptions } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import Store from 'electron-store';
import electronUpdater from 'electron-updater';
const { autoUpdater } = electronUpdater;
import { simpleGit } from 'simple-git';

// ES module equivalents for __dirname and __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import IPC handlers
import { registerNoteHandlers } from './ipc-handlers/notes.js';
import { registerFolderHandlers } from './ipc-handlers/folders.js';
import { registerTemplateHandlers } from './ipc-handlers/templates.js';
import { registerThemeHandlers } from './ipc-handlers/themes.js';
import { registerGitHandlers } from './ipc-handlers/git.js';

const store = new Store();
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow: BrowserWindow | null;

// Auto-updater configuration
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

async function ensureNotesDirectoryInitialized(notesDir: string) {
  try {
    // Ensure directory exists
    await fs.mkdir(notesDir, { recursive: true });

    const git = simpleGit(notesDir);

    // Check if it's already a git repository
    const isRepo = await git.checkIsRepo();

    if (!isRepo) {
      console.log('Initializing git repository in:', notesDir);
      await git.init();

      // Create a README if directory is empty
      try {
        const files = await fs.readdir(notesDir);
        if (files.length === 1 && files[0] === '.git') {
          const readmePath = path.join(notesDir, 'README.md');
          await fs.writeFile(readmePath, '# My Notes\n\nWelcome to Noti!\n');
          await git.add('README.md');
          await git.commit('Initial commit');
        }
      } catch (error) {
        console.error('Error creating initial files:', error);
      }
    }

    // Ensure git user is configured (use global config if available)
    try {
      const config = await git.listConfig();
      const hasUserName = config.all['user.name'];
      const hasUserEmail = config.all['user.email'];

      if (!hasUserName || !hasUserEmail) {
        console.log('Git user not configured, using defaults');
        if (!hasUserName) {
          await git.addConfig('user.name', 'Noti User', false, 'global');
        }
        if (!hasUserEmail) {
          await git.addConfig('user.email', 'user@noti.local', false, 'global');
        }
      }
    } catch (error) {
      console.error('Error checking git config:', error);
    }
  } catch (error) {
    console.error('Error initializing notes directory:', error);
    throw error;
  }
}

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.js');
  console.log('[main] __dirname:', __dirname);
  console.log('[main] preloadPath:', preloadPath);
  console.log('[main] isDev:', isDev);

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
    },
    titleBarStyle: 'default',
    backgroundColor: '#1a1a1a',
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
  }

  // Remove the menu bar entirely (set to null)
  // Note: On macOS, the menu will still appear in the top system bar
  // For Windows/Linux, this removes the in-window menu bar
  Menu.setApplicationMenu(null);

  // Window event handlers
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Check for updates (only in production)
  if (!isDev) {
    checkForUpdates();
  }
}

function createMenu() {
  const template: MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Change Notes Directory',
          click: async () => {
            await selectNotesDirectory();
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Check for Updates',
          click: () => {
            checkForUpdates(true);
          }
        },
        {
          label: 'About Noti',
          click: () => {
            if (mainWindow) {
              dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'About Noti',
                message: 'Noti',
                detail: `Version: ${app.getVersion()}\n\nA personal note-taking system with Git integration.`,
              });
            }
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

async function selectNotesDirectory() {
  if (!mainWindow) return;

  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory'],
    title: 'Select Notes Directory',
    buttonLabel: 'Select',
    message: 'Choose where to store your notes'
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const notesDir = result.filePaths[0];
    store.set('notesDirectory', notesDir);

    // Notify renderer process
    if (mainWindow) {
      mainWindow.webContents.send('notes-directory-changed', notesDir);
    }

    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Notes Directory Updated',
      message: 'Notes directory has been updated. Please reload the application.',
      buttons: ['Reload', 'Later']
    }).then(response => {
      if (response.response === 0 && mainWindow) {
        mainWindow.reload();
      }
    });

    return notesDir;
  }

  return null;
}

async function checkForUpdates(manual = false) {
  if (!mainWindow) return;

  try {
    const result = await autoUpdater.checkForUpdates();

    if (!result || !result.updateInfo) {
      if (manual) {
        dialog.showMessageBox(mainWindow, {
          type: 'info',
          title: 'No Updates',
          message: 'You are running the latest version.'
        });
      }
      return;
    }

    const currentVersion = app.getVersion();
    const latestVersion = result.updateInfo.version;

    if (currentVersion === latestVersion) {
      if (manual) {
        dialog.showMessageBox(mainWindow, {
          type: 'info',
          title: 'No Updates',
          message: 'You are running the latest version.'
        });
      }
      return;
    }

    // Update available
    const response = await dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Available',
      message: `A new version (${latestVersion}) is available. Would you like to download it now?`,
      buttons: ['Download', 'Later'],
      defaultId: 0
    });

    if (response.response === 0) {
      await autoUpdater.downloadUpdate();
    }
  } catch (error) {
    console.error('Error checking for updates:', error);
    if (manual) {
      dialog.showMessageBox(mainWindow, {
        type: 'error',
        title: 'Update Check Failed',
        message: 'Failed to check for updates. Please try again later.'
      });
    }
  }
}

// Auto-updater events
autoUpdater.on('update-downloaded', () => {
  if (mainWindow) {
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Ready',
      message: 'Update downloaded. The application will restart to install the update.',
      buttons: ['Restart', 'Later']
    }).then(response => {
      if (response.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  }
});

autoUpdater.on('error', (error) => {
  console.error('Auto-updater error:', error);
});

// IPC Handlers

// Notes directory setup
ipcMain.handle('get-notes-directory', async () => {
  let notesDir = store.get('notesDirectory') as string;

  if (!notesDir) {
    // First run - prompt user to select directory
    const selectedDir = await selectNotesDirectory();
    if (!selectedDir) {
      // User cancelled - use default
      notesDir = path.join(app.getPath('documents'), 'Noti');
      store.set('notesDirectory', notesDir);
    } else {
      notesDir = selectedDir;
    }
  }

  // Ensure directory exists and is initialized
  await ensureNotesDirectoryInitialized(notesDir);

  return notesDir;
});

ipcMain.handle('select-notes-directory', async () => {
  return await selectNotesDirectory();
});

// Register all IPC handlers
registerNoteHandlers(ipcMain, store);
registerFolderHandlers(ipcMain, store);
registerTemplateHandlers(ipcMain, store);
registerThemeHandlers(ipcMain, store);
registerGitHandlers(ipcMain, store);

// App lifecycle
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});

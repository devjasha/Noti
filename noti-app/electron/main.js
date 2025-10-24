const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { autoUpdater } = require('electron-updater');

// Import IPC handlers
const { registerNoteHandlers } = require('./ipc-handlers/notes');
const { registerFolderHandlers } = require('./ipc-handlers/folders');
const { registerTemplateHandlers } = require('./ipc-handlers/templates');
const { registerThemeHandlers } = require('./ipc-handlers/themes');
const { registerGitHandlers } = require('./ipc-handlers/git');

const store = new Store();
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;

// Auto-updater configuration
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
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

  // Create application menu
  createMenu();

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
  const template = [
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
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Noti',
              message: 'Noti',
              detail: `Version: ${app.getVersion()}\n\nA personal note-taking system with Git integration.`,
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

async function selectNotesDirectory() {
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
      if (response.response === 0) {
        mainWindow.reload();
      }
    });

    return notesDir;
  }

  return null;
}

async function checkForUpdates(manual = false) {
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
});

autoUpdater.on('error', (error) => {
  console.error('Auto-updater error:', error);
});

// IPC Handlers

// Notes directory setup
ipcMain.handle('get-notes-directory', async () => {
  let notesDir = store.get('notesDirectory');

  if (!notesDir) {
    // First run - prompt user to select directory
    notesDir = await selectNotesDirectory();
    if (!notesDir) {
      // User cancelled - use default
      notesDir = path.join(app.getPath('documents'), 'Noti');
      store.set('notesDirectory', notesDir);
    }
  }

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

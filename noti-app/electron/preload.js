const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // Notes API
  notes: {
    getAll: () => ipcRenderer.invoke('notes:get-all'),
    get: (slug) => ipcRenderer.invoke('notes:get', slug),
    create: (data) => ipcRenderer.invoke('notes:create', data),
    update: (slug, data) => ipcRenderer.invoke('notes:update', slug, data),
    delete: (slug) => ipcRenderer.invoke('notes:delete', slug),
    move: (slug, targetFolder) => ipcRenderer.invoke('notes:move', slug, targetFolder),
  },

  // Folders API
  folders: {
    getAll: () => ipcRenderer.invoke('folders:get-all'),
    create: (path) => ipcRenderer.invoke('folders:create', path),
    rename: (path, newName) => ipcRenderer.invoke('folders:rename', path, newName),
    delete: (path) => ipcRenderer.invoke('folders:delete', path),
  },

  // Templates API
  templates: {
    getAll: () => ipcRenderer.invoke('templates:get-all'),
    get: (slug) => ipcRenderer.invoke('templates:get', slug),
    create: (data) => ipcRenderer.invoke('templates:create', data),
    delete: (slug) => ipcRenderer.invoke('templates:delete', slug),
  },

  // Themes API
  themes: {
    getAll: () => ipcRenderer.invoke('themes:get-all'),
    get: (name) => ipcRenderer.invoke('themes:get', name),
    create: (data) => ipcRenderer.invoke('themes:create', data),
    delete: (name) => ipcRenderer.invoke('themes:delete', name),
  },

  // Git API
  git: {
    status: () => ipcRenderer.invoke('git:status'),
    commit: (message) => ipcRenderer.invoke('git:commit', message),
    sync: (action) => ipcRenderer.invoke('git:sync', action),
    diff: (file) => ipcRenderer.invoke('git:diff', file),
    history: (file) => ipcRenderer.invoke('git:history', file),
    fileVersion: (file, commitHash) => ipcRenderer.invoke('git:file-version', file, commitHash),
    remotes: () => ipcRenderer.invoke('git:remotes'),
  },

  // Settings API
  settings: {
    getNotesDirectory: () => ipcRenderer.invoke('get-notes-directory'),
    selectNotesDirectory: () => ipcRenderer.invoke('select-notes-directory'),
  },

  // Event listeners
  onNotesDirectoryChanged: (callback) => {
    ipcRenderer.on('notes-directory-changed', (event, dir) => callback(dir));
  },
});

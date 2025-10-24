import { contextBridge, ipcRenderer } from 'electron';

console.log('[preload] Preload script is running');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // Notes API
  notes: {
    getAll: () => ipcRenderer.invoke('notes:get-all'),
    get: (slug: string) => ipcRenderer.invoke('notes:get', slug),
    create: (data: any) => ipcRenderer.invoke('notes:create', data),
    update: (slug: string, data: any) => ipcRenderer.invoke('notes:update', slug, data),
    delete: (slug: string) => ipcRenderer.invoke('notes:delete', slug),
    move: (slug: string, targetFolder: string) => ipcRenderer.invoke('notes:move', slug, targetFolder),
  },

  // Folders API
  folders: {
    getAll: () => ipcRenderer.invoke('folders:get-all'),
    create: (path: string) => ipcRenderer.invoke('folders:create', path),
    rename: (path: string, newName: string) => ipcRenderer.invoke('folders:rename', path, newName),
    delete: (path: string) => ipcRenderer.invoke('folders:delete', path),
  },

  // Templates API
  templates: {
    getAll: () => ipcRenderer.invoke('templates:get-all'),
    get: (slug: string) => ipcRenderer.invoke('templates:get', slug),
    create: (data: any) => ipcRenderer.invoke('templates:create', data),
    delete: (slug: string) => ipcRenderer.invoke('templates:delete', slug),
  },

  // Themes API
  themes: {
    getAll: () => ipcRenderer.invoke('themes:get-all'),
    get: (name: string) => ipcRenderer.invoke('themes:get', name),
    create: (data: any) => ipcRenderer.invoke('themes:create', data),
    delete: (name: string) => ipcRenderer.invoke('themes:delete', name),
  },

  // Git API
  git: {
    status: () => ipcRenderer.invoke('git:status'),
    commit: (message: string) => ipcRenderer.invoke('git:commit', message),
    sync: (action: string) => ipcRenderer.invoke('git:sync', action),
    diff: (file: string) => ipcRenderer.invoke('git:diff', file),
    history: (file: string) => ipcRenderer.invoke('git:history', file),
    fileVersion: (file: string, commitHash: string) => ipcRenderer.invoke('git:file-version', file, commitHash),
    remotes: () => ipcRenderer.invoke('git:remotes'),
  },

  // Settings API
  settings: {
    getNotesDirectory: () => ipcRenderer.invoke('get-notes-directory'),
    selectNotesDirectory: () => ipcRenderer.invoke('select-notes-directory'),
  },

  // Event listeners
  onNotesDirectoryChanged: (callback: (dir: string) => void) => {
    ipcRenderer.on('notes-directory-changed', (_event, dir: string) => callback(dir));
  },
});

console.log('[preload] window.electron has been exposed via contextBridge');

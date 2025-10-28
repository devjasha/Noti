// Electron API wrapper
// This module provides a unified API that works in both Electron and web environments

import type { ElectronAPI } from '../electron.d';

// Check if running in Electron
export const isElectron = typeof window !== 'undefined' && window.electron !== undefined;

// Debug: Log whether Electron API is available
if (typeof window !== 'undefined') {
  console.log('[electron-api] Running in browser:', typeof window !== 'undefined');
  console.log('[electron-api] window.electron available:', window.electron !== undefined);
  console.log('[electron-api] isElectron:', isElectron);
  if (window.electron) {
    console.log('[electron-api] Electron API keys:', Object.keys(window.electron));
  }
}

// Wrapper functions that use Electron IPC if available, otherwise fall back to HTTP fetch

// Notes API
export const notesAPI = {
  getAll: async () => {
    if (isElectron && window.electron) {
      return await window.electron.notes.getAll();
    }
    const response = await fetch('/api/notes');
    if (!response.ok) throw new Error('Failed to fetch notes');
    return await response.json();
  },

  get: async (slug: string) => {
    if (isElectron && window.electron) {
      return await window.electron.notes.get(slug);
    }
    const response = await fetch(`/api/notes/${slug}`);
    if (!response.ok) throw new Error('Failed to fetch note');
    return await response.json();
  },

  create: async (data: any) => {
    if (isElectron && window.electron) {
      return await window.electron.notes.create(data);
    }
    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create note');
    return await response.json();
  },

  update: async (slug: string, data: any) => {
    if (isElectron && window.electron) {
      return await window.electron.notes.update(slug, data);
    }
    const response = await fetch(`/api/notes/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update note');
    return await response.json();
  },

  delete: async (slug: string) => {
    if (isElectron && window.electron) {
      return await window.electron.notes.delete(slug);
    }
    const response = await fetch(`/api/notes/${slug}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete note');
    return await response.json();
  },

  rename: async (oldSlug: string, newTitle: string) => {
    if (isElectron && window.electron) {
      return await window.electron.notes.rename(oldSlug, newTitle);
    }
    const response = await fetch('/api/notes/rename', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldSlug, newTitle }),
    });
    if (!response.ok) throw new Error('Failed to rename note');
    return await response.json();
  },

  move: async (slug: string, targetFolder: string) => {
    if (isElectron && window.electron) {
      return await window.electron.notes.move(slug, targetFolder);
    }
    const response = await fetch('/api/notes/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, targetFolder }),
    });
    if (!response.ok) throw new Error('Failed to move note');
    return await response.json();
  },
};

// Tags API
export const tagsAPI = {
  getAll: async () => {
    if (isElectron && window.electron) {
      return await window.electron.tags.getAll();
    }
    const response = await fetch('/api/tags');
    if (!response.ok) throw new Error('Failed to fetch tags');
    return await response.json();
  },
};

// Folders API
export const foldersAPI = {
  getAll: async () => {
    if (isElectron && window.electron) {
      return await window.electron.folders.getAll();
    }
    const response = await fetch('/api/folders');
    if (!response.ok) throw new Error('Failed to fetch folders');
    return await response.json();
  },

  create: async (path: string) => {
    if (isElectron && window.electron) {
      return await window.electron.folders.create(path);
    }
    const response = await fetch('/api/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    });
    if (!response.ok) throw new Error('Failed to create folder');
    return await response.json();
  },

  rename: async (path: string, newName: string) => {
    if (isElectron && window.electron) {
      return await window.electron.folders.rename(path, newName);
    }
    const response = await fetch(`/api/folders/${encodeURIComponent(path)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newName }),
    });
    if (!response.ok) throw new Error('Failed to rename folder');
    return await response.json();
  },

  delete: async (path: string) => {
    if (isElectron && window.electron) {
      return await window.electron.folders.delete(path);
    }
    const response = await fetch(`/api/folders/${encodeURIComponent(path)}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete folder');
    return await response.json();
  },
};

// Templates API
export const templatesAPI = {
  getAll: async () => {
    if (isElectron && window.electron) {
      return await window.electron.templates.getAll();
    }
    const response = await fetch('/api/templates');
    if (!response.ok) throw new Error('Failed to fetch templates');
    return await response.json();
  },

  get: async (slug: string) => {
    if (isElectron && window.electron) {
      return await window.electron.templates.get(slug);
    }
    const response = await fetch(`/api/templates/${slug}`);
    if (!response.ok) throw new Error('Failed to fetch template');
    return await response.json();
  },

  create: async (data: any) => {
    if (isElectron && window.electron) {
      return await window.electron.templates.create(data);
    }
    const response = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create template');
    return await response.json();
  },

  delete: async (slug: string) => {
    if (isElectron && window.electron) {
      return await window.electron.templates.delete(slug);
    }
    const response = await fetch(`/api/templates/${slug}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete template');
    return await response.json();
  },
};

// Themes API
export const themesAPI = {
  getAll: async () => {
    if (isElectron && window.electron) {
      return await window.electron.themes.getAll();
    }
    const response = await fetch('/api/themes');
    if (!response.ok) throw new Error('Failed to fetch themes');
    return await response.json();
  },

  get: async (name: string) => {
    if (isElectron && window.electron) {
      return await window.electron.themes.get(name);
    }
    const response = await fetch(`/api/themes/${name}`);
    if (!response.ok) throw new Error('Failed to fetch theme');
    return await response.json();
  },

  create: async (data: any) => {
    if (isElectron && window.electron) {
      return await window.electron.themes.create(data);
    }
    const response = await fetch('/api/themes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create theme');
    return await response.json();
  },

  delete: async (name: string) => {
    if (isElectron && window.electron) {
      return await window.electron.themes.delete(name);
    }
    const response = await fetch(`/api/themes/${name}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete theme');
    return await response.json();
  },
};

// Git API
export const gitAPI = {
  status: async () => {
    if (isElectron && window.electron) {
      return await window.electron.git.status();
    }
    const response = await fetch('/api/git/status');
    if (!response.ok) throw new Error('Failed to fetch git status');
    return await response.json();
  },

  commit: async (message: string) => {
    if (isElectron && window.electron) {
      return await window.electron.git.commit(message);
    }
    const response = await fetch('/api/git/commit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) throw new Error('Failed to commit changes');
    return await response.json();
  },

  sync: async (action: 'pull' | 'push') => {
    if (isElectron && window.electron) {
      return await window.electron.git.sync(action);
    }
    const response = await fetch('/api/git/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    if (!response.ok) throw new Error(`Failed to ${action}`);
    return await response.json();
  },

  diff: async (file?: string) => {
    if (isElectron && window.electron) {
      return await window.electron.git.diff(file);
    }
    const url = file ? `/api/git/diff?file=${encodeURIComponent(file)}` : '/api/git/diff';
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch diff');
    return await response.json();
  },

  history: async (file: string) => {
    if (isElectron && window.electron) {
      return await window.electron.git.history(file);
    }
    const response = await fetch(`/api/git/history?file=${encodeURIComponent(file)}`);
    if (!response.ok) throw new Error('Failed to fetch history');
    return await response.json();
  },

  fileVersion: async (file: string, commitHash: string) => {
    if (isElectron && window.electron) {
      return await window.electron.git.fileVersion(file, commitHash);
    }
    const response = await fetch(`/api/git/file-version?file=${encodeURIComponent(file)}&commit=${commitHash}`);
    if (!response.ok) throw new Error('Failed to fetch file version');
    return await response.json();
  },

  remotes: async () => {
    if (isElectron && window.electron) {
      return await window.electron.git.remotes();
    }
    const response = await fetch('/api/git/remotes');
    if (!response.ok) throw new Error('Failed to fetch remotes');
    return await response.json();
  },
};

// Settings API (Electron only)
export const settingsAPI = {
  getNotesDirectory: async (): Promise<string | null> => {
    if (isElectron && window.electron) {
      return await window.electron.settings.getNotesDirectory();
    }
    return null;
  },

  selectNotesDirectory: async (): Promise<string | null> => {
    if (isElectron && window.electron) {
      return await window.electron.settings.selectNotesDirectory();
    }
    return null;
  },
};

// Images API (Electron only)
export const imagesAPI = {
  copyToAttachments: async (filePath: string, noteSlug: string) => {
    if (isElectron && window.electron) {
      return await window.electron.images.copyToAttachments(filePath, noteSlug);
    }
    return { success: false, error: 'Not in Electron environment' };
  },

  selectFile: async () => {
    if (isElectron && window.electron) {
      return await window.electron.images.selectFile();
    }
    return { success: false, error: 'Not in Electron environment' };
  },

  resolvePath: async (relativePath: string, noteSlug: string) => {
    if (isElectron && window.electron) {
      return await window.electron.images.resolvePath(relativePath, noteSlug);
    }
    return { success: false, error: 'Not in Electron environment' };
  },
};

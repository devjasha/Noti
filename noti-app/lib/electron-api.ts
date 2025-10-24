// Electron API wrapper
// This module provides a unified API that works in both Electron and web environments

// Type definitions for the Electron API exposed via preload
interface ElectronAPI {
  notes: {
    getAll: () => Promise<any>;
    get: (slug: string) => Promise<any>;
    create: (data: any) => Promise<any>;
    update: (slug: string, data: any) => Promise<any>;
    delete: (slug: string) => Promise<any>;
    move: (slug: string, targetFolder: string) => Promise<any>;
  };
  folders: {
    getAll: () => Promise<any>;
    create: (path: string) => Promise<any>;
    rename: (path: string, newName: string) => Promise<any>;
    delete: (path: string) => Promise<any>;
  };
  templates: {
    getAll: () => Promise<any>;
    get: (slug: string) => Promise<any>;
    create: (data: any) => Promise<any>;
    delete: (slug: string) => Promise<any>;
  };
  themes: {
    getAll: () => Promise<any>;
    get: (name: string) => Promise<any>;
    create: (data: any) => Promise<any>;
    delete: (name: string) => Promise<any>;
  };
  git: {
    status: () => Promise<any>;
    commit: (message: string) => Promise<any>;
    sync: (action: 'pull' | 'push') => Promise<any>;
    diff: (file?: string) => Promise<any>;
    history: (file: string) => Promise<any>;
    fileVersion: (file: string, commitHash: string) => Promise<any>;
    remotes: () => Promise<any>;
  };
  settings: {
    getNotesDirectory: () => Promise<string>;
    selectNotesDirectory: () => Promise<string | null>;
  };
  onNotesDirectoryChanged: (callback: (dir: string) => void) => void;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}

// Check if running in Electron
export const isElectron = typeof window !== 'undefined' && window.electron !== undefined;

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

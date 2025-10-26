// Type definitions for Electron IPC API exposed to renderer process

export interface ElectronAPI {
  notes: {
    getAll: () => Promise<any[]>;
    get: (slug: string) => Promise<any>;
    create: (data: { slug: string; content: string; metadata: any }) => Promise<any>;
    update: (slug: string, data: { content: string; metadata: any }) => Promise<any>;
    delete: (slug: string) => Promise<{ success: boolean }>;
    move: (slug: string, targetFolder: string) => Promise<{ slug: string }>;
  };
  folders: {
    getAll: () => Promise<any[]>;
    create: (path: string) => Promise<any>;
    rename: (path: string, newName: string) => Promise<any>;
    delete: (path: string) => Promise<{ success: boolean }>;
  };
  templates: {
    getAll: () => Promise<any[]>;
    get: (slug: string) => Promise<any>;
    create: (data: any) => Promise<any>;
    delete: (slug: string) => Promise<{ success: boolean }>;
  };
  tags: {
    getAll: () => Promise<Array<{ tag: string; count: number }>>;
  };
  themes: {
    getAll: () => Promise<any[]>;
    get: (name: string) => Promise<any>;
    create: (data: any) => Promise<any>;
    delete: (name: string) => Promise<{ success: boolean }>;
  };
  git: {
    status: () => Promise<any>;
    commit: (message: string) => Promise<any>;
    sync: (action: 'pull' | 'push') => Promise<any>;
    diff: (file?: string) => Promise<{ diff: string }>;
    history: (file: string) => Promise<any[]>;
    fileVersion: (file: string, commitHash: string) => Promise<string>;
    remotes: () => Promise<any[]>;
  };
  settings: {
    getNotesDirectory: () => Promise<string>;
    selectNotesDirectory: () => Promise<string | null>;
  };
  images: {
    copyToAttachments: (filePath: string, noteSlug: string) => Promise<{ success: boolean; path?: string; absolutePath?: string; dataUrl?: string; error?: string }>;
    selectFile: () => Promise<{ success: boolean; path?: string; canceled?: boolean; error?: string }>;
    resolvePath: (relativePath: string, noteSlug: string) => Promise<{ success: boolean; url?: string; absolutePath?: string; error?: string }>;
  };
  onNotesDirectoryChanged: (callback: (dir: string) => void) => void;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}

export {};

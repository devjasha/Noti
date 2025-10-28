'use client';

import { useState, useEffect } from 'react';
import { foldersAPI } from '../lib/electron-api';

interface Folder {
  name: string;
  path: string;
  noteCount: number;
}

interface FolderPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (folderPath: string) => void;
  currentFolder?: string;
}

export default function FolderPickerModal({ isOpen, onClose, onSelect, currentFolder }: FolderPickerModalProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchFolders();
      setSelectedFolder(''); // Default to root
    }
  }, [isOpen]);

  const fetchFolders = async () => {
    setLoading(true);
    try {
      const data = await foldersAPI.getAll();
      setFolders(data);
    } catch (error) {
      console.error('Error fetching folders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = () => {
    onSelect(selectedFolder);
    onClose();
  };

  const handleClose = () => {
    setSelectedFolder('');
    onClose();
  };

  if (!isOpen) return null;

  // Build folder list including root
  const folderOptions = [
    { name: 'root', path: '', noteCount: 0 },
    ...folders
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md max-h-[70vh] flex flex-col"
        style={{
          background: 'var(--surface)',
          border: '2px solid var(--border-light)',
          borderRadius: 'var(--radius)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Move to Folder
          </h2>
          {currentFolder && (
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Currently in: {currentFolder || 'root'}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
              Loading folders...
            </div>
          ) : (
            <div className="space-y-1">
              {folderOptions.map((folder) => {
                const isCurrentFolder = currentFolder === folder.path;
                const isSelected = selectedFolder === folder.path;

                return (
                  <button
                    key={folder.path || 'root'}
                    onClick={() => setSelectedFolder(folder.path)}
                    disabled={isCurrentFolder}
                    className="w-full text-left px-4 py-3 rounded transition-all flex items-center gap-3"
                    style={{
                      background: isSelected ? 'rgba(61, 122, 237, 0.1)' : isCurrentFolder ? 'var(--background)' : 'transparent',
                      border: isSelected ? '2px solid var(--primary)' : '2px solid transparent',
                      opacity: isCurrentFolder ? 0.5 : 1,
                      cursor: isCurrentFolder ? 'not-allowed' : 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      if (!isCurrentFolder && !isSelected) {
                        e.currentTarget.style.background = 'var(--background)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrentFolder && !isSelected) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>📁</span>
                    <div className="flex-1">
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {folder.name}
                      </div>
                      {folder.path && (
                        <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {folder.path}
                        </div>
                      )}
                    </div>
                    {isCurrentFolder && (
                      <span className="text-xs px-2 py-1 rounded" style={{
                        background: 'var(--background)',
                        color: 'var(--text-muted)'
                      }}>
                        Current
                      </span>
                    )}
                    {isSelected && !isCurrentFolder && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--primary)' }}>
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t" style={{ borderColor: 'var(--border-light)' }}>
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium rounded transition-all"
            style={{
              background: 'var(--background)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            className="px-4 py-2 text-sm font-semibold text-white rounded transition-all hover:scale-105"
            style={{
              background: 'var(--primary)',
              boxShadow: 'var(--shadow-sm)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary)'}
          >
            Move Here
          </button>
        </div>
      </div>
    </div>
  );
}

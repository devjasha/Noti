'use client';

import { useState } from 'react';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (folderName: string) => void;
  parentFolder?: string;
}

export default function CreateFolderModal({ isOpen, onClose, onSubmit, parentFolder }: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!folderName.trim()) {
      setError('Folder name cannot be empty');
      return;
    }

    if (folderName.includes('/') || folderName.includes('\\')) {
      setError('Folder name cannot contain slashes');
      return;
    }

    if (folderName.startsWith('.')) {
      setError('Folder name cannot start with a dot');
      return;
    }

    if (/[<>:"|?*]/.test(folderName)) {
      setError('Folder name contains invalid characters');
      return;
    }

    onSubmit(folderName.trim());
    setFolderName('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setFolderName('');
    setError('');
    onClose();
  };

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
        className="w-full max-w-md"
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
            Create New Folder
          </h2>
          {parentFolder && (
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              in {parentFolder}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Folder Name
          </label>
          <input
            type="text"
            value={folderName}
            onChange={(e) => {
              setFolderName(e.target.value);
              setError('');
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              }
            }}
            placeholder="my-folder"
            autoFocus
            className="w-full px-3 py-2 text-sm rounded transition-all focus:outline-none"
            style={{
              background: 'var(--background)',
              border: error ? '2px solid #ef4444' : '2px solid var(--border)',
              color: 'var(--text-primary)'
            }}
            onFocus={(e) => {
              if (!error) {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(61, 122, 237, 0.1)';
              }
            }}
            onBlur={(e) => {
              if (!error) {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          />
          {error && (
            <p className="mt-2 text-sm" style={{ color: '#ef4444' }}>
              {error}
            </p>
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
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-semibold text-white rounded transition-all hover:scale-105"
            style={{
              background: 'var(--primary)',
              boxShadow: 'var(--shadow-sm)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary)'}
          >
            Create Folder
          </button>
        </div>
      </div>
    </div>
  );
}

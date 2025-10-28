'use client';

import { useEffect, useRef } from 'react';

interface FolderContextMenuProps {
  x: number;
  y: number;
  folderPath: string;
  folderName: string;
  isEmpty: boolean;
  onClose: () => void;
  onRename: () => void;
  onDelete: () => void;
  onCreateNote: () => void;
}

export default function FolderContextMenu({
  x,
  y,
  folderPath,
  folderName,
  isEmpty,
  onClose,
  onRename,
  onDelete,
  onCreateNote
}: FolderContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[200px] py-2 rounded-lg"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        background: 'var(--surface)',
        border: '1px solid var(--border-light)',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
      }}
    >
      <button
        onClick={() => {
          onCreateNote();
          onClose();
        }}
        className="w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors"
        style={{ color: 'var(--text-primary)' }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--background)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
        New Note in Folder
      </button>

      <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />

      <button
        onClick={() => {
          onRename();
          onClose();
        }}
        className="w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors"
        style={{ color: 'var(--text-primary)' }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--background)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        Rename
      </button>

      {isEmpty && (
        <button
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors"
          style={{ color: '#ef4444' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          Delete
        </button>
      )}

      {!isEmpty && (
        <div
          className="px-4 py-2 text-xs italic"
          style={{ color: 'var(--text-muted)' }}
        >
          Only empty folders can be deleted
        </div>
      )}
    </div>
  );
}

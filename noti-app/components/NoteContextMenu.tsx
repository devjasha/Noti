'use client';

import { useEffect, useRef } from 'react';

interface NoteContextMenuProps {
  x: number;
  y: number;
  noteSlug: string;
  noteTitle: string;
  onClose: () => void;
  onMove: () => void;
  onSaveAsTemplate: () => void;
  onDelete: () => void;
}

export default function NoteContextMenu({
  x,
  y,
  noteSlug,
  noteTitle,
  onClose,
  onMove,
  onSaveAsTemplate,
  onDelete
}: NoteContextMenuProps) {
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
          onMove();
          onClose();
        }}
        className="w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors"
        style={{ color: 'var(--text-primary)' }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--background)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 6L9 17l-5-5"/>
          <path d="M22 10c0-9-9-9-9-9"/>
          <path d="M2 10c0-9 9-9 9-9"/>
        </svg>
        Move to Folder...
      </button>

      <button
        onClick={() => {
          onSaveAsTemplate();
          onClose();
        }}
        className="w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors"
        style={{ color: 'var(--text-primary)' }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--background)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 3h5v5"/>
          <line x1="21" y1="3" x2="10" y2="14"/>
          <path d="M14 8L4 8 4 20 16 20 16 10"/>
        </svg>
        Save as Template
      </button>

      <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />

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
          <line x1="10" y1="11" x2="10" y2="17"/>
          <line x1="14" y1="11" x2="14" y2="17"/>
        </svg>
        Delete
      </button>
    </div>
  );
}

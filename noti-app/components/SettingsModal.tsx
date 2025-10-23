'use client';

import { useState } from 'react';
import ThemeSelector from './ThemeSelector';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[80vh] flex flex-col"
        style={{
          background: 'var(--surface)',
          border: '2px solid var(--border-light)',
          borderRadius: 'var(--radius)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: 'var(--border-light)' }}
        >
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 transition-all hover:scale-110 rounded"
            style={{
              background: 'var(--background)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--primary)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--background)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {/* Theme Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Appearance
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                      Theme
                    </label>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Choose your preferred color theme
                    </p>
                  </div>
                  <ThemeSelector />
                </div>
              </div>
            </div>

            {/* Keyboard Shortcuts Section */}
            <div className="pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Keyboard Shortcuts
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between py-2">
                  <span style={{ color: 'var(--text-secondary)' }}>Toggle file tree</span>
                  <kbd className="px-2 py-1 rounded font-mono text-xs" style={{
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)'
                  }}>
                    Ctrl+B
                  </kbd>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span style={{ color: 'var(--text-secondary)' }}>Toggle git status</span>
                  <kbd className="px-2 py-1 rounded font-mono text-xs" style={{
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)'
                  }}>
                    Ctrl+Shift+G
                  </kbd>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span style={{ color: 'var(--text-secondary)' }}>Toggle note history</span>
                  <kbd className="px-2 py-1 rounded font-mono text-xs" style={{
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)'
                  }}>
                    Ctrl+H
                  </kbd>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                About
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between py-1">
                  <span style={{ color: 'var(--text-secondary)' }}>Version</span>
                  <span style={{ color: 'var(--text-primary)' }}>1.0.0</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span style={{ color: 'var(--text-secondary)' }}>Repository</span>
                  <a
                    href="https://github.com/devjasha/Noti"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--primary)' }}
                    className="hover:underline"
                  >
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 p-6 border-t"
          style={{ borderColor: 'var(--border-light)' }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium transition-all hover:scale-105"
            style={{
              background: 'var(--primary)',
              color: 'white',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-md)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary)'}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

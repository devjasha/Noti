'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SettingsModal from './SettingsModal';
import CreateFolderModal from './CreateFolderModal';
import TemplatePickerModal from './TemplatePickerModal';
import { foldersAPI, tagsAPI, notesAPI } from '../lib/electron-api';

interface PrimarySidebarProps {
  onFolderClick: (folderPath: string) => void;
  onTagClick: (tag: string) => void;
}

export default function PrimarySidebar({ onFolderClick, onTagClick }: PrimarySidebarProps) {
  const router = useRouter();
  const [allTags, setAllTags] = useState<Array<{ tag: string; count: number }>>([]);
  const [allFolders, setAllFolders] = useState<string[]>([]);
  const [showTags, setShowTags] = useState(true);
  const [showFolders, setShowFolders] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showNewNoteMenu, setShowNewNoteMenu] = useState(false);

  useEffect(() => {
    fetchTags();
    fetchFolders();
  }, []);

  const fetchTags = async () => {
    try {
      const tags = await tagsAPI.getAll();
      setAllTags(tags);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchFolders = async () => {
    try {
      const data = await foldersAPI.getAll();
      const folderPaths = data.map((f: any) => f.path);
      setAllFolders(folderPaths);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const handleCreateFolder = async (folderName: string) => {
    try {
      // Create folder at root level
      await foldersAPI.create(folderName);
      fetchFolders(); // Refresh folders list
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  // Get root-level folders (no slashes in path)
  const getRootFolders = () => {
    return allFolders.filter(path => !path.includes('/') && path !== 'root' && path !== '');
  };

  const handleSelectTemplate = async (templateSlug: string) => {
    try {
      // Navigate to new note with template content
      router.push(`/dashboard?note=new&template=${templateSlug}&folder=`);
    } catch (error) {
      console.error('Error loading template:', error);
    }
  };

  return (
    <div className="h-full flex flex-col" style={{
      background: 'var(--surface)',
      borderRight: '1px solid var(--border-light)',
      width: '280px',
      flexShrink: 0
    }}>
      {/* Header */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-light)' }}>
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Home</span>
        </div>
      </div>

      {/* New Note & Folder Buttons */}
      <div className="p-4 space-y-3 border-b" style={{ borderColor: 'var(--border-light)' }}>
        <div className="flex gap-2">
          {/* New Note Dropdown */}
          <div className="flex-1 relative">
            <button
              onClick={() => {
                router.push(`/dashboard?note=new&folder=`);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-white font-semibold transition-all hover:scale-105 active:scale-95 hover:brightness-110"
              style={{
                background: 'var(--primary)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span>New Note</span>
            </button>
            <button
              onClick={() => setShowNewNoteMenu(!showNewNoteMenu)}
              className="absolute right-0 top-0 h-full px-2 text-white transition-all hover:brightness-110"
              style={{
                background: 'var(--primary)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '0 var(--radius-sm) var(--radius-sm) 0'
              }}
            >
              <span className="text-xs">{showNewNoteMenu ? '▲' : '▼'}</span>
            </button>

            {/* Dropdown Menu */}
            {showNewNoteMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowNewNoteMenu(false)}
                />
                <div
                  className="absolute top-full left-0 right-0 mt-1 py-1 z-20 rounded"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border-light)',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                >
                  <button
                    onClick={() => {
                      setShowTemplatePicker(true);
                      setShowNewNoteMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--background)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    📄 From Template...
                  </button>
                </div>
              </>
            )}
          </div>

          {/* New Folder Button */}
          <button
            onClick={() => setShowCreateFolder(true)}
            className="px-3 py-2.5 text-sm font-semibold transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'var(--background)',
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            title="New Folder"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              <line x1="12" y1="11" x2="12" y2="17"/>
              <line x1="9" y1="14" x2="15" y2="14"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {/* Folders Section */}
        {getRootFolders().length > 0 && (
          <div className="px-2 py-2 border-b" style={{ borderColor: 'var(--border-light)' }}>
            <button
              onClick={() => setShowFolders(!showFolders)}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm font-medium transition-colors rounded"
              style={{
                color: 'var(--text-primary)',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--background)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <span className="text-xs">{showFolders ? '▼' : '▶'}</span>
              <span>📁</span>
              <span>Folders</span>
              <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>
                {getRootFolders().length}
              </span>
            </button>

            {showFolders && (
              <div className="mt-1 space-y-0.5">
                {getRootFolders().map(folder => (
                  <button
                    key={folder}
                    onClick={() => onFolderClick(folder)}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-sm rounded transition-all"
                    style={{
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                      borderLeft: '3px solid transparent',
                      fontWeight: 400,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--background)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span className="truncate">{folder}</span>
                    <span className="text-xs ml-2">▶</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tags Section */}
        {allTags.length > 0 && (
          <div className="px-2 py-2 border-b" style={{ borderColor: 'var(--border-light)' }}>
            <button
              onClick={() => setShowTags(!showTags)}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm font-medium transition-colors rounded"
              style={{
                color: 'var(--text-primary)',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--background)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <span className="text-xs">{showTags ? '▼' : '▶'}</span>
              <span>🏷️</span>
              <span>Tags</span>
              <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>
                {allTags.length}
              </span>
            </button>

            {showTags && (
              <div className="mt-1 space-y-0.5">
                {allTags.map(({ tag, count }) => (
                  <button
                    key={tag}
                    onClick={() => onTagClick(tag)}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-sm rounded transition-all"
                    style={{
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                      borderLeft: '3px solid transparent',
                      fontWeight: 400,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--background)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span className="truncate">{tag}</span>
                    <span
                      className="text-xs ml-2 px-1.5 py-0.5 rounded"
                      style={{
                        background: 'rgba(61, 122, 237, 0.1)',
                        color: 'var(--primary)',
                      }}
                    >
                      {count}
                    </span>
                    <span className="text-xs ml-2">▶</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Settings Button */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
        <button
          onClick={() => setShowSettings(true)}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all rounded"
          style={{
            background: 'var(--background)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.background = 'rgba(61, 122, 237, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.background = 'var(--background)';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6m5.5-11v4m0 6v4M18 12h6M6 12H0m5.5-7v4m0 6v4"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          <span>Settings</span>
        </button>
      </div>

      {/* Modals */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <CreateFolderModal
        isOpen={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        onSubmit={handleCreateFolder}
        parentFolder={undefined}
      />
      <TemplatePickerModal
        isOpen={showTemplatePicker}
        onClose={() => setShowTemplatePicker(false)}
        onSelect={handleSelectTemplate}
      />
    </div>
  );
}

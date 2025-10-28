'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NavigationBreadcrumb from './NavigationBreadcrumb';
import FolderContextMenu from './FolderContextMenu';
import NoteContextMenu from './NoteContextMenu';
import CreateFolderModal from './CreateFolderModal';
import FolderPickerModal from './FolderPickerModal';
import TemplatePickerModal from './TemplatePickerModal';
import { notesAPI, foldersAPI, templatesAPI } from '../lib/electron-api';

interface NoteMetadata {
  slug: string;
  title: string;
  tags: string[];
  created: string;
  modified: string;
  folder: string;
}

interface ExtendedSidebarProps {
  mode: 'folders' | 'tags';
  initialPath: string; // folder path or tag name
  selectedNote?: string;
  onNoteSelect?: (slug: string) => void;
  onClose: () => void;
}

export default function ExtendedSidebar({ mode, initialPath, selectedNote, onNoteSelect, onClose }: ExtendedSidebarProps) {
  const router = useRouter();
  const [notes, setNotes] = useState<NoteMetadata[]>([]);
  const [allFolders, setAllFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [currentFolder, setCurrentFolder] = useState(mode === 'folders' ? initialPath : '');
  const [selectedTag, setSelectedTag] = useState(mode === 'tags' ? initialPath : '');
  const [viewMode, setViewMode] = useState<'folders' | 'tags'>(mode);
  const [contextMenu, setContextMenu] = useState<{
    type: 'folder' | 'note';
    x: number;
    y: number;
    data: any;
  } | null>(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [noteToMove, setNoteToMove] = useState<{ slug: string; currentFolder: string } | null>(null);
  const [noteForTemplate, setNoteForTemplate] = useState<{ slug: string; title: string } | null>(null);

  useEffect(() => {
    fetchNotes();
    fetchFolders();
  }, []);

  // Update view when props change
  useEffect(() => {
    setViewMode(mode);
    if (mode === 'folders') {
      setCurrentFolder(initialPath);
      setSelectedTag('');
    } else {
      setSelectedTag(initialPath);
      setCurrentFolder('');
    }
  }, [mode, initialPath]);

  const fetchNotes = async () => {
    try {
      const data = await notesAPI.getAll();
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
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

  const navigateToFolder = (folderPath: string) => {
    setViewMode('folders');
    setCurrentFolder(folderPath);
    setSelectedTag('');
  };

  const navigateHome = () => {
    setViewMode('folders');
    setCurrentFolder('');
    setSelectedTag('');
  };

  const handleCreateFolder = async (folderName: string) => {
    try {
      const folderPath = currentFolder
        ? `${currentFolder}/${folderName}`
        : folderName;

      await foldersAPI.create(folderPath);
      fetchFolders();
      fetchNotes();
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleMoveNote = async (targetFolder: string) => {
    if (!noteToMove) return;

    try {
      await notesAPI.move(noteToMove.slug, targetFolder);
      fetchNotes();
      setNoteToMove(null);
    } catch (error) {
      console.error('Error moving note:', error);
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!noteForTemplate) return;

    try {
      const note = await notesAPI.get(noteForTemplate.slug);
      await templatesAPI.create({
        slug: noteForTemplate.slug,
        content: note.content,
        metadata: {
          title: noteForTemplate.title,
          description: `Template based on ${noteForTemplate.title}`,
        },
      });

      alert('Note saved as template!');
      setNoteForTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleRenameFolder = async (folderPath: string, newName: string) => {
    try {
      await foldersAPI.rename(folderPath, newName);
      fetchFolders();
      fetchNotes();
    } catch (error) {
      console.error('Error renaming folder:', error);
    }
  };

  const handleDeleteFolder = async (folderPath: string) => {
    if (!confirm(`Delete folder "${folderPath}"?`)) return;

    try {
      await foldersAPI.delete(folderPath);
      fetchFolders();
      fetchNotes();
    } catch (error: any) {
      alert(error.message || 'Failed to delete folder');
    }
  };

  const handleDeleteNote = async (slug: string) => {
    if (!confirm('Delete this note?')) return;

    try {
      await notesAPI.delete(slug);
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  // Group notes by folder
  const notesByFolder = notes.reduce((acc, note) => {
    const folder = note.folder || 'root';
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(note);
    return acc;
  }, {} as Record<string, NoteMetadata[]>);

  // Add empty folders
  allFolders.forEach(folderPath => {
    if (!notesByFolder[folderPath]) {
      notesByFolder[folderPath] = [];
    }
  });

  // Ensure root folder exists
  if (!notesByFolder['root']) {
    notesByFolder['root'] = [];
  }

  // Filter notes by search text
  const filteredNotesByFolder = Object.entries(notesByFolder).reduce((acc, [folder, folderNotes]) => {
    let filtered = folderNotes;

    if (filter) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(filter.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))
      );
    }

    if (!filter || filtered.length > 0 || folderNotes.length === 0) {
      acc[folder] = filtered;
    }
    return acc;
  }, {} as Record<string, NoteMetadata[]>);

  // Get notes for a specific tag
  const getNotesForTag = (tag: string): NoteMetadata[] => {
    return notes.filter(note => note.tags.includes(tag));
  };

  // Get immediate children of current folder
  const getImmediateChildren = (folderPath: string, allFolderPaths: string[]) => {
    const children: string[] = [];

    allFolderPaths.forEach(path => {
      if (folderPath === '' || folderPath === 'root') {
        if (!path.includes('/') && path !== 'root' && path !== '') {
          children.push(path);
        }
      } else {
        const normalizedPath = folderPath === 'root' ? '' : folderPath;
        if (path.startsWith(normalizedPath + '/')) {
          const remainder = path.substring(normalizedPath.length + 1);
          if (!remainder.includes('/')) {
            children.push(path);
          }
        }
      }
    });

    return children;
  };

  // Get notes in current folder only
  const getCurrentFolderNotes = () => {
    const currentFolderKey = currentFolder === '' ? 'root' : currentFolder;
    return filteredNotesByFolder[currentFolderKey] || [];
  };

  // Get immediate subfolders
  const currentLevelFolders = getImmediateChildren(
    currentFolder,
    Object.keys(filteredNotesByFolder)
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center" style={{
        background: 'var(--surface)',
        borderRight: '1px solid var(--border-light)',
        width: '320px'
      }}>
        <div className="text-center" style={{ color: 'var(--text-muted)' }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col"
      style={{
        background: 'var(--surface)',
        borderRight: '1px solid var(--border-light)',
        width: '320px',
        flexShrink: 0,
        animation: 'slideInFromLeft 0.2s ease-out'
      }}
    >
      <style jsx>{`
        @keyframes slideInFromLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      {/* Header with breadcrumb and close button */}
      <div className="border-b flex items-center justify-between" style={{ borderColor: 'var(--border-light)' }}>
        <div className="flex-1">
          <NavigationBreadcrumb
            mode={viewMode}
            currentPath={viewMode === 'tags' ? selectedTag : currentFolder}
            onNavigate={navigateToFolder}
            onNavigateHome={navigateHome}
          />
        </div>
        <button
          onClick={onClose}
          className="px-3 py-2 transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          title="Close sidebar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Search & Actions */}
      <div className="p-4 space-y-3 border-b" style={{ borderColor: 'var(--border-light)' }}>
        <div className="flex gap-2">
          {/* New Note Button */}
          <button
            onClick={() => {
              router.push(`/dashboard?note=new&folder=${currentFolder}`);
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-white font-semibold transition-all hover:scale-105 active:scale-95 hover:brightness-110"
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

          {/* New Folder Button */}
          {viewMode === 'folders' && (
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
          )}
        </div>

        <input
          type="text"
          placeholder="Search notes..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full px-3 py-2 text-sm transition-all focus:outline-none"
          style={{
            background: 'var(--background)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(61, 122, 237, 0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-2">
        {/* Tag View Mode */}
        {viewMode === 'tags' && selectedTag && (
          <div className="space-y-1">
            {getNotesForTag(selectedTag).map(note => {
              const isSelected = selectedNote === note.slug;
              const folderPath = note.folder || 'root';

              return (
                <Link
                  key={note.slug}
                  href={`/dashboard?note=${note.slug}`}
                  onClick={(e) => {
                    if (onNoteSelect) {
                      e.preventDefault();
                      onNoteSelect(note.slug);
                    }
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({
                      type: 'note',
                      x: e.clientX,
                      y: e.clientY,
                      data: {
                        slug: note.slug,
                        title: note.title,
                        folder: note.folder
                      }
                    });
                  }}
                  className="block px-3 py-2 text-sm rounded transition-all"
                  style={{
                    background: isSelected ? 'rgba(61, 122, 237, 0.1)' : 'transparent',
                    color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                    borderLeft: isSelected ? '3px solid var(--primary)' : '3px solid transparent',
                    fontWeight: isSelected ? 600 : 400
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'var(--background)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div className="truncate">{note.title}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    📁 {folderPath}
                  </div>
                </Link>
              );
            })}

            {getNotesForTag(selectedTag).length === 0 && (
              <div className="p-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                No notes with this tag
              </div>
            )}
          </div>
        )}

        {/* Folder View Mode */}
        {viewMode === 'folders' && (
          <div className="space-y-1">
            {/* Show subfolders at current level */}
            {currentLevelFolders.map(folder => {
              const folderName = folder.includes('/') ? folder.split('/').pop() : folder;
              return (
                <button
                  key={folder}
                  onClick={() => navigateToFolder(folder)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({
                      type: 'folder',
                      x: e.clientX,
                      y: e.clientY,
                      data: {
                        path: folder === 'root' ? '' : folder,
                        name: folder,
                        isEmpty: filteredNotesByFolder[folder]?.length === 0
                      }
                    });
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm font-medium transition-colors rounded"
                  style={{
                    color: 'var(--text-primary)',
                    background: 'transparent',
                    borderLeft: '3px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--background)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span>📁</span>
                  <span className="flex-1 text-left truncate">{folderName}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {filteredNotesByFolder[folder]?.length || 0}
                  </span>
                  <span className="text-xs">▶</span>
                </button>
              );
            })}

            {/* Show notes in current folder */}
            {getCurrentFolderNotes().map(note => {
              const isSelected = selectedNote === note.slug;
              return (
                <Link
                  key={note.slug}
                  href={`/dashboard?note=${note.slug}`}
                  onClick={(e) => {
                    if (onNoteSelect) {
                      e.preventDefault();
                      onNoteSelect(note.slug);
                    }
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({
                      type: 'note',
                      x: e.clientX,
                      y: e.clientY,
                      data: {
                        slug: note.slug,
                        title: note.title,
                        folder: note.folder
                      }
                    });
                  }}
                  className="block px-3 py-2 text-sm rounded transition-all"
                  style={{
                    background: isSelected ? 'rgba(61, 122, 237, 0.1)' : 'transparent',
                    color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                    borderLeft: isSelected ? '3px solid var(--primary)' : '3px solid transparent',
                    fontWeight: isSelected ? 600 : 400
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'var(--background)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div className="truncate">{note.title}</div>
                  {note.tags.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {note.tags.slice(0, 2).map(tag => (
                        <span
                          key={tag}
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{
                            background: 'rgba(61, 122, 237, 0.1)',
                            color: 'var(--primary)'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 2 && (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          +{note.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}

            {/* Empty state */}
            {currentLevelFolders.length === 0 && getCurrentFolderNotes().length === 0 && (
              <div className="p-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                No items in this folder
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateFolderModal
        isOpen={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        onSubmit={handleCreateFolder}
        parentFolder={currentFolder || undefined}
      />
      <FolderPickerModal
        isOpen={showFolderPicker}
        onClose={() => setShowFolderPicker(false)}
        onSelect={handleMoveNote}
        currentFolder={noteToMove?.currentFolder}
      />

      {/* Context Menus */}
      {contextMenu && contextMenu.type === 'folder' && (
        <FolderContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          folderPath={contextMenu.data.path}
          folderName={contextMenu.data.name}
          isEmpty={contextMenu.data.isEmpty}
          onClose={() => setContextMenu(null)}
          onRename={() => {
            const newName = prompt('Enter new folder name:', contextMenu.data.name);
            if (newName && newName !== contextMenu.data.name) {
              handleRenameFolder(contextMenu.data.path, newName);
            }
          }}
          onDelete={() => {
            handleDeleteFolder(contextMenu.data.path);
          }}
          onCreateNote={() => {
            const folder = contextMenu.data.path;
            navigateToFolder(folder);
            router.push(`/dashboard?note=new&folder=${folder}`);
          }}
        />
      )}

      {contextMenu && contextMenu.type === 'note' && (
        <NoteContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          noteSlug={contextMenu.data.slug}
          noteTitle={contextMenu.data.title}
          onClose={() => setContextMenu(null)}
          onMove={() => {
            setNoteToMove({
              slug: contextMenu.data.slug,
              currentFolder: contextMenu.data.folder
            });
            setShowFolderPicker(true);
          }}
          onSaveAsTemplate={() => {
            setNoteForTemplate({
              slug: contextMenu.data.slug,
              title: contextMenu.data.title
            });
            handleSaveAsTemplate();
          }}
          onDelete={() => {
            handleDeleteNote(contextMenu.data.slug);
          }}
        />
      )}
    </div>
  );
}

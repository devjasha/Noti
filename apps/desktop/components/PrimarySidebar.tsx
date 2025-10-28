'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SettingsModal from './SettingsModal';
import CreateFolderModal from './CreateFolderModal';
import TemplatePickerModal from './TemplatePickerModal';
import FolderPickerModal from './FolderPickerModal';
import NavigationBreadcrumb from './NavigationBreadcrumb';
import FolderContextMenu from './FolderContextMenu';
import NoteContextMenu from './NoteContextMenu';
import { foldersAPI, tagsAPI, notesAPI, templatesAPI } from '../lib/electron-api';

interface NoteMetadata {
  slug: string;
  title: string;
  tags: string[];
  created: string;
  modified: string;
  folder: string;
}

interface PrimarySidebarProps {
  selectedNote?: string;
  onNoteSelect?: (slug: string) => void;
}

export default function PrimarySidebar({ selectedNote, onNoteSelect }: PrimarySidebarProps) {
  const router = useRouter();
  const [notes, setNotes] = useState<NoteMetadata[]>([]);
  const [allTags, setAllTags] = useState<Array<{ tag: string; count: number }>>([]);
  const [allFolders, setAllFolders] = useState<string[]>([]);
  const [showTags, setShowTags] = useState(true);
  const [showFolders, setShowFolders] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [showNewNoteMenu, setShowNewNoteMenu] = useState(false);
  const [filter, setFilter] = useState('');
  const [viewMode, setViewMode] = useState<'folders' | 'tags'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('viewMode') as 'folders' | 'tags') || 'folders';
    }
    return 'folders';
  });
  const [selectedTag, setSelectedTag] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedTag') || '';
    }
    return '';
  });
  const [currentFolder, setCurrentFolder] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('currentFolder') || '';
    }
    return '';
  });
  const [contextMenu, setContextMenu] = useState<{
    type: 'folder' | 'note';
    x: number;
    y: number;
    data: any;
  } | null>(null);
  const [noteToMove, setNoteToMove] = useState<{ slug: string; currentFolder: string } | null>(null);
  const [noteForTemplate, setNoteForTemplate] = useState<{ slug: string; title: string } | null>(null);

  useEffect(() => {
    fetchNotes();
    fetchTags();
    fetchFolders();

    // Listen for refresh events
    const handleRefresh = () => {
      fetchNotes();
      fetchTags();
      fetchFolders();
    };

    // Listen for folder create events
    const handleFolderCreate = () => {
      setShowCreateFolder(true);
    };

    window.addEventListener('notes:refresh', handleRefresh);
    window.addEventListener('folder:create', handleFolderCreate);
    return () => {
      window.removeEventListener('notes:refresh', handleRefresh);
      window.removeEventListener('folder:create', handleFolderCreate);
    };
  }, []);

  const fetchNotes = async () => {
    try {
      const data = await notesAPI.getAll();
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

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

  const navigateToFolder = (folderPath: string) => {
    setViewMode('folders');
    setCurrentFolder(folderPath);
    setSelectedTag('');
    localStorage.setItem('viewMode', 'folders');
    localStorage.setItem('currentFolder', folderPath);
    localStorage.setItem('selectedTag', '');
  };

  const navigateToTag = (tag: string) => {
    setViewMode('tags');
    setSelectedTag(tag);
    setCurrentFolder('');
    localStorage.setItem('viewMode', 'tags');
    localStorage.setItem('selectedTag', tag);
    localStorage.setItem('currentFolder', '');
  };

  const navigateHome = () => {
    setViewMode('folders');
    setCurrentFolder('');
    setSelectedTag('');
    localStorage.setItem('viewMode', 'folders');
    localStorage.setItem('currentFolder', '');
    localStorage.setItem('selectedTag', '');
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

  // Ensure root exists
  if (!notesByFolder['root']) {
    notesByFolder['root'] = [];
  }

  // Filter notes
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

  // Get notes for tag
  const getNotesForTag = (tag: string): NoteMetadata[] => {
    return notes.filter(note => note.tags.includes(tag));
  };

  // Get immediate children
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

  // Get current folder notes
  const getCurrentFolderNotes = () => {
    const currentFolderKey = currentFolder === '' ? 'root' : currentFolder;
    return filteredNotesByFolder[currentFolderKey] || [];
  };

  // Get current level folders
  const currentLevelFolders = getImmediateChildren(
    currentFolder,
    Object.keys(filteredNotesByFolder)
  );

  // Get root-level folders (no slashes in path)
  const getRootFolders = () => {
    return allFolders.filter(path => !path.includes('/') && path !== 'root' && path !== '');
  };

  const handleSelectTemplate = async (templateSlug: string) => {
    try {
      // Navigate to new note with template content
      router.push(`/dashboard?note=new&template=${templateSlug}&folder=${currentFolder}`);
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
      {/* Breadcrumb Navigation */}
      <div className="border-b" style={{ borderColor: 'var(--border-light)' }}>
        <NavigationBreadcrumb
          mode={viewMode}
          currentPath={viewMode === 'tags' ? selectedTag : currentFolder}
          onNavigate={navigateToFolder}
          onNavigateHome={navigateHome}
        />
      </div>

      {/* Search */}
      <div className="p-4 space-y-3 border-b" style={{ borderColor: 'var(--border-light)' }}>
        {/* Search Input */}
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

        {/* Folder View Mode - only show when not in root OR not in tags mode */}
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
                          className="text-xs px-1.5 py-0.5 rounded cursor-pointer"
                          style={{
                            background: 'rgba(61, 122, 237, 0.1)',
                            color: 'var(--primary)'
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigateToTag(tag);
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

        {/* Tags section - only show at root level in folder mode */}
        {viewMode === 'folders' && currentFolder === '' && allTags.length > 0 && (
          <div className="mt-3 px-2 py-2 border-t" style={{ borderColor: 'var(--border-light)' }}>
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
                    onClick={() => navigateToTag(tag)}
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
        parentFolder={currentFolder || undefined}
      />
      <TemplatePickerModal
        isOpen={showTemplatePicker}
        onClose={() => setShowTemplatePicker(false)}
        onSelect={handleSelectTemplate}
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

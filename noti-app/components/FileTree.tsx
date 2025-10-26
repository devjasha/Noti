'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SettingsModal from './SettingsModal';
import CreateFolderModal from './CreateFolderModal';
import TemplatePickerModal from './TemplatePickerModal';
import FolderPickerModal from './FolderPickerModal';
import FolderContextMenu from './FolderContextMenu';
import NoteContextMenu from './NoteContextMenu';
import { notesAPI, foldersAPI, templatesAPI, tagsAPI } from '../lib/electron-api';

interface NoteMetadata {
  slug: string;
  title: string;
  tags: string[];
  created: string;
  modified: string;
  folder: string;
}

interface FileTreeProps {
  selectedNote?: string;
  onNoteSelect?: (slug: string) => void;
}

export default function FileTree({ selectedNote, onNoteSelect }: FileTreeProps) {
  const router = useRouter();
  const [notes, setNotes] = useState<NoteMetadata[]>([]);
  const [allFolders, setAllFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));
  const [filter, setFilter] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [showNewNoteMenu, setShowNewNoteMenu] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedFolder') || 'root';
    }
    return 'root';
  });
  const [contextMenu, setContextMenu] = useState<{
    type: 'folder' | 'note';
    x: number;
    y: number;
    data: any;
  } | null>(null);
  const [noteToMove, setNoteToMove] = useState<{ slug: string; currentFolder: string } | null>(null);
  const [noteForTemplate, setNoteForTemplate] = useState<{ slug: string; title: string } | null>(null);
  const [allTags, setAllTags] = useState<Array<{ tag: string; count: number }>>([]);
  const [showTags, setShowTags] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
    fetchFolders();
    fetchTags();
  }, []);

  // Refresh notes list when selectedNote changes (e.g., after creating a new note)
  useEffect(() => {
    if (selectedNote && selectedNote !== 'new') {
      // Check if this note exists in our current notes list
      const noteExists = notes.find(n => n.slug === selectedNote);
      if (!noteExists && notes.length > 0) {
        // Note doesn't exist in list, refresh to get the newly created note
        fetchNotes();
        fetchTags();
      }
    }
  }, [selectedNote]);

  // When selectedNote changes, update selectedFolder to match the note's folder
  useEffect(() => {
    if (selectedNote && notes.length > 0) {
      const note = notes.find(n => n.slug === selectedNote);
      if (note) {
        const noteFolder = note.folder || 'root';
        setSelectedFolder(noteFolder);
        localStorage.setItem('selectedFolder', noteFolder);

        // Also expand the folder to show the note
        setExpandedFolders(prev => {
          const newSet = new Set(prev);
          newSet.add(noteFolder);
          return newSet;
        });
      }
    }
  }, [selectedNote, notes]);

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

  const fetchTags = async () => {
    try {
      const tags = await tagsAPI.getAll();
      setAllTags(tags);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folder)) {
        newSet.delete(folder);
      } else {
        newSet.add(folder);
      }
      return newSet;
    });
    setSelectedFolder(folder); // Track selected folder
    localStorage.setItem('selectedFolder', folder); // Persist selected folder
  };

  const handleCreateFolder = async (folderName: string) => {
    try {
      const folderPath = selectedFolder && selectedFolder !== 'root'
        ? `${selectedFolder}/${folderName}`
        : folderName;

      await foldersAPI.create(folderPath);
      fetchFolders(); // Refresh folders to show new folder immediately
      fetchNotes(); // Also refresh notes
      fetchTags(); // Refresh tags
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleSelectTemplate = async (templateSlug: string) => {
    try {
      const template = await templatesAPI.get(templateSlug);
      const folder = selectedFolder && selectedFolder !== 'root' ? selectedFolder : '';
      // Navigate to new note with template content
      router.push(`/dashboard?note=new&template=${templateSlug}&folder=${folder}`);
    } catch (error) {
      console.error('Error loading template:', error);
    }
  };

  const handleMoveNote = async (targetFolder: string) => {
    if (!noteToMove) return;

    try {
      await notesAPI.move(noteToMove.slug, targetFolder);
      fetchNotes(); // Refresh notes
      fetchTags(); // Refresh tags
      setNoteToMove(null);
    } catch (error) {
      console.error('Error moving note:', error);
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!noteForTemplate) return;

    try {
      // Fetch the note content
      const note = await notesAPI.get(noteForTemplate.slug);

      // Save as template
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
      fetchTags();
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
      fetchTags();
    } catch (error: any) {
      alert(error.message || 'Failed to delete folder');
    }
  };

  const handleDeleteNote = async (slug: string) => {
    if (!confirm('Delete this note?')) return;

    try {
      await notesAPI.delete(slug);
      fetchNotes();
      fetchTags();
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

  // Add empty folders from allFolders
  allFolders.forEach(folderPath => {
    if (!notesByFolder[folderPath]) {
      notesByFolder[folderPath] = [];
    }
  });

  // Ensure root folder exists
  if (!notesByFolder['root']) {
    notesByFolder['root'] = [];
  }

  // Filter notes
  const filteredNotesByFolder = Object.entries(notesByFolder).reduce((acc, [folder, folderNotes]) => {
    let filtered = folderNotes;

    // Filter by selected tag
    if (selectedTag) {
      filtered = filtered.filter(note => note.tags.includes(selectedTag));
    }

    // Filter by search text
    if (filter) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(filter.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))
      );
    }

    // Include folder even if empty (no filter applied) or has filtered notes
    if ((!filter && !selectedTag) || filtered.length > 0 || folderNotes.length === 0) {
      acc[folder] = filtered;
    }
    return acc;
  }, {} as Record<string, NoteMetadata[]>);

  const folders = Object.keys(filteredNotesByFolder).sort();

  if (loading) {
    return (
      <div className="p-4 text-center" style={{ color: 'var(--text-muted)' }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{
      background: 'var(--surface)',
      borderRight: '1px solid var(--border-light)'
    }}>
      {/* Search & New Note */}
      <div className="p-4 space-y-3 border-b" style={{ borderColor: 'var(--border-light)' }}>
        <div className="flex gap-2">
          {/* New Note Dropdown */}
          <div className="flex-1 relative">
            <button
              onClick={() => {
                const folder = selectedFolder && selectedFolder !== 'root' ? selectedFolder : '';
                router.push(`/dashboard?note=new&folder=${folder}`);
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
                  onClick={() => {
                    if (selectedTag === tag) {
                      setSelectedTag(null);
                    } else {
                      setSelectedTag(tag);
                      setFilter(''); // Clear text filter when selecting tag
                    }
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-sm rounded transition-all"
                  style={{
                    background: selectedTag === tag ? 'rgba(61, 122, 237, 0.1)' : 'transparent',
                    color: selectedTag === tag ? 'var(--primary)' : 'var(--text-secondary)',
                    borderLeft: selectedTag === tag ? '3px solid var(--primary)' : '3px solid transparent',
                    fontWeight: selectedTag === tag ? 600 : 400,
                  }}
                  onMouseEnter={(e) => {
                    if (selectedTag !== tag) {
                      e.currentTarget.style.background = 'var(--background)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedTag !== tag) {
                      e.currentTarget.style.background = 'transparent';
                    }
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
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* File Tree */}
      <div className="flex-1 overflow-auto p-2">
        {selectedTag && (
          <div className="mb-2 px-2 py-1 text-xs rounded flex items-center gap-2" style={{
            background: 'rgba(61, 122, 237, 0.1)',
            color: 'var(--primary)',
          }}>
            <span>Filtering by tag: <strong>{selectedTag}</strong></span>
            <button
              onClick={() => setSelectedTag(null)}
              className="ml-auto hover:opacity-70"
              style={{ color: 'var(--primary)' }}
            >
              ✕
            </button>
          </div>
        )}

        {folders.length === 0 ? (
          <div className="p-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            No notes found
          </div>
        ) : (
          <div className="space-y-1">
            {folders.map(folder => (
              <div key={folder}>
                {/* Folder Header */}
                <button
                  onClick={() => toggleFolder(folder)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({
                      type: 'folder',
                      x: e.clientX,
                      y: e.clientY,
                      data: {
                        path: folder === 'root' ? '' : folder,
                        name: folder,
                        isEmpty: filteredNotesByFolder[folder].length === 0
                      }
                    });
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm font-medium transition-colors rounded"
                  style={{
                    color: 'var(--text-primary)',
                    background: selectedFolder === folder ? 'rgba(61, 122, 237, 0.1)' : 'transparent',
                    borderLeft: selectedFolder === folder ? '3px solid var(--primary)' : '3px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedFolder !== folder) {
                      e.currentTarget.style.background = 'var(--background)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedFolder !== folder) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <span className="text-xs">{expandedFolders.has(folder) ? '▼' : '▶'}</span>
                  <span>📁</span>
                  <span style={{
                    fontWeight: selectedFolder === folder ? 600 : 400,
                    color: selectedFolder === folder ? 'var(--primary)' : 'inherit'
                  }}>
                    {folder}
                  </span>
                  <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>
                    {filteredNotesByFolder[folder].length}
                  </span>
                </button>

                {/* Notes in Folder */}
                {expandedFolders.has(folder) && (
                  <div className="ml-6 space-y-0.5 mt-0.5">
                    {filteredNotesByFolder[folder].map(note => {
                      const isSelected = selectedNote === note.slug;
                      return (
                        <Link
                          key={note.slug}
                          href={`/dashboard?note=${note.slug}`}
                          onClick={(e) => {
                            // Select the folder that contains this note
                            const noteFolder = note.folder || 'root';
                            setSelectedFolder(noteFolder);
                            localStorage.setItem('selectedFolder', noteFolder);

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
                  </div>
                )}
              </div>
            ))}
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
        parentFolder={selectedFolder !== 'root' ? selectedFolder : undefined}
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
            setSelectedFolder(contextMenu.data.name);
            const folder = contextMenu.data.path;
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

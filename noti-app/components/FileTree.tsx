'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
  const [notes, setNotes] = useState<NoteMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes');
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
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
  };

  // Group notes by folder
  const notesByFolder = notes.reduce((acc, note) => {
    const folder = note.folder || 'root';
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(note);
    return acc;
  }, {} as Record<string, NoteMetadata[]>);

  // Filter notes
  const filteredNotesByFolder = Object.entries(notesByFolder).reduce((acc, [folder, folderNotes]) => {
    const filtered = folderNotes.filter(note =>
      note.title.toLowerCase().includes(filter.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))
    );
    if (filtered.length > 0) {
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
      {/* Search */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
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

      {/* File Tree */}
      <div className="flex-1 overflow-auto p-2">
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
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm font-medium transition-colors rounded"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--background)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span className="text-xs">{expandedFolders.has(folder) ? '▼' : '▶'}</span>
                  <span>📁</span>
                  <span>{folder}</span>
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
                            if (onNoteSelect) {
                              e.preventDefault();
                              onNoteSelect(note.slug);
                            }
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
    </div>
  );
}

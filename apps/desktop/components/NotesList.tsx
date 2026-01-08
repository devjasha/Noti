'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { notesAPI } from '../lib/electron-api';

interface NoteMetadata {
  slug: string;
  title: string;
  tags: string[];
  created: string;
  modified: string;
  folder: string;
}

export default function NotesList() {
  const [notes, setNotes] = useState<NoteMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');

  useEffect(() => {
    fetchNotes();
  }, []);

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

  const folders = Array.from(new Set(notes.map(n => n.folder || 'root')));

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(filter.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase()));
    const matchesFolder = selectedFolder === 'all' || note.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading notes...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search notes..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 px-4 py-3 transition-all focus:outline-none"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            color: 'var(--text-primary)',
            boxShadow: 'var(--shadow-sm)'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(61, 122, 237, 0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          }}
        />
        <select
          value={selectedFolder}
          onChange={(e) => setSelectedFolder(e.target.value)}
          className="px-4 py-3 transition-all focus:outline-none"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            color: 'var(--text-primary)',
            boxShadow: 'var(--shadow-sm)'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(61, 122, 237, 0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          }}
        >
          <option value="all">All Folders</option>
          {folders.map(folder => (
            <option key={folder} value={folder}>{folder}</option>
          ))}
        </select>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
          No notes found. Create your first note!
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredNotes.map(note => (
            <Link
              key={note.slug}
              href={`/dashboard?note=${note.slug}`}
              className="block p-5 transition-all"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-sm)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {note.title}
                </h3>
                <span className="text-sm whitespace-nowrap ml-4" style={{ color: 'var(--text-muted)' }}>
                  {formatDate(note.modified)}
                </span>
              </div>

              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {note.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs font-medium"
                      style={{
                        background: 'rgba(61, 122, 237, 0.1)',
                        color: 'var(--primary)',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {note.folder && (
                <div className="text-sm flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                  <span>📁</span>
                  <span>{note.folder}</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

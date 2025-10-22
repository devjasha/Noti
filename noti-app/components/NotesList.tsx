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
      const response = await fetch('/api/notes');
      const data = await response.json();
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
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
        />
        <select
          value={selectedFolder}
          onChange={(e) => setSelectedFolder(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
        >
          <option value="all">All Folders</option>
          {folders.map(folder => (
            <option key={folder} value={folder}>{folder}</option>
          ))}
        </select>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No notes found. Create your first note!
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredNotes.map(note => (
            <Link
              key={note.slug}
              href={`/note/${note.slug}`}
              className="block p-4 border rounded-lg hover:shadow-md transition-shadow dark:border-gray-700"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{note.title}</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(note.modified)}
                </span>
              </div>

              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {note.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {note.folder && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  📁 {note.folder}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

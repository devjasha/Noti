'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PrimarySidebar from '@/components/PrimarySidebar';
import MarkdownEditor from '@/components/MarkdownEditor';
import GitStatus from '@/components/GitStatus';
import NoteHistory from '@/components/NoteHistory';
import HistoryModal from '@/components/HistoryModal';
import { settingsAPI } from '@/lib/electron-api';

function DashboardContent() {
  const [showFileTree, setShowFileTree] = useState(true);
  const [showGitStatus, setShowGitStatus] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [distractionFreeMode, setDistractionFreeMode] = useState(false);
  const [historyCommit, setHistoryCommit] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedNote = searchParams.get('note');

  // Initialize notes directory on first load (Electron only)
  useEffect(() => {
    const initializeNotesDirectory = async () => {
      try {
        const notesDir = await settingsAPI.getNotesDirectory();
        if (notesDir) {
          console.log('[dashboard] Notes directory initialized:', notesDir);
        }
      } catch (error) {
        console.error('[dashboard] Error initializing notes directory:', error);
      }
    };

    initializeNotesDirectory();
  }, []);

  const handleNoteSelect = (slug: string) => {
    router.push(`/dashboard?note=${slug}`);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      console.log('Dashboard received key:', e.key, 'Ctrl:', e.ctrlKey, 'Shift:', e.shiftKey, 'showFileTree:', showFileTree);

      // Ctrl + N for New Note
      if (e.ctrlKey && !e.shiftKey && e.key === 'n') {
        e.preventDefault();
        e.stopPropagation();

        try {
          const currentFolder = localStorage.getItem('currentFolder') || '';
          const { notesAPI } = await import('@/lib/electron-api');

          // Find an available filename (new-note, new-note-2, new-note-3, etc.)
          let baseName = 'new-note';
          let noteSlug = currentFolder ? `${currentFolder}/${baseName}` : baseName;
          let counter = 2;

          // Check if file exists, if so, try new-note-2, new-note-3, etc.
          const allNotes = await notesAPI.getAll();
          while (allNotes.some((note: any) => note.slug === noteSlug)) {
            baseName = `new-note-${counter}`;
            noteSlug = currentFolder ? `${currentFolder}/${baseName}` : baseName;
            counter++;
          }

          const defaultTitle = counter === 2 ? 'New Note' : `New Note ${counter - 1}`;

          // Create the note immediately
          const data = await notesAPI.create({
            slug: noteSlug,
            content: '',
            metadata: { title: defaultTitle, tags: [] },
          });

          // Dispatch event to refresh file tree
          window.dispatchEvent(new CustomEvent('notes:refresh'));

          // Navigate to the newly created note
          router.push(`/dashboard?note=${data.slug}`);
        } catch (error) {
          console.error('Error creating note:', error);
        }
      }
      // Ctrl + Shift + D for Distraction Free Mode
      else if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        e.stopPropagation();
        setDistractionFreeMode(prev => !prev);
      }
      // Ctrl + B for FileTree (B for sidebar/Browser)
      else if (e.ctrlKey && !e.shiftKey && e.key === 'b') {
        e.preventDefault();
        e.stopPropagation();
        console.log('TOGGLING FileTree from', showFileTree, 'to', !showFileTree);
        setShowFileTree(prev => {
          const newValue = !prev;
          console.log('FileTree setState called, changing from', prev, 'to', newValue);
          return newValue;
        });
      }
      // Ctrl + Shift + G for GitStatus
      else if (e.ctrlKey && e.shiftKey && (e.key === 'G' || e.key === 'g')) {
        e.preventDefault();
        e.stopPropagation();
        setShowGitStatus(prev => !prev);
      }
      // Ctrl + H for History
      else if (e.ctrlKey && !e.shiftKey && e.key === 'h') {
        e.preventDefault();
        e.stopPropagation();
        setShowHistory(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true); // Use capture phase
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [showFileTree, showGitStatus, router]);

  const handleViewHistoryVersion = async (commit: string) => {
    setHistoryCommit(commit);
  };

  const handleCloseHistoryModal = () => {
    setHistoryCommit(null);
  };

  // Get file path for selected note
  const getFilePath = (slug: string | null): string | null => {
    if (!slug) return null;
    return `${slug}.md`;
  };

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: 'var(--background)' }}>
      {/* File Tree Sidebar */}
      {showFileTree && !distractionFreeMode && (
        <PrimarySidebar
          selectedNote={selectedNote || undefined}
          onNoteSelect={handleNoteSelect}
        />
      )}

      {/* Note Editor/Viewer */}
      <div className="flex-1 h-full overflow-hidden">
        {selectedNote ? (
          <MarkdownEditor key={selectedNote} slug={selectedNote} />
        ) : (
          <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-muted)' }}>
            <div className="text-center space-y-4">
              <div className="text-6xl">📝</div>
              <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Welcome to Noti
              </h2>
              <p className="text-lg">
                Select a note from the sidebar or create a new one
              </p>
              <div className="text-sm mt-4 space-y-1" style={{ color: 'var(--text-muted)' }}>
                <p>Keyboard shortcuts:</p>
                <p>Ctrl+N - New note</p>
                <p>Ctrl+B - Toggle sidebar</p>
                <p>Ctrl+Shift+D - Distraction-free mode</p>
                <p>Ctrl+Shift+G - Toggle Git status</p>
                <p>Ctrl+H - Toggle note history</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* History Sidebar */}
      {showHistory && !distractionFreeMode && (
        <div className="w-96 flex-shrink-0 h-full overflow-hidden">
          <NoteHistory
            filePath={getFilePath(selectedNote)}
            onViewVersion={handleViewHistoryVersion}
          />
        </div>
      )}

      {/* Git Status Sidebar */}
      {showGitStatus && !distractionFreeMode && (
        <div className="w-96 flex-shrink-0 h-full overflow-hidden">
          <GitStatus />
        </div>
      )}

      {/* History Modal */}
      {historyCommit && selectedNote && (
        <HistoryModal
          filePath={getFilePath(selectedNote)!}
          commitHash={historyCommit}
          onClose={handleCloseHistoryModal}
        />
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="text-center">
          <div className="text-4xl mb-4">📝</div>
          <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

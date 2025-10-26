'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PrimarySidebar from '@/components/PrimarySidebar';
import ExtendedSidebar from '@/components/ExtendedSidebar';
import MarkdownEditor from '@/components/MarkdownEditor';
import GitStatus from '@/components/GitStatus';
import NoteHistory from '@/components/NoteHistory';
import HistoryModal from '@/components/HistoryModal';
import { settingsAPI } from '@/lib/electron-api';

function DashboardContent() {
  const [showPrimarySidebar, setShowPrimarySidebar] = useState(true);
  const [showExtendedSidebar, setShowExtendedSidebar] = useState(false);
  const [extendedSidebarMode, setExtendedSidebarMode] = useState<'folders' | 'tags'>('folders');
  const [extendedSidebarPath, setExtendedSidebarPath] = useState('');
  const [showGitStatus, setShowGitStatus] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
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

  // Handle folder click from primary sidebar
  const handleFolderClick = (folderPath: string) => {
    setExtendedSidebarMode('folders');
    setExtendedSidebarPath(folderPath);
    setShowExtendedSidebar(true);
  };

  // Handle tag click from primary sidebar
  const handleTagClick = (tag: string) => {
    setExtendedSidebarMode('tags');
    setExtendedSidebarPath(tag);
    setShowExtendedSidebar(true);
  };

  // Handle closing extended sidebar
  const handleCloseExtendedSidebar = () => {
    setShowExtendedSidebar(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log('Dashboard received key:', e.key, 'Ctrl:', e.ctrlKey, 'Shift:', e.shiftKey, 'showPrimarySidebar:', showPrimarySidebar);

      // Ctrl + B for Primary Sidebar (B for sidebar/Browser)
      if (e.ctrlKey && !e.shiftKey && e.key === 'b') {
        e.preventDefault();
        e.stopPropagation();
        console.log('TOGGLING Primary Sidebar from', showPrimarySidebar, 'to', !showPrimarySidebar);
        setShowPrimarySidebar(prev => {
          const newValue = !prev;
          console.log('Primary Sidebar setState called, changing from', prev, 'to', newValue);
          return newValue;
        });
      }
      // Ctrl + Shift + G for GitStatus
      if (e.ctrlKey && e.shiftKey && (e.key === 'G' || e.key === 'g')) {
        e.preventDefault();
        e.stopPropagation();
        setShowGitStatus(prev => !prev);
      }
      // Ctrl + H for History
      if (e.ctrlKey && !e.shiftKey && e.key === 'h') {
        e.preventDefault();
        e.stopPropagation();
        setShowHistory(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true); // Use capture phase
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [showPrimarySidebar, showGitStatus]);

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
      {/* Primary Sidebar */}
      {showPrimarySidebar && (
        <PrimarySidebar
          onFolderClick={handleFolderClick}
          onTagClick={handleTagClick}
        />
      )}

      {/* Extended Sidebar */}
      {showExtendedSidebar && (
        <ExtendedSidebar
          mode={extendedSidebarMode}
          initialPath={extendedSidebarPath}
          selectedNote={selectedNote || undefined}
          onNoteSelect={handleNoteSelect}
          onClose={handleCloseExtendedSidebar}
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
                <p>Ctrl+B - Toggle sidebar</p>
                <p>Ctrl+Shift+G - Toggle Git status</p>
                <p>Ctrl+H - Toggle note history</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* History Sidebar */}
      {showHistory && (
        <div className="w-96 flex-shrink-0 h-full overflow-hidden">
          <NoteHistory
            filePath={getFilePath(selectedNote)}
            onViewVersion={handleViewHistoryVersion}
          />
        </div>
      )}

      {/* Git Status Sidebar */}
      {showGitStatus && (
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

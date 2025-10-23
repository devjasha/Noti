'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import FileTree from '@/components/FileTree';
import MarkdownEditor from '@/components/MarkdownEditor';
import GitStatus from '@/components/GitStatus';

function DashboardContent() {
  const [showFileTree, setShowFileTree] = useState(true);
  const [showGitStatus, setShowGitStatus] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedNote = searchParams.get('note');

  const handleNoteSelect = (slug: string) => {
    router.push(`/dashboard?note=${slug}`);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log('Dashboard received key:', e.key, 'Ctrl:', e.ctrlKey, 'Shift:', e.shiftKey, 'showFileTree:', showFileTree);

      // Ctrl + B for FileTree (B for sidebar/Browser)
      if (e.ctrlKey && !e.shiftKey && e.key === 'b') {
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
      if (e.ctrlKey && e.shiftKey && (e.key === 'G' || e.key === 'g')) {
        e.preventDefault();
        e.stopPropagation();
        setShowGitStatus(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true); // Use capture phase
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [showFileTree, showGitStatus]);

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--background)' }}>
      {/* File Tree Sidebar */}
      {showFileTree && (
        <div className="w-64 flex-shrink-0 overflow-hidden">
          <FileTree selectedNote={selectedNote || undefined} onNoteSelect={handleNoteSelect} />
        </div>
      )}

        {/* Note Editor/Viewer */}
        <div className="flex-1 overflow-auto">
          {selectedNote ? (
            <MarkdownEditor slug={selectedNote} />
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
              </div>
            </div>
          )}
        </div>

      {/* Git Status Sidebar */}
      {showGitStatus && (
        <div className="w-96 flex-shrink-0 overflow-auto p-4" style={{
          background: 'var(--background)',
          borderLeft: '1px solid var(--border-light)'
        }}>
          <GitStatus />
        </div>
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

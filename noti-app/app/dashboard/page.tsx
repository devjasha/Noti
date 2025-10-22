'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import FileTree from '@/components/FileTree';
import MarkdownEditor from '@/components/MarkdownEditor';
import GitStatus from '@/components/GitStatus';

export default function DashboardPage() {
  const [showFileTree, setShowFileTree] = useState(true);
  const [showGitStatus, setShowGitStatus] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedNote = searchParams.get('note');

  const handleNoteSelect = (slug: string) => {
    router.push(`/dashboard?note=${slug}`);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <header style={{
        background: 'var(--header-bg)',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div className="px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFileTree(!showFileTree)}
              className="p-1.5 rounded transition-all"
              style={{
                background: showFileTree ? 'rgba(61, 122, 237, 0.1)' : 'var(--surface)',
                border: '1px solid var(--border)',
                color: showFileTree ? 'var(--primary)' : 'var(--text-primary)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              title="Toggle File Tree"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3h7l1 2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
              </svg>
            </button>
            <Link
              href="/"
              className="text-xl font-bold transition-colors hover:opacity-80"
              style={{ color: 'var(--primary)' }}
            >
              Noti
            </Link>
          </div>
          <button
            onClick={() => setShowGitStatus(!showGitStatus)}
            className="p-1.5 rounded transition-all"
            style={{
              background: showGitStatus ? 'rgba(61, 122, 237, 0.1)' : 'var(--surface)',
              border: '1px solid var(--border)',
              color: showGitStatus ? 'var(--primary)' : 'var(--text-primary)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            title="Toggle Git Status"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
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
      </main>
    </div>
  );
}

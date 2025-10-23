'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface Note {
  slug: string;
  title: string;
  content: string;
  tags: string[];
  created: string;
  modified: string;
  folder: string;
  filePath: string;
}

interface HistoryModalProps {
  filePath: string;
  commitHash: string;
  onClose: () => void;
}

export default function HistoryModal({ filePath, commitHash, onClose }: HistoryModalProps) {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistoricalVersion();
  }, [filePath, commitHash]);

  const fetchHistoricalVersion = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/git/file-version?file=${encodeURIComponent(filePath)}&commit=${encodeURIComponent(commitHash)}`
      );

      if (response.ok) {
        const data = await response.json();
        setNote(data);
      } else {
        setError('Failed to load historical version');
      }
    } catch (err) {
      console.error('Error fetching historical version:', err);
      setError('Error loading historical version');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] flex flex-col"
        style={{
          background: 'var(--surface)',
          border: '2px solid var(--border-light)',
          borderRadius: 'var(--radius)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: 'var(--border-light)' }}
        >
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold truncate" style={{ color: 'var(--text-primary)' }}>
              {loading ? 'Loading...' : note?.title || 'Historical Version'}
            </h2>
            <div className="flex items-center gap-3 mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <span className="font-mono px-2 py-1" style={{
                background: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)'
              }}>
                {commitHash.substring(0, 7)}
              </span>
              <span>•</span>
              <span>{filePath}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 transition-all hover:scale-110"
            style={{
              background: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text-primary)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--primary)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--background)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-3xl mb-3">⏳</div>
                <p style={{ color: 'var(--text-muted)' }}>Loading historical version...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-3xl mb-3">❌</div>
                <p style={{ color: '#ef4444' }}>{error}</p>
              </div>
            </div>
          ) : note ? (
            <div className="space-y-6">
              {/* Metadata */}
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-sm font-medium"
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

              {/* Warning banner */}
              <div
                className="p-4 flex items-center gap-3"
                style={{
                  background: 'rgba(251, 191, 36, 0.1)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Historical Version (Read-Only)
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    This is a previous version of the note from commit {commitHash.substring(0, 7)}
                  </p>
                </div>
              </div>

              {/* Markdown Content */}
              <div
                className="prose prose-lg max-w-none p-6"
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--text-primary)'
                }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1 style={{ color: 'var(--text-primary)', borderBottom: '2px solid var(--border)' }} {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-light)' }} {...props} />
                    ),
                    h3: ({ node, ...props }) => <h3 style={{ color: 'var(--text-primary)' }} {...props} />,
                    h4: ({ node, ...props }) => <h4 style={{ color: 'var(--text-primary)' }} {...props} />,
                    h5: ({ node, ...props }) => <h5 style={{ color: 'var(--text-primary)' }} {...props} />,
                    h6: ({ node, ...props }) => <h6 style={{ color: 'var(--text-primary)' }} {...props} />,
                    p: ({ node, ...props }) => <p style={{ color: 'var(--text-secondary)' }} {...props} />,
                    a: ({ node, ...props }) => (
                      <a style={{ color: 'var(--primary)' }} {...props} />
                    ),
                    code: ({ node, className, children, ...props }) => {
                      const isInline = !className;
                      return isInline ? (
                        <code
                          style={{
                            background: 'var(--surface)',
                            padding: '2px 6px',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--secondary)',
                            fontSize: '0.9em'
                          }}
                          {...props}
                        >
                          {children}
                        </code>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                    pre: ({ node, ...props }) => (
                      <pre
                        style={{
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)',
                          padding: '1rem',
                          overflow: 'auto'
                        }}
                        {...props}
                      />
                    ),
                    blockquote: ({ node, ...props }) => (
                      <blockquote
                        style={{
                          borderLeft: '4px solid var(--primary)',
                          paddingLeft: '1rem',
                          color: 'var(--text-muted)',
                          fontStyle: 'italic'
                        }}
                        {...props}
                      />
                    ),
                    ul: ({ node, ...props }) => <ul style={{ color: 'var(--text-secondary)' }} {...props} />,
                    ol: ({ node, ...props }) => <ol style={{ color: 'var(--text-secondary)' }} {...props} />,
                    li: ({ node, ...props }) => <li style={{ color: 'var(--text-secondary)' }} {...props} />,
                  }}
                >
                  {note.content}
                </ReactMarkdown>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 p-6 border-t"
          style={{ borderColor: 'var(--border-light)' }}
        >
          <button
            onClick={onClose}
            className="px-6 py-3 text-sm font-semibold transition-all hover:scale-105"
            style={{
              background: 'var(--primary)',
              color: 'white',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-md)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary)'}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

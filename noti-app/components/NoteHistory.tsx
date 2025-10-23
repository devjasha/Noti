'use client';

import { useState, useEffect } from 'react';

interface FileCommit {
  hash: string;
  date: string;
  message: string;
  author_name: string;
  author_email: string;
  refs: string;
}

interface NoteHistoryProps {
  filePath: string | null;
  onViewVersion?: (commit: string) => void;
}

export default function NoteHistory({ filePath, onViewVersion }: NoteHistoryProps) {
  const [history, setHistory] = useState<FileCommit[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCommit, setSelectedCommit] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (filePath) {
      fetchHistory();
    } else {
      setHistory([]);
    }
  }, [filePath]);

  const fetchHistory = async () => {
    if (!filePath) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/git/history?file=${encodeURIComponent(filePath)}`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      } else {
        console.error('Failed to fetch history');
        setHistory([]);
      }
    } catch (error) {
      console.error('Error fetching file history:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewVersion = (commit: string) => {
    setSelectedCommit(commit);
    if (onViewVersion) {
      onViewVersion(commit);
    }
  };

  const toggleDetails = (hash: string) => {
    setShowDetails(prev => ({
      ...prev,
      [hash]: !prev[hash]
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!filePath) {
    return (
      <div className="h-full flex flex-col" style={{
        background: 'var(--surface)',
        borderLeft: '1px solid var(--border-light)'
      }}>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-3">
            <div className="text-4xl">📜</div>
            <p style={{ color: 'var(--text-muted)' }}>Select a note to view its history</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{
      background: 'var(--surface)',
      borderLeft: '1px solid var(--border-light)'
    }}>
      <div className="flex justify-between items-center p-4 border-b" style={{
        borderColor: 'var(--border-light)'
      }}>
        <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>History</h3>
        <span className="px-2 py-1 text-xs font-medium" style={{
          background: 'rgba(139, 92, 246, 0.1)',
          color: '#8b5cf6',
          borderRadius: 'var(--radius-sm)'
        }}>
          {history.length} {history.length === 1 ? 'commit' : 'commits'}
        </span>
      </div>

      <div className="flex-1 overflow-auto p-4">
      {loading ? (
        <div className="text-center py-12">
          <div className="text-2xl mb-3">⏳</div>
          <p style={{ color: 'var(--text-muted)' }}>Loading history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-3xl mb-3">📝</div>
          <p style={{ color: 'var(--text-muted)' }}>No commit history found</p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            This file hasn't been committed yet
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((commit, index) => (
            <div
              key={commit.hash}
              className="relative"
              style={{
                paddingLeft: '2rem'
              }}
            >
              {/* Timeline line */}
              {index < history.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    left: '0.5rem',
                    top: '2rem',
                    bottom: '-1rem',
                    width: '2px',
                    background: 'var(--border-light)'
                  }}
                />
              )}

              {/* Timeline dot */}
              <div
                style={{
                  position: 'absolute',
                  left: '0.25rem',
                  top: '0.75rem',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: selectedCommit === commit.hash ? 'var(--primary)' : 'var(--border)',
                  border: '2px solid var(--surface)',
                  boxShadow: selectedCommit === commit.hash ? '0 0 0 3px rgba(61, 122, 237, 0.2)' : 'none'
                }}
              />

              {/* Commit card */}
              <div
                className="p-4 space-y-3 transition-all cursor-pointer"
                style={{
                  background: selectedCommit === commit.hash ? 'rgba(61, 122, 237, 0.05)' : 'var(--background)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: selectedCommit === commit.hash ? '3px solid var(--primary)' : '3px solid transparent'
                }}
                onClick={() => toggleDetails(commit.hash)}
                onMouseEnter={(e) => {
                  if (selectedCommit !== commit.hash) {
                    e.currentTarget.style.background = 'var(--surface)';
                    e.currentTarget.style.borderLeftColor = 'var(--border)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCommit !== commit.hash) {
                    e.currentTarget.style.background = 'var(--background)';
                    e.currentTarget.style.borderLeftColor = 'transparent';
                  }
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {commit.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <span>{commit.author_name}</span>
                      <span>•</span>
                      <span>{formatDate(commit.date)}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewVersion(commit.hash);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold transition-all hover:scale-105"
                    style={{
                      background: 'var(--primary)',
                      color: 'white',
                      borderRadius: 'var(--radius-sm)',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary)'}
                  >
                    👁️ View
                  </button>
                </div>

                {showDetails[commit.hash] && (
                  <div className="pt-3 mt-3 space-y-2 text-sm" style={{
                    borderTop: '1px solid var(--border-light)'
                  }}>
                    <div className="flex items-start gap-2">
                      <span style={{ color: 'var(--text-muted)', minWidth: '80px' }}>Commit:</span>
                      <code className="font-mono text-xs px-2 py-1" style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-secondary)'
                      }}>
                        {commit.hash.substring(0, 7)}
                      </code>
                    </div>
                    <div className="flex items-start gap-2">
                      <span style={{ color: 'var(--text-muted)', minWidth: '80px' }}>Author:</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{commit.author_name} &lt;{commit.author_email}&gt;</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span style={{ color: 'var(--text-muted)', minWidth: '80px' }}>Date:</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{formatFullDate(commit.date)}</span>
                    </div>
                    {commit.refs && (
                      <div className="flex items-start gap-2">
                        <span style={{ color: 'var(--text-muted)', minWidth: '80px' }}>Refs:</span>
                        <span className="px-2 py-1 text-xs font-mono" style={{
                          background: 'rgba(16, 185, 129, 0.1)',
                          color: '#10b981',
                          borderRadius: 'var(--radius-sm)'
                        }}>
                          {commit.refs}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

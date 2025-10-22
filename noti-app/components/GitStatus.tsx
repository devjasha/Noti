'use client';

import { useState, useEffect } from 'react';

interface GitStatusData {
  modified: string[];
  created: string[];
  deleted: string[];
  current: string;
}

interface GitRemote {
  name: string;
  refs: {
    fetch: string;
    push: string;
  };
}

export default function GitStatus() {
  const [status, setStatus] = useState<GitStatusData | null>(null);
  const [remotes, setRemotes] = useState<GitRemote[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [showCommit, setShowCommit] = useState(false);
  const [showRemotes, setShowRemotes] = useState(false);
  const [showFiles, setShowFiles] = useState(false);

  useEffect(() => {
    fetchStatus();
    fetchRemotes();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/git/status');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error fetching git status:', error);
    }
  };

  const fetchRemotes = async () => {
    try {
      const response = await fetch('/api/git/remotes');
      const data = await response.json();
      setRemotes(data);
    } catch (error) {
      console.error('Error fetching git remotes:', error);
    }
  };


  const handleCommit = async () => {
    if (!commitMessage.trim()) return;

    setSyncing(true);
    try {
      await fetch('/api/git/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: commitMessage }),
      });
      setCommitMessage('');
      setShowCommit(false);
      setShowFiles(false);
      await fetchStatus();
    } catch (error) {
      console.error('Error committing:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleSync = async (action: 'pull' | 'push') => {
    setSyncing(true);
    try {
      await fetch('/api/git/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      await fetchStatus();
    } catch (error) {
      console.error(`Error ${action}ing:`, error);
    } finally {
      setSyncing(false);
    }
  };

  if (!status) return null;

  const hasChanges = (status.modified?.length || 0) + (status.created?.length || 0) + (status.deleted?.length || 0) > 0;

  return (
    <div className="p-6 space-y-5" style={{
      background: 'var(--surface)',
      border: '1px solid var(--border-light)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-md)',
      minHeight: '600px'
    }}>
      <div className="flex justify-between items-center pb-4" style={{
        borderBottom: '2px solid var(--border-light)'
      }}>
        <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Git Status</h3>
        <span className="px-3 py-1 text-xs font-semibold" style={{
          background: 'rgba(61, 122, 237, 0.1)',
          color: 'var(--primary)',
          borderRadius: 'var(--radius-sm)'
        }}>
          {status.current}
        </span>
      </div>

      {remotes.length > 0 && (
        <div className="p-4 space-y-3" style={{
          background: 'var(--background)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-light)'
        }}>
          <button
            onClick={() => setShowRemotes(!showRemotes)}
            className="flex items-center gap-2 w-full text-left font-medium transition-colors"
            style={{ color: 'var(--text-primary)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          >
            <span className="text-xs">{showRemotes ? '▼' : '▶'}</span>
            <span>Remote: {remotes[0].name}</span>
          </button>
          {showRemotes && (
            <div className="pl-6 space-y-2" style={{ color: 'var(--text-secondary)' }}>
              {remotes.map(remote => (
                <div key={remote.name} className="space-y-1 text-sm">
                  <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{remote.name}</div>
                  <div className="text-xs break-all font-mono" style={{ color: 'var(--text-muted)' }}>
                    {remote.refs.push}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {remotes.length === 0 && (
        <div className="p-4 space-y-2" style={{
          background: 'rgba(251, 191, 36, 0.1)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          borderRadius: 'var(--radius-sm)'
        }}>
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>No Remote Configured</span>
          </div>
          <code className="block text-xs p-2 mt-2 font-mono" style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)'
          }}>
            git remote add origin &lt;url&gt;
          </code>
        </div>
      )}

      {hasChanges && (
        <div className="p-4 space-y-4" style={{
          background: 'var(--background)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-light)'
        }}>
          <button
            onClick={() => setShowFiles(!showFiles)}
            className="w-full text-left space-y-3"
          >
            <div className="flex items-center gap-2 font-medium transition-colors"
              style={{ color: 'var(--text-primary)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            >
              <span className="text-xs">{showFiles ? '▼' : '▶'}</span>
              <span>Changes</span>
            </div>
            <div className="flex gap-4 pl-6">
              {status.modified && status.modified.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: '#f59e0b' }}></div>
                  <span className="text-sm font-medium" style={{ color: '#f59e0b' }}>
                    {status.modified.length} Modified
                  </span>
                </div>
              )}
              {status.created && status.created.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: '#10b981' }}></div>
                  <span className="text-sm font-medium" style={{ color: '#10b981' }}>
                    {status.created.length} Added
                  </span>
                </div>
              )}
              {status.deleted && status.deleted.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: '#ef4444' }}></div>
                  <span className="text-sm font-medium" style={{ color: '#ef4444' }}>
                    {status.deleted.length} Deleted
                  </span>
                </div>
              )}
            </div>
          </button>

          {showFiles && (
            <div className="pl-6 space-y-2 max-h-64 overflow-auto" style={{
              borderTop: '1px solid var(--border-light)',
              paddingTop: '1rem'
            }}>
              {status.modified && status.modified.map((file) => (
                <div key={file} className="flex items-center gap-3 p-2 transition-colors" style={{
                  borderRadius: 'var(--radius-sm)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span className="text-xs font-bold px-2 py-1 rounded" style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    color: '#f59e0b'
                  }}>M</span>
                  <span className="text-sm font-mono truncate" style={{ color: 'var(--text-secondary)' }}>{file}</span>
                </div>
              ))}
              {status.created && status.created.map((file) => (
                <div key={file} className="flex items-center gap-3 p-2 transition-colors" style={{
                  borderRadius: 'var(--radius-sm)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span className="text-xs font-bold px-2 py-1 rounded" style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981'
                  }}>A</span>
                  <span className="text-sm font-mono truncate" style={{ color: 'var(--text-secondary)' }}>{file}</span>
                </div>
              ))}
              {status.deleted && status.deleted.map((file) => (
                <div key={file} className="flex items-center gap-3 p-2 transition-colors" style={{
                  borderRadius: 'var(--radius-sm)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span className="text-xs font-bold px-2 py-1 rounded" style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444'
                  }}>D</span>
                  <span className="text-sm font-mono truncate" style={{ color: 'var(--text-secondary)' }}>{file}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        {hasChanges && !showCommit && (
          <button
            onClick={() => setShowCommit(true)}
            className="flex-1 px-5 py-3 text-sm text-white font-semibold transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'var(--primary)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-md)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary)'}
          >
            Commit Changes
          </button>
        )}
        <button
          onClick={() => handleSync('pull')}
          disabled={syncing}
          className="flex-1 px-5 py-3 text-sm font-semibold transition-all disabled:opacity-50"
          style={{
            background: 'var(--surface)',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius)',
            color: 'var(--text-primary)'
          }}
          onMouseEnter={(e) => !syncing && (e.currentTarget.style.borderColor = 'var(--primary)')}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          ↓ Pull
        </button>
        <button
          onClick={() => handleSync('push')}
          disabled={syncing}
          className="flex-1 px-5 py-3 text-sm font-semibold transition-all disabled:opacity-50"
          style={{
            background: 'var(--surface)',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius)',
            color: 'var(--text-primary)'
          }}
          onMouseEnter={(e) => !syncing && (e.currentTarget.style.borderColor = 'var(--primary)')}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          ↑ Push
        </button>
      </div>

      {showCommit && (
        <div className="space-y-4 pt-5 mt-3" style={{
          borderTop: '2px solid var(--border-light)'
        }}>
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Commit Message
            </label>
            <input
              type="text"
              placeholder="Enter your commit message..."
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              className="w-full px-4 py-3 transition-all focus:outline-none"
              style={{
                background: 'var(--surface)',
                border: '2px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(61, 122, 237, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleCommit()}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCommit}
              disabled={!commitMessage.trim() || syncing}
              className="flex-1 px-5 py-3 text-sm text-white font-semibold transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
              style={{
                background: 'var(--secondary)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              ✓ Commit
            </button>
            <button
              onClick={() => { setShowCommit(false); setCommitMessage(''); }}
              className="flex-1 px-5 py-3 text-sm font-semibold transition-all"
              style={{
                background: 'var(--surface)',
                border: '2px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--text-primary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.background = 'var(--background)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'var(--surface)';
              }}
            >
              × Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

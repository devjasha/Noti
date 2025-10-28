'use client';

import { useState, useEffect } from 'react';
import { gitAPI } from '../lib/electron-api';

interface GitStatusData {
  current: string;
  tracking: string | null;
  ahead: number;
  behind: number;
  files: Array<{ path: string; index: string; working_dir: string }>;
  staged: string[];
  modified: string[];
  created: string[];
  deleted: string[];
  renamed: Array<{ from: string; to: string }>;
  conflicted: string[];
  not_added: string[];
  isClean: boolean;
}

interface GitRemote {
  name: string;
  refs: {
    fetch: string;
    push: string;
  };
}

type FeedbackType = 'success' | 'error' | null;

export default function GitStatus() {
  const [status, setStatus] = useState<GitStatusData | null>(null);
  const [remotes, setRemotes] = useState<GitRemote[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [showCommit, setShowCommit] = useState(false);
  const [showRemotes, setShowRemotes] = useState(false);
  const [showFiles, setShowFiles] = useState(true); // Default to expanded
  const [feedback, setFeedback] = useState<{ type: FeedbackType; message: string } | null>(null);
  const [commitAndPush, setCommitAndPush] = useState(false);

  useEffect(() => {
    fetchStatus();
    fetchRemotes();

    // Poll for git status every 5 seconds to catch external changes
    const interval = setInterval(() => {
      fetchStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const data = await gitAPI.status();
      setStatus(data);
    } catch (error) {
      console.error('Error fetching git status:', error);
    }
  };

  const fetchRemotes = async () => {
    try {
      const data = await gitAPI.remotes();
      setRemotes(data);
    } catch (error) {
      console.error('Error fetching git remotes:', error);
    }
  };

  const showFeedback = (type: FeedbackType, message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleCommit = async () => {
    if (!commitMessage.trim()) return;

    setSyncing(true);
    try {
      await gitAPI.commit(commitMessage);
      const savedMessage = commitMessage;
      setCommitMessage('');
      setShowCommit(false);
      await fetchStatus();

      // If commit & push is enabled, automatically push
      if (commitAndPush && remotes.length > 0) {
        await handleSync('push');
      } else {
        showFeedback('success', 'Changes committed successfully!');
      }
    } catch (error) {
      console.error('Error committing:', error);
      showFeedback('error', 'Error committing changes');
    } finally {
      setSyncing(false);
    }
  };

  const handleSync = async (action: 'pull' | 'push') => {
    setSyncing(true);
    try {
      await gitAPI.sync(action);
      await fetchStatus();
      showFeedback('success', `Successfully ${action === 'pull' ? 'pulled from' : 'pushed to'} remote!`);
    } catch (error) {
      console.error(`Error ${action}ing:`, error);
      showFeedback('error', `Error ${action}ing changes`);
    } finally {
      setSyncing(false);
    }
  };

  if (!status) return null;

  const hasChanges = (status.modified?.length || 0) + (status.created?.length || 0) + (status.deleted?.length || 0) > 0;

  return (
    <div className="h-full flex flex-col" style={{
      background: 'var(--surface)',
      borderLeft: '1px solid var(--border-light)'
    }}>
      <div className="flex justify-between items-center p-4 border-b" style={{
        borderColor: 'var(--border-light)'
      }}>
        <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Git Status</h3>
        <span className="px-2 py-1 text-xs font-medium" style={{
          background: 'rgba(61, 122, 237, 0.1)',
          color: 'var(--primary)',
          borderRadius: 'var(--radius-sm)'
        }}>
          {status.current}
        </span>
      </div>

      {/* Feedback notification */}
      {feedback && (
        <div
          className="mx-4 mt-4 p-3 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
          style={{
            background: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${feedback.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: feedback.type === 'success' ? '#10b981' : '#ef4444'
          }}
        >
          <span>{feedback.type === 'success' ? '✓' : '✕'}</span>
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="flex-1 overflow-auto p-4 space-y-4">
      {remotes.length > 0 && (
        <div className="p-3 space-y-3" style={{
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
        <div className="p-3 space-y-4" style={{
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
      </div>

      {/* Fixed bottom action buttons */}
      <div className="border-t p-4 space-y-3" style={{ borderColor: 'var(--border-light)' }}>
      <div className="flex gap-2">
        {hasChanges && !showCommit && (
          <button
            onClick={() => setShowCommit(true)}
            className="flex-1 px-3 py-2 text-sm text-white font-medium transition-all"
            style={{
              background: 'var(--primary)',
              borderRadius: 'var(--radius-sm)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary)'}
          >
            Commit
          </button>
        )}
        <button
          onClick={() => handleSync('pull')}
          disabled={syncing}
          className="flex-1 px-3 py-2 text-sm font-medium transition-all disabled:opacity-50"
          style={{
            background: 'var(--background)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
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
          className="flex-1 px-3 py-2 text-sm font-medium transition-all disabled:opacity-50"
          style={{
            background: 'var(--background)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)'
          }}
          onMouseEnter={(e) => !syncing && (e.currentTarget.style.borderColor = 'var(--primary)')}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          ↑ Push
        </button>
      </div>

      {showCommit && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Commit Message
            </label>
            <textarea
              placeholder="Enter commit message..."
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-sm transition-all focus:outline-none resize-none"
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
              autoFocus
            />
          </div>

          {remotes.length > 0 && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={commitAndPush}
                onChange={(e) => setCommitAndPush(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
                style={{ accentColor: 'var(--primary)' }}
              />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Automatically push after commit
              </span>
            </label>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleCommit}
              disabled={!commitMessage.trim() || syncing}
              className="flex-1 px-3 py-2.5 text-sm text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{
                background: commitAndPush ? 'var(--primary)' : 'var(--secondary)',
                borderRadius: 'var(--radius-sm)'
              }}
              onMouseEnter={(e) => !syncing && (e.currentTarget.style.transform = 'scale(1.02)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {syncing ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>{commitAndPush ? 'Committing & Pushing...' : 'Committing...'}</span>
                </>
              ) : (
                <>
                  <span>✓</span>
                  <span>{commitAndPush ? 'Commit & Push' : 'Commit'}</span>
                </>
              )}
            </button>
            <button
              onClick={() => { setShowCommit(false); setCommitMessage(''); setCommitAndPush(false); }}
              disabled={syncing}
              className="px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-50"
              style={{
                background: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)'
              }}
              onMouseEnter={(e) => !syncing && (e.currentTarget.style.borderColor = 'var(--primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              × Cancel
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

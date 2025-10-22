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
    <div className="p-5 space-y-3" style={{
      background: 'var(--surface)',
      border: '1px solid var(--border-light)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="flex justify-between items-center">
        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Git Status</h3>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Branch: {status.current}</span>
      </div>

      {remotes.length > 0 && (
        <div className="text-sm border-b pb-2 dark:border-gray-700">
          <button
            onClick={() => setShowRemotes(!showRemotes)}
            className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            <span>{showRemotes ? '▼' : '▶'}</span>
            Remote: {remotes[0].name}
          </button>
          {showRemotes && (
            <div className="mt-2 pl-4 text-xs text-gray-500 dark:text-gray-400 break-all">
              {remotes.map(remote => (
                <div key={remote.name} className="space-y-1">
                  <div><strong>{remote.name}</strong></div>
                  <div>Push: {remote.refs.push}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {remotes.length === 0 && (
        <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
          ⚠️ No remote configured. Set up with: <code className="text-xs bg-gray-200 dark:bg-gray-700 px-1 rounded">git remote add origin &lt;url&gt;</code>
        </div>
      )}

      {hasChanges && (
        <div className="text-sm space-y-2">
          <button
            onClick={() => setShowFiles(!showFiles)}
            className="w-full text-left space-y-1"
          >
            <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
              <span>{showFiles ? '▼' : '▶'}</span>
              <span className="font-medium">Changes:</span>
            </div>
            <div className="pl-4 space-y-0.5">
              {status.modified && status.modified.length > 0 && (
                <div className="text-yellow-600 dark:text-yellow-400">
                  Modified: {status.modified.length}
                </div>
              )}
              {status.created && status.created.length > 0 && (
                <div className="text-green-600 dark:text-green-400">
                  Created: {status.created.length}
                </div>
              )}
              {status.deleted && status.deleted.length > 0 && (
                <div className="text-red-600 dark:text-red-400">
                  Deleted: {status.deleted.length}
                </div>
              )}
            </div>
          </button>

          {showFiles && (
            <div className="pl-4 space-y-1 max-h-48 overflow-auto">
              {status.modified && status.modified.map((file) => (
                <div key={file} className="flex items-center gap-2 text-xs">
                  <span className="text-yellow-600 dark:text-yellow-400">M</span>
                  <span className="text-gray-700 dark:text-gray-300 font-mono truncate">{file}</span>
                </div>
              ))}
              {status.created && status.created.map((file) => (
                <div key={file} className="flex items-center gap-2 text-xs">
                  <span className="text-green-600 dark:text-green-400">A</span>
                  <span className="text-gray-700 dark:text-gray-300 font-mono truncate">{file}</span>
                </div>
              ))}
              {status.deleted && status.deleted.map((file) => (
                <div key={file} className="flex items-center gap-2 text-xs">
                  <span className="text-red-600 dark:text-red-400">D</span>
                  <span className="text-gray-700 dark:text-gray-300 font-mono truncate">{file}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        {hasChanges && !showCommit && (
          <button
            onClick={() => setShowCommit(true)}
            className="px-4 py-2 text-sm text-white font-medium transition-all"
            style={{
              background: 'var(--primary)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-sm)'
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
          className="px-4 py-2 text-sm font-medium transition-all disabled:opacity-50"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            color: 'var(--text-primary)'
          }}
          onMouseEnter={(e) => !syncing && (e.currentTarget.style.background = 'var(--border-light)')}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surface)'}
        >
          Pull
        </button>
        <button
          onClick={() => handleSync('push')}
          disabled={syncing}
          className="px-4 py-2 text-sm font-medium transition-all disabled:opacity-50"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            color: 'var(--text-primary)'
          }}
          onMouseEnter={(e) => !syncing && (e.currentTarget.style.background = 'var(--border-light)')}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surface)'}
        >
          Push
        </button>
      </div>

      {showCommit && (
        <div className="space-y-2 pt-3" style={{ borderTop: '1px solid var(--border-light)' }}>
          <input
            type="text"
            placeholder="Commit message..."
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            className="w-full px-3 py-2 transition-all focus:outline-none"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
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
            onKeyPress={(e) => e.key === 'Enter' && handleCommit()}
          />
          <div className="flex gap-2">
            <button
              onClick={handleCommit}
              disabled={!commitMessage.trim() || syncing}
              className="px-4 py-2 text-sm text-white font-medium transition-all disabled:opacity-50"
              style={{
                background: 'var(--secondary)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              Commit
            </button>
            <button
              onClick={() => { setShowCommit(false); setCommitMessage(''); }}
              className="px-4 py-2 text-sm font-medium transition-all"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--text-primary)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--border-light)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surface)'}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

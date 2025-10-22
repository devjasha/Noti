'use client';

import { useState } from 'react';

export default function GitSetup() {
  const [remoteUrl, setRemoteUrl] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div className="border rounded-lg p-4 space-y-3 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/10">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100">
          🚀 Set Up Git Sync
        </h3>
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {showInstructions ? 'Hide' : 'Show'} Instructions
        </button>
      </div>

      {showInstructions && (
        <div className="text-sm space-y-3">
          <div>
            <p className="font-semibold mb-2">Step 1: Create a Private Repository</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Go to GitHub/GitLab/Gitea</li>
              <li>Create a new <strong>private</strong> repository</li>
              <li>Copy the repository URL</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold mb-2">Step 2: Configure Remote</p>
            <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-xs overflow-x-auto">
              <div>cd /home/bwardsen/work/note-system/notes</div>
              <div className="mt-2">git remote add origin {remoteUrl || '<your-repo-url>'}</div>
              <div>git branch -M main</div>
              <div>git push -u origin main</div>
            </div>
          </div>

          <div>
            <p className="font-semibold mb-2">Step 3: Set Up Authentication</p>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <div>
                <strong>Option A: SSH Keys (Recommended)</strong>
                <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-xs mt-1">
                  <div># Generate SSH key</div>
                  <div>ssh-keygen -t ed25519 -C "your@email.com"</div>
                  <div className="mt-2"># Add to GitHub/GitLab</div>
                  <div>cat ~/.ssh/id_ed25519.pub</div>
                </div>
                <p className="text-xs mt-1">Then add the public key to your Git provider</p>
              </div>

              <div className="mt-3">
                <strong>Option B: Personal Access Token</strong>
                <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-xs mt-1">
                  <div># Set credentials</div>
                  <div>git config --global credential.helper store</div>
                  <div className="mt-2"># Use HTTPS URL with token</div>
                  <div>https://&lt;token&gt;@github.com/user/repo.git</div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-3 dark:border-gray-700">
            <p className="font-semibold mb-2">Paste Your Repository URL:</p>
            <input
              type="text"
              value={remoteUrl}
              onChange={(e) => setRemoteUrl(e.target.value)}
              placeholder="https://github.com/username/my-notes.git"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 font-mono text-sm"
            />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              This will update the commands above with your URL
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded text-xs">
            <strong className="text-yellow-800 dark:text-yellow-200">💡 Pro Tip:</strong>
            <p className="text-yellow-700 dark:text-yellow-300 mt-1">
              Use SSH for better security and no password prompts. Create a deploy key in your repository settings for read/write access.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

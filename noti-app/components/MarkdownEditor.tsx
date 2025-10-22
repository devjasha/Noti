'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface MarkdownEditorProps {
  slug: string;
}

export default function MarkdownEditor({ slug }: MarkdownEditorProps) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [diff, setDiff] = useState<string>('');
  const [originalContent, setOriginalContent] = useState('');

  useEffect(() => {
    if (slug !== 'new') {
      fetchNote();
    } else {
      setLoading(false);
    }
  }, [slug]);

  const fetchNote = async () => {
    try {
      const response = await fetch(`/api/notes/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setContent(data.content);
        setOriginalContent(data.content); // Save original for diff
        setTitle(data.title);
        setTags(data.tags);
      }
    } catch (error) {
      console.error('Error fetching note:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiff = async () => {
    try {
      const filePath = `${slug}.md`;
      const response = await fetch(`/api/git/diff?file=${encodeURIComponent(filePath)}`);
      if (response.ok) {
        const data = await response.json();
        return data.diff || '';
      }
    } catch (error) {
      console.error('Error fetching diff:', error);
    }
    return '';
  };

  const generateClientDiff = () => {
    // Generate a simple diff showing current changes vs original
    const originalLines = originalContent.split('\n');
    const currentLines = content.split('\n');

    let diffOutput = `diff --git a/${slug}.md b/${slug}.md\n`;
    diffOutput += `--- a/${slug}.md\n`;
    diffOutput += `+++ b/${slug}.md\n`;

    // Simple line-by-line comparison
    const maxLines = Math.max(originalLines.length, currentLines.length);
    let hasChanges = false;

    for (let i = 0; i < maxLines; i++) {
      const origLine = originalLines[i] || '';
      const currLine = currentLines[i] || '';

      if (origLine !== currLine) {
        if (!hasChanges) {
          diffOutput += `@@ -${i + 1},${maxLines - i} +${i + 1},${maxLines - i} @@\n`;
          hasChanges = true;
        }

        if (origLine && i < originalLines.length) {
          diffOutput += `-${origLine}\n`;
        }
        if (currLine && i < currentLines.length) {
          diffOutput += `+${currLine}\n`;
        }
      }
    }

    return hasChanges ? diffOutput : '';
  };

  const toggleDiff = async () => {
    if (!showDiff) {
      // First try to get git diff
      const gitDiff = await fetchDiff();

      if (gitDiff) {
        // Use git diff if available
        setDiff(gitDiff);
      } else if (content !== originalContent) {
        // Otherwise, generate client-side diff for unsaved changes
        const clientDiff = generateClientDiff();
        setDiff(clientDiff);
      } else {
        // No changes at all
        setDiff('');
      }
    }
    setShowDiff(!showDiff);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const endpoint = slug === 'new' ? '/api/notes' : `/api/notes/${slug}`;
      const method = slug === 'new' ? 'POST' : 'PUT';

      const body = {
        slug: slug === 'new' ? title.toLowerCase().replace(/\s+/g, '-') : slug,
        content,
        metadata: { title, tags },
      };

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        if (slug === 'new') {
          router.push(`/note/${data.slug}`);
        }
      }
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleTagAdd = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleTagRemove = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  if (loading) {
    return <div className="text-center py-8">Loading note...</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            ← Back
          </button>

          <input
            type="text"
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 px-3 py-2 text-lg font-semibold bg-transparent focus:outline-none"
          />

          <button
            onClick={() => {
              setShowPreview(!showPreview);
              if (!showPreview) setShowDiff(false); // Close diff when opening preview
            }}
            className={`px-3 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
              showPreview ? 'bg-blue-100 dark:bg-blue-900 border-blue-500' : ''
            }`}
          >
            {showPreview ? '✓ Preview' : 'Preview'}
          </button>

          {slug !== 'new' && (
            <button
              onClick={() => {
                toggleDiff();
                if (!showDiff) setShowPreview(false); // Close preview when opening diff
              }}
              className={`px-3 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
                showDiff ? 'bg-blue-100 dark:bg-blue-900 border-blue-500' : ''
              }`}
            >
              {showDiff ? '✓ Diff' : 'Diff'}
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        <div className="px-4 pb-3 flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Tags:</span>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded flex items-center gap-1"
              >
                {tag}
                <button
                  onClick={() => handleTagRemove(tag)}
                  className="hover:text-red-600"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder="Add tag..."
              className="px-2 py-1 text-xs border rounded focus:outline-none dark:bg-gray-800 dark:border-gray-700"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleTagAdd(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex">
        {/* Left side: Always show editor */}
        <div className={showDiff || showPreview ? "w-1/2 border-r dark:border-gray-700" : "w-full"}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing in Markdown..."
            className="w-full h-full p-8 resize-none focus:outline-none bg-transparent font-mono"
          />
        </div>

        {/* Right side: Show diff or preview */}
        {showDiff && (
          <div className="w-1/2 h-full overflow-auto p-8 bg-gray-50 dark:bg-gray-900">
            <h3 className="text-lg font-semibold mb-4">Git Diff</h3>
            {diff ? (
              <div className="border rounded dark:border-gray-700 font-mono text-sm bg-white dark:bg-gray-800">
                {diff.split('\n').map((line, idx) => (
                  <div
                    key={idx}
                    className={
                      line.startsWith('+') && !line.startsWith('+++')
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-3 py-0.5'
                        : line.startsWith('-') && !line.startsWith('---')
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-3 py-0.5'
                        : line.startsWith('@@')
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-0.5 font-semibold'
                        : line.startsWith('diff') || line.startsWith('index') || line.startsWith('---') || line.startsWith('+++')
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-0.5'
                        : 'text-gray-700 dark:text-gray-300 px-3 py-0.5'
                    }
                  >
                    {line || ' '}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400">
                No changes detected for this file.
              </div>
            )}
          </div>
        )}

        {showPreview && !showDiff && (
          <div className="w-1/2 h-full overflow-auto p-8 bg-gray-50 dark:bg-gray-900 prose dark:prose-invert max-w-none">
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }} />
          </div>
        )}
      </main>
    </div>
  );
}

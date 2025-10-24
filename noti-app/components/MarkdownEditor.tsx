'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface MarkdownEditorProps {
  slug: string;
}

export default function MarkdownEditor({ slug }: MarkdownEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [folder, setFolder] = useState<string>('');
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
      // New note: check for template and folder in URL params
      const templateSlug = searchParams.get('template');
      const folderParam = searchParams.get('folder');

      // Set folder even if it's empty string (means root folder)
      if (folderParam !== null) {
        setFolder(folderParam);
      }

      if (templateSlug) {
        loadTemplate(templateSlug);
      } else {
        setLoading(false);
      }
    }
  }, [slug, searchParams]);

  const loadTemplate = async (templateSlug: string) => {
    try {
      const response = await fetch(`/api/templates/${templateSlug}`);
      if (response.ok) {
        const template = await response.json();
        setContent(template.content);
        setTitle(template.title);
      }
    } catch (error) {
      console.error('Error loading template:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNote = async () => {
    try {
      const response = await fetch(`/api/notes/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setContent(data.content);
        setOriginalContent(data.content); // Save original for diff
        setTitle(data.title);
        setTags(data.tags);
      } else {
        console.error('Failed to fetch note:', response.status, response.statusText);
        // Set empty content so editor is still usable
        setContent('');
        setTitle('Note not found');
      }
    } catch (error) {
      console.error('Error fetching note:', error);
      setContent('');
      setTitle('Error loading note');
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

      // Generate slug with folder path if creating new note
      let noteSlug = slug;
      if (slug === 'new') {
        const baseName = title.toLowerCase().replace(/\s+/g, '-');
        noteSlug = folder ? `${folder}/${baseName}` : baseName;
      }

      const body = {
        slug: noteSlug,
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
          // Navigate to the newly created note
          router.push(`/dashboard?note=${data.slug}`);
        } else {
          // Update original content to reflect saved state
          setOriginalContent(content);
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

  const insertMarkdown = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || placeholder;
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);

    setContent(newText);

    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      insertMarkdown('[', `](${url})`, 'link text');
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      const alt = prompt('Enter image description (optional):') || 'image';
      insertMarkdown(`![${alt}](${url})`);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading note...</div>;
  }

  const lineNumbers = content.split('\n').length;

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--background)' }}>
      <header style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div className="px-6 py-4 flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              placeholder="Untitled Note"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="px-0 py-1 text-2xl font-bold bg-transparent focus:outline-none"
              style={{ color: 'var(--text-primary)' }}
            />

            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="px-2.5 py-1 text-xs font-medium flex items-center gap-1.5"
                  style={{
                    background: 'rgba(61, 122, 237, 0.1)',
                    color: 'var(--primary)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  {tag}
                  <button
                    onClick={() => handleTagRemove(tag)}
                    className="hover:opacity-70 transition-opacity"
                    style={{ color: 'var(--primary)' }}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder="Add tag..."
                className="px-2.5 py-1 text-xs rounded focus:outline-none transition-all"
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  width: '100px'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(61, 122, 237, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleTagAdd(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="px-5 py-2 text-sm font-semibold text-white rounded transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              style={{
                background: 'var(--primary)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-sm)'
              }}
              onMouseEnter={(e) => !saving && (e.currentTarget.style.background = 'var(--primary-hover)')}
              onMouseLeave={(e) => !saving && (e.currentTarget.style.background = 'var(--primary)')}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center gap-1 px-3 py-1.5" style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border-light)'
        }}>
          <button
            onClick={() => insertMarkdown('**', '**', 'bold text')}
            className="p-1.5 rounded transition-all"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--text-primary)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            title="Bold"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
              <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
            </svg>
          </button>
          <button
            onClick={() => insertMarkdown('*', '*', 'italic text')}
            className="p-1.5 rounded transition-all"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--text-primary)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            title="Italic"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="4" x2="10" y2="4"/>
              <line x1="14" y1="20" x2="5" y2="20"/>
              <line x1="15" y1="4" x2="9" y2="20"/>
            </svg>
          </button>
          <button
            onClick={() => insertMarkdown('# ', '', 'Heading')}
            className="p-1.5 rounded transition-all"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--text-primary)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            title="Heading"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 12h8m-8-6v12m8-12v12m5-9h6m-6 6h6m-6-3h6"/>
            </svg>
          </button>
          <div style={{ width: '1px', height: '18px', background: 'var(--border)' }}></div>
          <button
            onClick={insertLink}
            className="p-1.5 rounded transition-all"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--text-primary)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            title="Insert Link"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          </button>
          <button
            onClick={insertImage}
            className="p-1.5 rounded transition-all"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--text-primary)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            title="Insert Image"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
          </button>
          <button
            onClick={() => insertMarkdown('- ', '', 'List item')}
            className="p-1.5 rounded transition-all"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--text-primary)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            title="Bullet List"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6"/>
              <line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/>
              <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </button>
          <button
            onClick={() => insertMarkdown('`', '`', 'code')}
            className="p-1.5 rounded transition-all"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--text-primary)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            title="Inline Code"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6"/>
              <polyline points="8 6 2 12 8 18"/>
            </svg>
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden relative">
          {/* Floating Action Menu - Always Bottom Right */}
          <div
            className="absolute flex flex-col gap-2 z-10"
            style={{
              bottom: '1.5rem',
              right: '1.5rem',
              filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))'
            }}
          >
              <button
                onClick={() => {
                  setShowPreview(!showPreview);
                  if (!showPreview) setShowDiff(false);
                }}
                className="p-3 rounded-lg transition-all hover:scale-110 active:scale-95"
                style={{
                  background: showPreview ? 'var(--primary)' : 'var(--surface)',
                  border: '2px solid var(--border-light)',
                  color: showPreview ? 'white' : 'var(--text-primary)',
                  boxShadow: 'var(--shadow-md)'
                }}
                onMouseEnter={(e) => {
                  if (!showPreview) {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.background = 'rgba(61, 122, 237, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!showPreview) {
                    e.currentTarget.style.borderColor = 'var(--border-light)';
                    e.currentTarget.style.background = 'var(--surface)';
                  }
                }}
                title="Toggle Preview"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>

              {slug !== 'new' && (
                <button
                  onClick={() => {
                    toggleDiff();
                    if (!showDiff) setShowPreview(false);
                  }}
                  className="p-3 rounded-lg transition-all hover:scale-110 active:scale-95"
                  style={{
                    background: showDiff ? 'var(--primary)' : 'var(--surface)',
                    border: '2px solid var(--border-light)',
                    color: showDiff ? 'white' : 'var(--text-primary)',
                    boxShadow: 'var(--shadow-md)'
                  }}
                  onMouseEnter={(e) => {
                    if (!showDiff) {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.background = 'rgba(61, 122, 237, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!showDiff) {
                      e.currentTarget.style.borderColor = 'var(--border-light)';
                      e.currentTarget.style.background = 'var(--surface)';
                    }
                  }}
                  title="Toggle Diff"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18"/>
                    <path d="M9 7h.01M9 12h.01M9 17h.01M15 7h.01M15 12h.01M15 17h.01"/>
                  </svg>
                </button>
              )}
            </div>

          {/* Left side: Always show editor */}
          <div
            className={showDiff || showPreview ? "w-1/2 flex" : "w-full flex"}
            style={{
              borderRight: showDiff || showPreview ? '1px solid var(--border-light)' : 'none'
            }}
          >
            {/* Line Numbers */}
            <div
              className="flex flex-col py-8 pr-4 pl-6 text-right select-none font-mono"
              style={{
                background: 'var(--surface)',
                color: 'var(--text-muted)',
                fontSize: '15px',
                lineHeight: '1.7',
                borderRight: '1px solid var(--border-light)',
                minWidth: '60px'
              }}
            >
              {Array.from({ length: Math.max(lineNumbers, 1) }, (_, i) => (
                <div key={i + 1}>{i + 1}</div>
              ))}
            </div>

            {/* Editor */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing in Markdown..."
              className="flex-1 h-full py-8 px-6 resize-none focus:outline-none font-mono"
              style={{
                background: 'var(--surface)',
                color: 'var(--text-primary)',
                fontSize: '15px',
                lineHeight: '1.7'
              }}
            />
          </div>

        {/* Right side: Show diff or preview */}
        {showDiff && (
          <div className="w-1/2 h-full overflow-auto p-8" style={{ background: 'var(--background)' }}>
            <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Git Diff
            </h3>
            {diff ? (
              <div className="font-mono text-sm rounded overflow-hidden" style={{
                border: '1px solid var(--border-light)',
                background: 'var(--surface)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                {diff.split('\n').map((line, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-1"
                    style={{
                      background:
                        line.startsWith('+') && !line.startsWith('+++')
                          ? 'rgba(16, 185, 129, 0.1)'
                          : line.startsWith('-') && !line.startsWith('---')
                          ? 'rgba(239, 68, 68, 0.1)'
                          : line.startsWith('@@')
                          ? 'rgba(61, 122, 237, 0.1)'
                          : line.startsWith('diff') || line.startsWith('index') || line.startsWith('---') || line.startsWith('+++')
                          ? 'var(--background)'
                          : 'transparent',
                      color:
                        line.startsWith('+') && !line.startsWith('+++')
                          ? '#10b981'
                          : line.startsWith('-') && !line.startsWith('---')
                          ? '#ef4444'
                          : line.startsWith('@@')
                          ? 'var(--primary)'
                          : line.startsWith('diff') || line.startsWith('index') || line.startsWith('---') || line.startsWith('+++')
                          ? 'var(--text-muted)'
                          : 'var(--text-secondary)',
                      fontWeight: line.startsWith('@@') ? 600 : 400,
                      borderLeft: line.startsWith('+') && !line.startsWith('+++')
                          ? '3px solid #10b981'
                          : line.startsWith('-') && !line.startsWith('---')
                          ? '3px solid #ef4444'
                          : '3px solid transparent'
                    }}
                  >
                    {line || ' '}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center rounded" style={{
                background: 'var(--surface)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-muted)'
              }}>
                No changes detected for this file.
              </div>
            )}
          </div>
        )}

        {showPreview && !showDiff && (
          <div className="w-1/2 h-full overflow-auto py-8 px-6" style={{
            background: 'var(--surface)'
          }}>
            <div
              className="max-w-none"
              style={{
                color: 'var(--text-primary)',
                lineHeight: '1.7'
              }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ node, ...props }) => <p style={{ margin: '0.5em 0', color: 'var(--text-secondary)' }} {...props} />,
                  br: () => <br />,
                }}
              >
                {content
                  // First, convert multiple newlines to preserve spacing by adding placeholder paragraphs
                  .replace(/\n\n+/g, (match) => {
                    // For each pair of newlines beyond the first, add an empty paragraph marker
                    const extraNewlines = match.length - 2;
                    return '\n\n' + ('&nbsp;\n\n'.repeat(extraNewlines));
                  })
                  // Then add double spaces before single newlines for line breaks
                  .replace(/([^\n])\n([^\n])/g, '$1  \n$2')
                }
              </ReactMarkdown>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}

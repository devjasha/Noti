'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { notesAPI, templatesAPI, gitAPI } from '../lib/electron-api';
import Tiptap from './TipTap';
import TagInput from './TagInput';
import { useEditorStore } from '../store/editorStore';

interface MarkdownEditorProps {
  slug: string;
}

export default function MarkdownEditor({ slug: propSlug }: MarkdownEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Zustand store
  const {
    content,
    title,
    tags,
    folder,
    loading,
    saveStatus,
    showPreview,
    showDiff,
    diff,
    originalContent,
    setContent,
    setTitle,
    addTag,
    removeTag,
    setFolder,
    setLoading,
    setSaving,
    setSaveStatus,
    setShowPreview,
    setShowDiff,
    setDiff,
    setOriginalContent,
    setSlug,
    loadNote,
  } = useEditorStore();

  // Initialize slug from props
  useEffect(() => {
    setSlug(propSlug);
  }, [propSlug, setSlug]);

  useEffect(() => {
    if (propSlug !== 'new') {
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
  }, [propSlug, searchParams, setFolder, setLoading]);

  const loadTemplate = async (templateSlug: string) => {
    try {
      const template = await templatesAPI.get(templateSlug);
      setContent(template.content);
      setTitle(template.title);
    } catch (error) {
      console.error('Error loading template:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNote = async () => {
    try {
      const data = await notesAPI.get(propSlug);
      loadNote({
        content: data.content,
        title: data.title,
        tags: data.tags,
        slug: propSlug,
      });
    } catch (error) {
      console.error('Error fetching note:', error);
      setContent('');
      setTitle('Error loading note');
      setLoading(false);
    }
  };

  const fetchDiff = async () => {
    try {
      const filePath = `${propSlug}.md`;
      const data = await gitAPI.diff(filePath);
      return data.diff || '';
    } catch (error) {
      console.error('Error fetching diff:', error);
    }
    return '';
  };

  const generateClientDiff = () => {
    // Generate a simple diff showing current changes vs original
    const originalLines = originalContent.split('\n');
    const currentLines = content.split('\n');

    let diffOutput = `diff --git a/${propSlug}.md b/${propSlug}.md\n`;
    diffOutput += `--- a/${propSlug}.md\n`;
    diffOutput += `+++ b/${propSlug}.md\n`;

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

  const handleSave = useCallback(async () => {
    // Don't save if it's a new note without a title
    if (propSlug === 'new' && !title.trim()) {
      return;
    }

    setSaving(true);
    setSaveStatus('saving');

    try {
      // Generate slug with folder path if creating new note
      let noteSlug = propSlug;
      if (propSlug === 'new') {
        const baseName = title.toLowerCase().replace(/\s+/g, '-');
        noteSlug = folder ? `${folder}/${baseName}` : baseName;
      }

      const body = {
        slug: noteSlug,
        content,
        metadata: { title, tags },
      };

      if (propSlug === 'new') {
        const data = await notesAPI.create(body);
        // Navigate to the newly created note
        router.push(`/dashboard?note=${data.slug}`);
      } else {
        await notesAPI.update(propSlug, body);
        // Update original content to reflect saved state
        setOriginalContent(content);
      }

      setSaveStatus('saved');
    } catch (error) {
      console.error('Error saving note:', error);
      setSaveStatus('unsaved');
    } finally {
      setSaving(false);
    }
  }, [propSlug, title, folder, content, tags, router, setSaving, setSaveStatus, setOriginalContent]);

  // Auto-save with debounce
  useEffect(() => {
    // Skip auto-save for new notes without title or if nothing changed
    if (propSlug === 'new' && !title.trim()) {
      return;
    }

    if (propSlug !== 'new' && content === originalContent && title && tags) {
      return;
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Mark as unsaved
    setSaveStatus('unsaved');

    // Set new timeout for auto-save (2 seconds after typing stops)
    saveTimeoutRef.current = setTimeout(() => {
      handleSave();
    }, 2000);

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [content, title, tags, propSlug, originalContent, handleSave, setSaveStatus]);

  // Ctrl+S keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  const handleTagAdd = (tag: string) => {
    addTag(tag);
  };

  const handleTagRemove = (tag: string) => {
    removeTag(tag);
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

  if (loading) {
    return <div className="text-center py-8">Loading note...</div>;
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--background)' }}>
      <header style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div className="px-6 py-4">
          <div className="flex items-start justify-between gap-4 mb-3">
            <input
              type="text"
              placeholder="Untitled Note"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="px-0 py-1 text-2xl font-bold bg-transparent focus:outline-none flex-1"
              style={{ color: 'var(--text-primary)' }}
            />

            {/* Save status indicator - top right */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="flex items-center gap-2 text-sm">
                {saveStatus === 'saving' && (
                  <>
                    <div
                      className="animate-spin"
                      style={{
                        width: '14px',
                        height: '14px',
                        border: '2px solid var(--border)',
                        borderTopColor: 'var(--primary)',
                        borderRadius: '50%',
                      }}
                    />
                    <span style={{ color: 'var(--text-muted)' }}>Saving...</span>
                  </>
                )}
                {saveStatus === 'saved' && (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      style={{ color: '#10b981' }}
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span style={{ color: 'var(--text-muted)' }}>Saved</span>
                  </>
                )}
                {saveStatus === 'unsaved' && (
                  <span style={{ color: 'var(--text-muted)' }}>Unsaved changes</span>
                )}
              </div>
              {/* Keyboard hint */}
              <div
                className="px-2 py-1 text-xs font-mono"
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  color: 'var(--text-muted)',
                }}
              >
                Ctrl+S
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <TagInput
              tags={tags}
              onAddTag={handleTagAdd}
              onRemoveTag={handleTagRemove}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col">

        <div className="flex-1 flex overflow-hidden relative">
          <div
            className="absolute flex flex-col gap-2 z-10"
            style={{
              bottom: '1.5rem',
              right: '1.5rem',
              filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))'
            }}
          >
            {propSlug !== 'new' && (
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
                  <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18" />
                  <path d="M9 7h.01M9 12h.01M9 17h.01M15 7h.01M15 12h.01M15 17h.01" />
                </svg>
              </button>
            )}
          </div>

          <div
            className={showDiff || showPreview ? "w-1/2 flex" : "w-full flex"}
            style={{
              borderRight: showDiff || showPreview ? '1px solid var(--border-light)' : 'none'
            }}
          >
            <Tiptap content={content} onChange={setContent} noteSlug={propSlug} />
          </div>

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
                    .replace(/\n\n+/g, (match) => {
                      const extraNewlines = match.length - 2;
                      return '\n\n' + ('&nbsp;\n\n'.repeat(extraNewlines));
                    })
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

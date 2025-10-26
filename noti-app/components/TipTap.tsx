'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Placeholder } from '@tiptap/extension-placeholder'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { Link } from '@tiptap/extension-link'
import { Image } from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { useEffect, useState } from 'react'
import 'tippy.js/dist/tippy.css'
import './TipTap.css'
import { SlashCommand, getSuggestionItems, renderItems } from './SlashCommand'
import LinkModal from './LinkModal'
import ImageModal from './ImageModal'
import { imagesAPI, isElectron } from '@/lib/electron-api'

// Create lowlight instance with common languages
const lowlight = createLowlight(common)

// Helper: Convert relative .attachments paths to base64 data URLs for display
async function resolveImagesInContent(html: string, noteSlug: string): Promise<string> {
  if (!isElectron) return html

  // Find all image src attributes with relative paths (including ../ paths)
  const imgRegex = /<img([^>]*?)src=["']((?:\.\.\/)*\.attachments\/[^"']+)["']([^>]*?)>/gi
  const matches = [...html.matchAll(imgRegex)]

  let resolvedHtml = html
  for (const match of matches) {
    const fullMatch = match[0]
    const relativePath = match[2]
    const result = await imagesAPI.resolvePath(relativePath, noteSlug)
    if (result.success && result.url) {
      // Replace relative path with data URL and add data-path for saving
      const replaced = fullMatch.replace(
        `src="${relativePath}"`,
        `src="${result.url}" data-path="${relativePath}"`
      )
      resolvedHtml = resolvedHtml.replace(fullMatch, replaced)
    }
  }

  return resolvedHtml
}

// Helper: Convert base64 data URLs back to relative paths for saving
function unresolveImagesInContent(html: string, noteSlug: string): string {
  if (!isElectron) return html

  // Replace data URLs with relative paths using data-path attribute
  const imgRegex = /<img([^>]*?)src=["']data:image\/[^;]+;base64,[^"']+["']([^>]*?)data-path=["']([^"']+)["']([^>]*?)>/gi

  return html.replace(imgRegex, (match, before, middle, path, after) => {
    // Extract alt from the attributes if it exists
    const altMatch = match.match(/alt=["']([^"']*)["']/)
    const alt = altMatch ? altMatch[1] : ''
    return `<img${before}src="${path}"${middle}alt="${alt}"${after}>`
  })
}

interface TiptapProps {
  content: string
  onChange: (content: string) => void
  noteSlug: string
}

// Global callbacks for modals (used by SlashCommand)
let globalLinkCallback: ((url: string, text: string) => void) | null = null
let globalImageCallback: ((url: string, alt: string) => void) | null = null

const Tiptap = ({ content, onChange, noteSlug }: TiptapProps) => {
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // Disable code block from StarterKit since we're using CodeBlockLowlight
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: 'Start writing your note...',
      }),
      // Link support with auto-linking
      Link.configure({
        openOnClick: false, // Disable click-to-open in editor mode
        autolink: true,
        defaultProtocol: 'https',
        HTMLAttributes: {
          class: 'tiptap-link',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      // Image support
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'tiptap-image',
        },
      }),
      // Table support
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'tiptap-table',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      // Task lists
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      // Code blocks with syntax highlighting
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'plaintext',
      }),
      // Slash command
      SlashCommand.configure({
        suggestion: {
          items: getSuggestionItems,
          render: renderItems,
        },
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      // Get HTML content from the editor
      const html = editor.getHTML()
      // Convert file:// URLs back to relative paths before saving
      const unresolvedHtml = unresolveImagesInContent(html)
      onChange(unresolvedHtml)
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none',
      },
    },
  })

  // Update editor content when prop changes (for loading notes)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      // Resolve image paths before setting content
      resolveImagesInContent(content, noteSlug).then((resolvedContent) => {
        if (editor && resolvedContent !== editor.getHTML()) {
          editor.commands.setContent(resolvedContent)
        }
      })
    }
  }, [content, editor, noteSlug])

  // Listen for modal open events from SlashCommand
  useEffect(() => {
    const handleOpenLinkModal = () => setShowLinkModal(true)
    const handleOpenImageModal = () => setShowImageModal(true)

    window.addEventListener('tiptap:openLinkModal', handleOpenLinkModal)
    window.addEventListener('tiptap:openImageModal', handleOpenImageModal)

    return () => {
      window.removeEventListener('tiptap:openLinkModal', handleOpenLinkModal)
      window.removeEventListener('tiptap:openImageModal', handleOpenImageModal)
    }
  }, [])

  if (!editor) {
    return null
  }

  return (
    <div className="w-full h-full flex flex-col" style={{ background: 'var(--surface)' }}>
      {/* Editor Content */}
      <div className="flex-1 overflow-auto tiptap-editor">
        <EditorContent editor={editor} />
      </div>

      {/* Modals */}
      <LinkModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onSubmit={(url, text) => {
          if (editor) {
            editor.chain().focus().insertContent(`<a href="${url}">${text}</a>`).run()
          }
          setShowLinkModal(false)
        }}
      />

      <ImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        noteSlug={noteSlug}
        onSubmit={(url, alt, relativePath) => {
          if (editor) {
            // Insert image with data URL for display
            // Store relative path in data attribute for saving
            if (relativePath) {
              editor.chain().focus().insertContent(
                `<img src="${url}" alt="${alt || ''}" data-path="${relativePath}" />`
              ).run()
            } else {
              editor.chain().focus().setImage({ src: url, alt: alt || undefined }).run()
            }
          }
          setShowImageModal(false)
        }}
      />
    </div>
  )
}

// Export functions to open modals from SlashCommand
export const openLinkModal = () => {
  const event = new CustomEvent('tiptap:openLinkModal')
  window.dispatchEvent(event)
}

export const openImageModal = () => {
  const event = new CustomEvent('tiptap:openImageModal')
  window.dispatchEvent(event)
}

export default Tiptap

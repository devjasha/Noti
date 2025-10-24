'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Placeholder } from '@tiptap/extension-placeholder'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { useEffect } from 'react'
import 'tippy.js/dist/tippy.css'
import './TipTap.css'
import { SlashCommand, getSuggestionItems, renderItems } from './SlashCommand'

interface TiptapProps {
  content: string
  onChange: (content: string) => void
}

const Tiptap = ({ content, onChange }: TiptapProps) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your note...',
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
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
      onChange(html)
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
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  return (
    <div className="w-full h-full flex flex-col" style={{ background: 'var(--surface)' }}>
      {/* Editor Content */}
      <div className="flex-1 overflow-auto tiptap-editor">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

export default Tiptap

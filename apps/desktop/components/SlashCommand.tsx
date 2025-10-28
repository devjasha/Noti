import { Editor, Extension } from '@tiptap/core'
import Suggestion, { SuggestionOptions } from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import tippy, { Instance as TippyInstance } from 'tippy.js'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

interface CommandItem {
  title: string
  description: string
  icon: string
  command: (props: { editor: Editor; range: any }) => void
}

interface CommandListProps {
  items: CommandItem[]
  command: (item: CommandItem) => void
}

const CommandList = forwardRef((props: CommandListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = props.items[index]
    if (item) {
      props.command(item)
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => setSelectedIndex(0), [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }

      if (event.key === 'Enter') {
        enterHandler()
        return true
      }

      return false
    },
  }))

  return (
    <div
      className="slash-command-menu"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-light)',
        borderRadius: '8px',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        padding: '4px',
        maxHeight: '420px',
        overflowY: 'auto',
        minWidth: '280px',
        backdropFilter: 'blur(12px)',
      }}
    >
      {props.items.length ? (
        props.items.map((item, index) => (
          <button
            key={index}
            onClick={() => selectItem(index)}
            className="slash-command-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '10px 12px',
              textAlign: 'left',
              border: 'none',
              borderRadius: '6px',
              background: index === selectedIndex ? 'var(--primary)' : 'transparent',
              color: index === selectedIndex ? 'white' : 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: index === selectedIndex ? 'scale(0.98)' : 'scale(1)',
            }}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: index === selectedIndex
                  ? 'rgba(255, 255, 255, 0.2)'
                  : 'rgba(61, 122, 237, 0.08)',
                fontSize: '16px',
                fontWeight: 600,
                flexShrink: 0,
                transition: 'all 0.15s',
              }}
            >
              {item.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: '14px',
                  marginBottom: '2px',
                  color: index === selectedIndex ? 'white' : 'var(--text-primary)',
                }}
              >
                {item.title}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: index === selectedIndex ? 'rgba(255, 255, 255, 0.8)' : 'var(--text-muted)',
                  lineHeight: '1.3',
                }}
              >
                {item.description}
              </div>
            </div>
          </button>
        ))
      ) : (
        <div
          style={{
            padding: '20px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '13px',
          }}
        >
          No results found
        </div>
      )}
    </div>
  )
})

CommandList.displayName = 'CommandList'

export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: { editor: Editor; range: any; props: any }) => {
          props.command({ editor, range })
        },
      } as Partial<SuggestionOptions>,
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      } as SuggestionOptions),
    ]
  },
})

export const getSuggestionItems = ({ query }: { query: string }): CommandItem[] => {
  const items: CommandItem[] = [
    {
      title: 'Heading 1',
      description: 'Large heading',
      icon: 'H1',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run()
      },
    },
    {
      title: 'Heading 2',
      description: 'Medium heading',
      icon: 'H2',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run()
      },
    },
    {
      title: 'Heading 3',
      description: 'Small heading',
      icon: 'H3',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run()
      },
    },
    {
      title: 'Bullet List',
      description: 'Create a bullet list',
      icon: '•',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run()
      },
    },
    {
      title: 'Numbered List',
      description: 'Create a numbered list',
      icon: '1.',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run()
      },
    },
    {
      title: 'Task List',
      description: 'Create a task list with checkboxes',
      icon: '☐',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run()
      },
    },
    {
      title: 'Table',
      description: 'Insert a table',
      icon: '⊞',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
      },
    },
    {
      title: 'Code Block',
      description: 'Code block with syntax highlighting',
      icon: '</>',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
      },
    },
    {
      title: 'Image',
      description: 'Insert an image from URL',
      icon: '🖼',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).run()
        // Dispatch event to open modal
        const event = new CustomEvent('tiptap:openImageModal')
        window.dispatchEvent(event)
      },
    },
    {
      title: 'Link',
      description: 'Add a link',
      icon: '🔗',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).run()
        // Dispatch event to open modal
        const event = new CustomEvent('tiptap:openLinkModal')
        window.dispatchEvent(event)
      },
    },
    {
      title: 'Blockquote',
      description: 'Create a blockquote',
      icon: '"',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run()
      },
    },
    {
      title: 'Horizontal Rule',
      description: 'Insert a horizontal divider',
      icon: '―',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run()
      },
    },
  ]

  return items.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  )
}

export const renderItems = () => {
  let component: ReactRenderer | null = null
  let popup: TippyInstance[] | null = null

  return {
    onStart: (props: any) => {
      component = new ReactRenderer(CommandList, {
        props,
        editor: props.editor,
      })

      if (!props.clientRect) {
        return
      }

      popup = tippy('body', {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start',
        animation: 'shift-away',
        theme: 'light-border',
        maxWidth: 'none',
      })
    },

    onUpdate(props: any) {
      component?.updateProps(props)

      if (!props.clientRect) {
        return
      }

      popup?.[0]?.setProps({
        getReferenceClientRect: props.clientRect,
      })
    },

    onKeyDown(props: any) {
      if (props.event.key === 'Escape') {
        popup?.[0]?.hide()
        return true
      }

      return (component?.ref as any)?.onKeyDown(props)
    },

    onExit() {
      popup?.[0]?.destroy()
      component?.destroy()
    },
  }
}

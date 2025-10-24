import { create } from 'zustand'

interface EditorState {
  // Note content
  content: string
  title: string
  tags: string[]
  folder: string
  originalContent: string
  slug: string

  // UI states
  loading: boolean
  saving: boolean
  saveStatus: 'saved' | 'saving' | 'unsaved'
  showPreview: boolean
  showDiff: boolean
  diff: string

  // Actions
  setContent: (content: string) => void
  setTitle: (title: string) => void
  setTags: (tags: string[]) => void
  addTag: (tag: string) => void
  removeTag: (tag: string) => void
  setFolder: (folder: string) => void
  setOriginalContent: (content: string) => void
  setSlug: (slug: string) => void
  setLoading: (loading: boolean) => void
  setSaving: (saving: boolean) => void
  setSaveStatus: (status: 'saved' | 'saving' | 'unsaved') => void
  setShowPreview: (show: boolean) => void
  setShowDiff: (show: boolean) => void
  setDiff: (diff: string) => void
  toggleDiff: () => void
  togglePreview: () => void

  // Reset state (for loading new notes)
  resetNote: () => void
  loadNote: (data: { content: string; title: string; tags: string[]; slug: string }) => void
}

export const useEditorStore = create<EditorState>((set, get) => ({
  // Initial state
  content: '',
  title: '',
  tags: [],
  folder: '',
  originalContent: '',
  slug: '',
  loading: true,
  saving: false,
  saveStatus: 'saved',
  showPreview: false,
  showDiff: false,
  diff: '',

  // Actions
  setContent: (content) => {
    set({ content })
    // Mark as unsaved when content changes
    if (content !== get().originalContent) {
      set({ saveStatus: 'unsaved' })
    }
  },

  setTitle: (title) => {
    set({ title })
    // Mark as unsaved when title changes
    if (get().slug !== 'new') {
      set({ saveStatus: 'unsaved' })
    }
  },

  setTags: (tags) => {
    set({ tags })
    // Mark as unsaved when tags change
    if (get().slug !== 'new') {
      set({ saveStatus: 'unsaved' })
    }
  },

  addTag: (tag) => {
    const { tags } = get()
    if (tag && !tags.includes(tag)) {
      set({ tags: [...tags, tag], saveStatus: 'unsaved' })
    }
  },

  removeTag: (tag) => {
    set({
      tags: get().tags.filter(t => t !== tag),
      saveStatus: 'unsaved'
    })
  },

  setFolder: (folder) => set({ folder }),
  setOriginalContent: (content) => set({ originalContent: content }),
  setSlug: (slug) => set({ slug }),
  setLoading: (loading) => set({ loading }),
  setSaving: (saving) => set({ saving }),
  setSaveStatus: (saveStatus) => set({ saveStatus }),
  setShowPreview: (showPreview) => set({ showPreview }),
  setShowDiff: (showDiff) => set({ showDiff }),
  setDiff: (diff) => set({ diff }),

  toggleDiff: () => set({ showDiff: !get().showDiff }),
  togglePreview: () => set({ showPreview: !get().showPreview }),

  resetNote: () => set({
    content: '',
    title: '',
    tags: [],
    folder: '',
    originalContent: '',
    slug: '',
    loading: true,
    saving: false,
    saveStatus: 'saved',
    showPreview: false,
    showDiff: false,
    diff: '',
  }),

  loadNote: (data) => set({
    content: data.content,
    title: data.title,
    tags: data.tags,
    slug: data.slug,
    originalContent: data.content,
    loading: false,
    saveStatus: 'saved',
  }),
}))

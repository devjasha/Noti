# Noti - Project Overview for Claude Code

## Quick Reference

**Project Type**: Desktop Note-Taking Application
**Framework**: Next.js 16.0.0 (React 19) + Electron 38.4.0
**Language**: TypeScript 5.9.3 (strict mode)
**Working Directory**: `/home/bwardsen/work/note-system/noti-app`

---

## Technology Stack

### Frontend
- **React 19** with Next.js App Router
- **TipTap 3.8.0** - Rich text editor with 15+ extensions
- **Zustand 5.0.8** - State management
- **Tailwind CSS** - Styling with PostCSS 4.1.15
- **Radix UI** - Dropdown, popover components
- **react-markdown** + **rehype** - Markdown rendering

### Desktop Runtime
- **Electron 38.4.0** - Desktop wrapper
- **electron-store 11.0.2** - Settings persistence
- **electron-updater 6.6.2** - Auto-updates

### Backend/Storage
- **simple-git 3.28.0** - Git integration
- **gray-matter 4.0.3** - YAML frontmatter parsing
- Plain markdown files on filesystem

---

## Project Structure

```
noti-app/
├── app/                     # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page
│   ├── globals.css         # Global styles + CSS variables
│   ├── dashboard/page.tsx  # Main app UI
│   └── note/[...slug]/page.tsx  # Dynamic note view
│
├── components/             # React components
│   ├── MarkdownEditor.tsx  # Main editor container
│   ├── TipTap.tsx          # Rich text editor
│   ├── PrimarySidebar.tsx  # Root navigation (folders/tags overview)
│   ├── ExtendedSidebar.tsx # Content browser (accordion navigation)
│   ├── NavigationBreadcrumb.tsx # Breadcrumb for Extended Sidebar
│   ├── GitStatus.tsx       # Git widget (commit/push/pull)
│   ├── NoteHistory.tsx     # Git history sidebar
│   ├── HistoryModal.tsx    # View historical versions
│   ├── SettingsModal.tsx   # Settings/theme selector
│   ├── TagInput.tsx        # Tag autocomplete input
│   ├── SlashCommand.tsx    # Slash command system
│   ├── ImageModal.tsx      # Image insertion
│   ├── LinkModal.tsx       # Link insertion
│   ├── FolderContextMenu.tsx
│   ├── NoteContextMenu.tsx
│   └── ...other UI components
│
├── lib/                    # Shared utilities
│   ├── electron-api.ts    # Unified API (IPC + HTTP fallback)
│   ├── notes.ts           # Note CRUD + git ops (~433 lines)
│   ├── folders.ts         # Folder management (~187 lines)
│   ├── templates.ts       # Template operations (~188 lines)
│   ├── themes.ts          # Server-side theme utils
│   └── themes-client.ts   # Client-side theme utils
│
├── store/
│   └── editorStore.ts     # Zustand global state
│
├── electron/              # Electron main process
│   ├── main.ts           # Entry point, window, menus
│   ├── preload.ts        # IPC context bridge
│   └── ipc-handlers/     # IPC request handlers (~660 lines)
│       ├── notes.ts
│       ├── folders.ts
│       ├── templates.ts
│       ├── git.ts
│       ├── themes.ts
│       └── images.ts
│
├── themes/               # 7 built-in themes (JSON)
│   ├── dracula.json
│   ├── inkdrop-dark.json
│   ├── inkdrop-light.json
│   ├── kanagawa.json
│   ├── nord.json
│   └── solarized-osaka.json
│
└── Configuration
    ├── package.json
    ├── next.config.ts
    ├── tsconfig.json
    ├── tsconfig.electron.json
    ├── postcss.config.mjs
    └── electron.d.ts
```

---

## Entry Points & Routing

### Application Launch Flow
1. **Electron Main** (`electron/main.ts`) creates BrowserWindow
2. Loads `out/index.html` (prod) or `localhost:3000` (dev)
3. Initializes git repo in notes directory
4. Registers IPC handlers

### Routes
- `/` - Landing page with features
- `/dashboard` - Main application interface
- `/note/[...slug]` - Dynamic note viewing

### Query Parameters
- `?note=<slug>` - Selected note
- `?template=<slug>` - Template selection
- `?folder=<path>` - Folder context

### Keyboard Shortcuts
- `Ctrl+B` - Toggle file tree
- `Ctrl+Shift+G` - Toggle Git status
- `Ctrl+H` - Toggle note history

---

## Core Components

### Editor System

**MarkdownEditor.tsx** (Main Container)
- Manages note loading/saving/state
- Integrates TipTap + preview mode
- Auto-saves with debounce
- Displays save status
- Git diff viewing

**TipTap.tsx** (Rich Editor)
- Full markdown support (lists, tables, code, etc.)
- Image insertion with base64 encoding
- Link insertion with modal
- Slash commands (`/table`, `/image`, `/link`)
- Syntax highlighting with lowlight
- Task lists, horizontal rules

### Navigation

**PrimarySidebar.tsx** (Root Navigation)
- Shows root-level folders and all tags
- New note/folder creation at root
- Settings button
- Triggers Extended Sidebar on folder/tag click

**ExtendedSidebar.tsx** (Content Browser)
- Accordion-style folder navigation (one level at a time)
- Tag-based note browsing
- Breadcrumb navigation
- Search filter
- New note/folder creation in current context
- Right-click context menus
- Close button to hide sidebar
- Slide-in animation

**NavigationBreadcrumb.tsx**
- Dual-mode breadcrumb (folders/tags)
- Click segments to navigate
- Home button to return to root

**FolderContextMenu.tsx**
- Rename/delete folder
- Create subfolder

**NoteContextMenu.tsx**
- Rename/delete/move note
- Save as template

### Git Integration

**GitStatus.tsx**
- Real-time git status
- Commit/push/pull operations
- Remote list display
- Auto-refresh every 5s

**NoteHistory.tsx**
- Git commit history for note
- View historical versions

**HistoryModal.tsx**
- Display note at specific commit

---

## State Management

### Zustand Store (`store/editorStore.ts`)
```typescript
interface EditorState {
  // Content
  content: string
  title: string
  tags: string[]
  folder: string
  slug: string
  originalContent: string

  // UI
  loading: boolean
  saving: boolean
  saveStatus: 'saved' | 'saving' | 'unsaved'
  showPreview: boolean
  showDiff: boolean
  diff: string

  // Actions
  setContent, setTitle, setTags, addTag, removeTag
  setFolder, resetNote, loadNote, etc.
}
```

### Other State Patterns
- Component state for UI toggles
- URL params for route-level selection
- localStorage for UI preferences
- Electron store for app settings

---

## API & IPC Communication

### Dual-Mode API Pattern (`lib/electron-api.ts`)
```typescript
// Electron: IPC channels
if (window.electron) {
  return await window.electron.notes.get(slug)
}
// Fallback: HTTP (future web version)
return await fetch(`/api/notes/${slug}`).then(r => r.json())
```

### IPC Channels (Channel Format: `<feature>:<action>`)

**Notes** (`electron/ipc-handlers/notes.ts`):
- `notes:get-all` - Fetch all notes
- `notes:get` - Get single note
- `notes:create` - Create note
- `notes:update` - Update note
- `notes:delete` - Delete note
- `notes:move` - Move to folder

**Tags** (`electron/ipc-handlers/notes.ts`):
- `tags:get-all` - Get all unique tags with usage counts

**Folders** (`electron/ipc-handlers/folders.ts`):
- `folders:get-all` - Folder hierarchy
- `folders:create` - Create folder
- `folders:rename` - Rename folder
- `folders:delete` - Delete empty folder

**Git** (`electron/ipc-handlers/git.ts`):
- `git:status` - Current status
- `git:commit` - Commit with message
- `git:sync` - Push/pull
- `git:diff` - View changes
- `git:history` - File history
- `git:file-version` - Get file at commit
- `git:remotes` - List remotes

**Templates** (`electron/ipc-handlers/templates.ts`):
- `templates:get-all` - List templates
- `templates:get` - Get single template
- `templates:create` - Save template
- `templates:delete` - Remove template

**Images** (`electron/ipc-handlers/images.ts`):
- `images:copy-to-attachments` - Copy to note folder
- `images:select-file` - File picker
- `images:resolve-path` - Convert to base64

**Themes** (`electron/ipc-handlers/themes.ts`):
- `themes:get-all` - List themes
- `themes:get` - Get theme
- `themes:create` - Create custom theme
- `themes:delete` - Remove theme

### Preload Bridge (`electron/preload.ts`)
Exposes safe API via `window.electron`:
```typescript
window.electron.notes.get(slug)
window.electron.folders.create(path)
window.electron.git.commit(message)
// etc.
```

---

## Styling System

### Stack
- **Tailwind CSS** via PostCSS plugin
- **CSS Custom Properties** for theming
- **Radix UI** for primitives

### Theme System

**Global Styles** (`app/globals.css`):
```css
:root {
  --primary: #3d7aed
  --accent: #ff63c3
  --background: #f6f9fe
  --text-primary: #031b4e
  /* ... 15+ variables */
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #1a1d24
    --text-primary: #e8eaed
    /* ... dark variants */
  }
}
```

**Built-in Themes** (7 total):
- Inkdrop Light/Dark (default)
- Dracula
- Nord
- Kanagawa
- Solarized Osaka

**Dynamic Loading**:
- `themes.ts` validates & loads JSON themes
- `themes-client.ts` converts to CSS variables
- Applied at runtime via DOM style updates

---

## Build Configuration

### TypeScript Configs

**Main** (`tsconfig.json`):
- Target: ES2017
- Module: esnext
- Strict mode enabled
- JSX: react-jsx

**Electron** (`tsconfig.electron.json`):
- Extends main config
- Module: ES2022
- Target: ES2020
- Output: `electron-dist/`

### Next.js Config (`next.config.ts`)
```typescript
{
  output: 'export',  // Static export for Electron
  images: { unoptimized: true },
  trailingSlash: true
}
```

### Build Scripts
```bash
npm run dev              # Next.js dev server
npm run build            # Static export
npm run electron:dev     # Compile + launch Electron dev
npm run electron:build   # Full production build
npm run electron:build:win/mac/linux  # Platform-specific
npm run lint             # Next.js linter
```

### Output Directories
- `out/` - Next.js static export
- `electron-dist/` - Compiled Electron code
- `dist/` - Final packaged apps

### Electron Builder
```json
{
  "appId": "com.noti.app",
  "productName": "Noti",
  "win": { "target": "nsis" },
  "mac": { "target": "dmg" },
  "linux": { "target": ["AppImage", "deb"] }
}
```

---

## Notable Patterns & Conventions

### Security (Electron)
- `nodeIntegration: false`
- `contextIsolation: true`
- Safe preload bridge with `exposeInMainWorld`

### File Organization
- YAML frontmatter with gray-matter
- Slug-based routing (folder path → route)
- Dot-prefix exclusions (`.templates`, `.git`)

### Git Integration
- Auto-initialization on first run
- Default user config fallback
- History preservation on file moves

### Image Handling
- Base64 for display
- Relative paths for storage (`../note/.attachments/`)
- Automatic path resolution

### Error Handling
- Try-catch in all IPC handlers
- Graceful HTTP API fallback
- Context-prefixed logging (`[dashboard]`, `[electron-api]`)

### Development vs Production
```typescript
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged
// Dev: localhost:3000
// Prod: static export (out/index.html)
```

---

## Key File Paths

**Configuration**:
- `/home/bwardsen/work/note-system/noti-app/package.json`
- `/home/bwardsen/work/note-system/noti-app/next.config.ts`
- `/home/bwardsen/work/note-system/noti-app/tsconfig.json`

**Electron**:
- `/home/bwardsen/work/note-system/noti-app/electron/main.ts`
- `/home/bwardsen/work/note-system/noti-app/electron/preload.ts`
- `/home/bwardsen/work/note-system/noti-app/electron/ipc-handlers/`

**App Routes**:
- `/home/bwardsen/work/note-system/noti-app/app/page.tsx`
- `/home/bwardsen/work/note-system/noti-app/app/dashboard/page.tsx`
- `/home/bwardsen/work/note-system/noti-app/app/layout.tsx`

**Core Components**:
- `/home/bwardsen/work/note-system/noti-app/components/MarkdownEditor.tsx`
- `/home/bwardsen/work/note-system/noti-app/components/TipTap.tsx`
- `/home/bwardsen/work/note-system/noti-app/components/FileTree.tsx`
- `/home/bwardsen/work/note-system/noti-app/components/GitStatus.tsx`

**Business Logic**:
- `/home/bwardsen/work/note-system/noti-app/lib/electron-api.ts`
- `/home/bwardsen/work/note-system/noti-app/lib/notes.ts`
- `/home/bwardsen/work/note-system/noti-app/lib/folders.ts`
- `/home/bwardsen/work/note-system/noti-app/lib/templates.ts`

**State**:
- `/home/bwardsen/work/note-system/noti-app/store/editorStore.ts`

**Themes**:
- `/home/bwardsen/work/note-system/noti-app/themes/`
- `/home/bwardsen/work/note-system/noti-app/lib/themes.ts`

---

## Testing

**Current Status**: No automated testing configured

**Manual Testing**:
- Run `npm run electron:dev`
- Integration testing through app launch

---

## Recent Changes (Git)

### Latest Changes - Dual-Sidebar Navigation System

**New Features**:
- Dual-sidebar layout: Primary + Extended sidebars
- Primary sidebar shows root folders and all tags
- Extended sidebar for accordion-style browsing
- Smooth slide-in animation for Extended sidebar
- Breadcrumb navigation in Extended sidebar
- Both sidebars visible simultaneously for context
- Folder navigation one level at a time (accordion pattern)
- Tag browsing in Extended sidebar

**Files Created**:
- `components/PrimarySidebar.tsx` - Root navigation with folders/tags overview
- `components/ExtendedSidebar.tsx` - Content browser with accordion navigation
- `components/NavigationBreadcrumb.tsx` - Dual-mode breadcrumb component

**Files Modified**:
- `app/dashboard/page.tsx` - Updated to use dual-sidebar layout with state management
- `README.md` - Updated feature list and navigation documentation
- `claude.md` - Updated component documentation

**Architecture Changes**:
- Split FileTree.tsx functionality into PrimarySidebar and ExtendedSidebar
- Moved accordion navigation logic to ExtendedSidebar
- Added slide-in CSS animation
- Dashboard now manages both sidebar states

### Previous Changes - Tag System Enhancement

**New Features**:
- Smart tag autocomplete with fuzzy search
- Tag browser in sidebar
- Tag-based note browsing
- Tag usage counts and statistics
- Improved editor UI layout

**Files Modified**:
- `components/MarkdownEditor.tsx` - Restructured header with save status in top right
- `lib/notes.ts` - Added getAllTags() function
- `lib/electron-api.ts` - Added tagsAPI
- `electron/ipc-handlers/notes.ts` - Added tags:get-all handler
- `electron/preload.ts` - Exposed tags API
- `electron.d.ts` - Added TypeScript definitions for tags

**Files Created**:
- `components/TagInput.tsx` - New autocomplete tag input component

**Previous Commits**:
```
363c7cb - chore: remove unused dependencies and dead code
bc3d683 - Merge PR #10: feature/editor-enhancements
1740ae3 - feat: integrate image/link modals with base64 conversion
c03768e - feat: add slash commands for table, image, link
72be7da - feat: implement image upload with base64 encoding
```

---

## Architecture Summary

**Noti** is a **hybrid desktop application** combining:

1. **Desktop Shell** (Electron) - OS integration, file access, git
2. **Web UI** (Next.js + React) - Modern interface
3. **IPC Bridge** - Secure renderer ↔ main communication
4. **Storage** - Plain markdown with git version control
5. **State** - Zustand (editor) + React hooks (UI) + URL params (routing)

**Architectural Highlights**:
- Static Next.js export (no server in app)
- Zustand over Redux for simplicity
- TipTap for rich markdown editing
- Git at file system level (simple-git)
- CSS variables for dynamic theming
- Dual API pattern (Electron-native + web-compatible)

**Code Quality**:
- TypeScript strict mode
- Comprehensive error handling
- Clean separation of concerns
- ~6,100 lines in core components/lib

---

## Common Tasks Quick Reference

### Add New IPC Handler
1. Create handler in `electron/ipc-handlers/<feature>.ts`
2. Export handler function
3. Register in `electron/main.ts`
4. Add to preload bridge (`electron/preload.ts`)
5. Update TypeScript types (`electron.d.ts`)
6. Use in components via `window.electron.<feature>.<method>()`

### Add New Theme
1. Create JSON in `themes/<name>.json`
2. Follow structure: `{ name, colors: { primary, accent, ... } }`
3. Theme auto-loads on app restart

### Add New Component
1. Create in `components/<Name>.tsx`
2. Follow naming: PascalCase
3. Import in dashboard or relevant parent

### Modify Editor Features
- TipTap extensions: `components/TipTap.tsx`
- Editor state: `store/editorStore.ts`
- Save/load logic: `components/MarkdownEditor.tsx`

### Git Operations
- All git logic: `lib/notes.ts`
- IPC handlers: `electron/ipc-handlers/git.ts`
- UI: `components/GitStatus.tsx`, `components/NoteHistory.tsx`

---

## Environment

- **Platform**: Linux
- **OS**: Linux 6.17.3-arch2-1
- **Node**: 20+
- **Git Repo**: Yes (main branch)
- **Working Dir**: `/home/bwardsen/work/note-system/noti-app`

---

**Last Updated**: 2025-10-26

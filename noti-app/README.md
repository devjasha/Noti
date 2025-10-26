# Noti - Personal Note-Taking Desktop App

A powerful personal note-taking system with Git integration, built with Electron and Next.js.

## Features

✅ **Rich Markdown Editor** - Write notes in GitHub Flavored Markdown with live preview
✅ **Accordion Navigation** - Single sidebar with breadcrumb navigation for folders and tags
✅ **Folder Organization** - Organize notes in hierarchical folders with one-level-at-a-time browsing
✅ **Smart Tag System** - Tag notes with autocomplete, fuzzy search, and tag-based browsing
✅ **Git Version Control** - Full git history, diff viewing, and sync with remote repositories
✅ **Template System** - Create reusable note templates
✅ **Dynamic Theming** - Multiple built-in themes + custom theme support
✅ **Full-Text Search** - Quickly find notes by title, content, or tags
✅ **Auto-Updates** - Automatic updates via GitHub releases
✅ **Cross-Platform** - Works on Windows, macOS, and Linux

## Installation

### Download Pre-Built Binaries

Download the latest release for your platform from [GitHub Releases](https://github.com/devjasha/Noti/releases):

- **Windows**: `Noti-Setup-1.0.0.exe`
- **macOS**: `Noti-1.0.0.dmg`
- **Linux**: `Noti-1.0.0.AppImage` or `noti_1.0.0_amd64.deb`

### Build from Source

1. **Clone the repository**
   ```bash
   git clone https://github.com/devjasha/Noti.git
   cd Noti/noti-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the application**
   ```bash
   # For your current platform
   npm run electron:build

   # For specific platforms
   npm run electron:build:win   # Windows
   npm run electron:build:mac   # macOS
   npm run electron:build:linux # Linux
   ```

4. **Find the built app in the `dist/` directory**

## Development

### Prerequisites

- Node.js 20 or higher
- Git

### Running in Development Mode

```bash
# Install dependencies
npm install

# Start development server
npm run electron:dev
```

This will:
1. Compile TypeScript for Electron (main process and preload script)
2. Start the Next.js development server on `http://localhost:3000`
3. Launch the Electron app pointing to the dev server
4. Enable hot reload for both renderer and main process changes

### Project Structure

```
noti-app/
├── app/                    # Next.js app directory
│   └── dashboard/          # Main dashboard page
├── components/             # React components
│   ├── PrimarySidebar.tsx # Sidebar with accordion navigation
│   ├── NavigationBreadcrumb.tsx # Breadcrumb for current location
│   ├── GitStatus.tsx      # Git status widget with auto-refresh
│   ├── MarkdownEditor.tsx # Editor with preview and diff
│   ├── TagInput.tsx       # Tag autocomplete input component
│   ├── NoteHistory.tsx    # Note version history viewer
│   ├── SettingsModal.tsx  # Settings and theme selector
│   └── ...                # Other UI components
├── electron/               # Electron main process
│   ├── main.ts            # Main process entry point
│   ├── preload.ts         # Preload script (IPC bridge)
│   └── ipc-handlers/      # IPC request handlers
│       ├── notes.ts       # Note CRUD operations
│       ├── folders.ts     # Folder operations
│       ├── templates.ts   # Template operations
│       ├── git.ts         # Git operations
│       └── themes.ts      # Theme loading
├── lib/                    # Shared utilities
│   ├── electron-api.ts    # Frontend API wrapper (IPC client)
│   ├── notes.ts           # Note management logic
│   ├── folders.ts         # Folder management logic
│   ├── templates.ts       # Template management logic
│   └── themes.ts          # Theme loading and validation
├── themes/                 # Theme JSON files
└── electron-dist/          # Compiled Electron code (generated)
```

## First Run

On first launch, Noti will prompt you to select a directory for storing your notes. You can choose any location on your computer.

Your notes will be stored as plain Markdown files with YAML frontmatter:

```markdown
---
title: My Note Title
tags: [work, important]
created: 2024-10-23T12:00:00Z
---

# Note Content

This is the markdown content of the note.
```

This format makes your notes:
- **Portable**: Move them anywhere, access with any text editor
- **Version-controlled**: Full git history
- **Future-proof**: Plain text files will always be readable

## Features Guide

### Notes Management

- **Create Note**: Click "New Note" or use Ctrl+N
- **Edit Note**: Click any note in the file tree
- **Delete Note**: Right-click note → Delete
- **Move Note**: Right-click note → Move to Folder
- **Auto-save**: Notes save automatically as you type

### Navigation System

The app uses an accordion-style navigation system in a single sidebar:

- **Breadcrumb Navigation**: Shows current location (Home > Folder > Subfolder)
  - Click any segment to navigate back
  - Home button returns to root level

- **Folder Mode** (default):
  - Shows folders and notes at current level
  - Click folder to navigate into it
  - See only immediate children (one level at a time)
  - Tags section visible at root level

- **Tag Mode**:
  - Click any tag to view all notes with that tag
  - Shows flat list of tagged notes with folder paths
  - Click folder path or breadcrumb to return to folder view

### Folders

- **Create Folder**: Click the folder+ icon in sidebar
- **Navigate Folders**: Click folder name to navigate into it (accordion-style)
- **Rename Folder**: Right-click folder → Rename
- **Delete Folder**: Right-click folder → Delete (must be empty)
- **Nested Folders**: Full support for hierarchical organization

### Tags

The smart tagging system helps organize and find notes quickly:

- **Add Tags**: Type in the tag input field below the note title
- **Autocomplete**: Start typing to see suggestions from existing tags
- **Fuzzy Search**: Matches partial characters (e.g., "prd" matches "productivity")
- **Keyboard Navigation**: Use ↑/↓ arrows to navigate, Enter to select
- **Quick Add**: Press Enter or comma to add tags
- **Tag Browser**: View all tags in the sidebar (at root level) with usage counts
- **Browse by Tag**: Click any tag → Shows all notes containing that tag
- **Tag Counts**: See how many notes use each tag
- **Quick Tag Navigation**: Click tag badges on notes to view all notes with that tag

**Tag Input Features**:
- Autocomplete dropdown with fuzzy matching
- Highlights matched characters
- Shows tag usage count
- Supports comma-separated batch additions
- Auto-refreshes after adding new tags

### Templates

- **Create from Template**: New Note dropdown → From Template
- **Save as Template**: Right-click note → Save as Template
- **Template Storage**: Templates are stored in `.templates/` directory

### Git Integration

The Git Status widget provides real-time version control:

- **Auto-refresh**: Status updates every 5 seconds
- **View Changes**: See modified, created, and deleted files
- **Commit**: Write a message and commit with one click
- **Push/Pull**: Sync with remote repository
- **Commit & Push**: Option to commit and push in one action
- **View History**: Access note history via Ctrl+H
- **Visual Diff**: Compare versions side-by-side

**Recent Fix**: Git Status now properly shows all file changes (modified, created, deleted) by correctly parsing simple-git status objects.

### Themes

- **Access**: Settings (gear icon) or File menu
- **Built-in Themes**: Inkdrop Light/Dark, Kanagawa, Dracula, Nord, and more
- **Custom Themes**: Create your own (see `themes/README.md`)
- **Hot Reload**: Theme changes apply instantly
- **Theme Picker**: Visual preview of each theme

### Keyboard Shortcuts

- `Ctrl+N` - New note
- `Ctrl+S` - Save note (auto-saves on edit)
- `Ctrl+F` - Search notes
- `Ctrl+B` - Toggle file tree
- `Ctrl+Shift+G` - Toggle git status
- `Ctrl+H` - Toggle note history
- `Ctrl+,` - Settings

## Configuration

### Notes Directory

Change your notes directory location:
1. File → Change Notes Directory
2. Select new directory
3. App will automatically reload

The notes directory path is stored in electron-store and persists across sessions.

### Git Configuration

To sync notes across devices, set up a git remote:

```bash
cd /path/to/your/notes
git remote add origin https://github.com/yourusername/your-notes-repo.git
```

Or with SSH:

```bash
git remote add origin git@github.com:yourusername/your-notes-repo.git
```

Then use the Git Status widget to commit and push changes.

## Architecture

### Multi-Process Architecture

Noti uses Electron's multi-process architecture for security and performance:

- **Main Process** (`electron/main.ts`):
  - Manages application lifecycle
  - Handles file system and git operations
  - Registers IPC handlers
  - Manages windows and menus

- **Renderer Process** (Next.js React app):
  - Renders the UI
  - Handles user interactions
  - Communicates with main process via IPC

- **Preload Script** (`electron/preload.ts`):
  - Secure bridge between main and renderer
  - Exposes `window.electron` API via contextBridge
  - Prevents direct access to Node.js APIs from renderer

### IPC Communication

All operations that require file system or git access use IPC:

```typescript
// Frontend (renderer)
const notes = await notesAPI.getAll();

// Backend (main process)
ipcMain.handle('notes:get-all', async () => {
  const notesDir = await getNotesDirectory(store);
  process.env.NOTES_DIR = notesDir;
  return await getAllNotes();
});
```

### TypeScript Configuration

The project uses separate TypeScript configurations:

- `tsconfig.json`: Base configuration for Next.js
- `tsconfig.electron.json`: ES modules for main process
- `tsconfig.preload.json`: CommonJS for preload script (Electron requirement)

## File Format

Notes are stored as Markdown files with YAML frontmatter:

```markdown
---
title: My Note Title
tags: [work, important]
created: 2024-10-23T12:00:00Z
---

# Note Content

This is the markdown content of the note.
```

Templates follow the same format and are stored in `.templates/` directory.

## Troubleshooting

### App won't start

- Check that Node.js 20+ is installed
- Ensure notes directory is accessible
- Check console for errors (View → Toggle DevTools)
- Try deleting `electron-dist/` and running `npm run electron:compile`

### Git operations failing

- Ensure git is installed on your system (`git --version`)
- Check git credentials for remote operations
- Verify remote repository URL is correct
- For SSH: Ensure SSH keys are configured (`ssh -T git@github.com`)

### Notes not showing

- Verify notes directory path in Settings
- Check that files have `.md` extension
- Ensure files have valid YAML frontmatter
- Try refreshing with Ctrl+R

### Git Status not updating

- The widget auto-refreshes every 5 seconds
- If files still don't appear, check that they're in the notes directory
- Manually refresh by toggling the sidebar (Ctrl+Shift+G twice)

### Preload script not loading

- Check that `electron-dist/electron/preload.js` exists
- Verify preload is compiled as CommonJS (check the file for `require()` not `import`)
- Run `npm run electron:compile` to rebuild

## Building for Distribution

### Development Build

```bash
npm run electron:build
```

### Production Build with Code Signing

For macOS and Windows code signing:

1. **macOS**: Set environment variables:
   ```bash
   export CSC_LINK=/path/to/certificate.p12
   export CSC_KEY_PASSWORD=your_password
   ```

2. **Windows**: Set environment variables:
   ```bash
   export WIN_CSC_LINK=/path/to/certificate.pfx
   export WIN_CSC_KEY_PASSWORD=your_password
   ```

3. Build:
   ```bash
   npm run electron:build
   ```

### Publishing Updates

1. Update version in `package.json`
2. Build for all platforms
3. Create GitHub release with version tag (e.g., `v1.0.1`)
4. Upload build artifacts to the release
5. electron-updater will automatically notify users

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Recent Updates

### Latest - Single Sidebar with Accordion Navigation
- ✅ Simplified to single sidebar based on user feedback
- ✅ Accordion-style navigation (one level at a time)
- ✅ Breadcrumb navigation shows current location
- ✅ Click folders to navigate into them
- ✅ Click tags to view all tagged notes
- ✅ Tag badges on notes are clickable for quick navigation
- ✅ Tags section visible only at root level in folder mode
- ✅ Clean, focused UX without sidebar expansion

### Previous - Tag System Enhancement
- ✅ Implemented smart tag autocomplete with fuzzy search
- ✅ Added tag browser in sidebar
- ✅ Tag-based note browsing
- ✅ Tag usage counts and statistics
- ✅ Improved editor UI layout with save status in top right
- ✅ Keyboard navigation for tag input (↑/↓/Enter/Escape)
- ✅ Auto-refresh tags on note changes

### v1.0.0 - Electron Migration
- ✅ Migrated from Docker-based web app to Electron desktop app
- ✅ Implemented IPC architecture for secure file/git operations
- ✅ Added dynamic notes directory selection
- ✅ Fixed git status parsing to properly show file changes
- ✅ Added auto-refresh to git status widget (5-second interval)
- ✅ Implemented cross-platform builds (Windows, macOS, Linux)
- ✅ Added auto-update support via electron-updater

## License

ISC

## Credits

Built with:
- [Electron](https://www.electronjs.org/) - Desktop application framework
- [Next.js](https://nextjs.org/) - React framework
- [React](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [simple-git](https://github.com/steveukx/git-js) - Git operations
- [electron-store](https://github.com/sindresorhus/electron-store) - Settings persistence
- [electron-updater](https://github.com/electron-userland/electron-builder) - Auto-updates
- [gray-matter](https://github.com/jonschlinkert/gray-matter) - Frontmatter parsing
- [minisearch](https://github.com/lucaong/minisearch) - Full-text search

## Support

For issues and feature requests, please use the [GitHub Issues](https://github.com/devjasha/Noti/issues) page.

---

**Happy note-taking!** 📝

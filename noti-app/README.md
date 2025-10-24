# Noti - Personal Note-Taking Desktop App

A powerful personal note-taking system with Git integration, built with Electron and Next.js.

## Features

✅ **Rich Markdown Editor** - Write notes in GitHub Flavored Markdown with live preview
✅ **Folder Organization** - Organize notes in hierarchical folders
✅ **Git Version Control** - Full git history, diff viewing, and sync with remote repositories
✅ **Template System** - Create reusable note templates
✅ **Dynamic Theming** - Multiple built-in themes + custom theme support
✅ **Full-Text Search** - Quickly find notes by title, content, or tags
✅ **Auto-Updates** - Automatic updates via GitHub releases
✅ **Cross-Platform** - Works on Windows, macOS, and Linux

## Installation

### Download Pre-Built Binaries

Download the latest release for your platform:

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
1. Start the Next.js development server on `http://localhost:3000`
2. Launch the Electron app pointing to the dev server
3. Open DevTools automatically for debugging

### Project Structure

```
noti-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes (not used in Electron)
│   └── dashboard/         # Main dashboard page
├── components/            # React components
├── electron/              # Electron main process
│   ├── main.js           # Main process entry point
│   ├── preload.js        # Preload script (IPC bridge)
│   └── ipc-handlers/     # IPC request handlers
├── lib/                   # Shared utilities
│   ├── electron-api.ts   # Frontend API wrapper
│   ├── notes.ts          # Note management logic
│   ├── folders.ts        # Folder management logic
│   ├── templates.ts      # Template management logic
│   └── themes.ts         # Theme management logic
└── themes/                # Theme JSON files
```

## First Run

On first launch, Noti will prompt you to select a directory for storing your notes. You can choose any location on your computer.

Your notes will be stored as plain Markdown files with YAML frontmatter, making them easily accessible and portable.

## Features Guide

### Notes Management

- **Create Note**: Click "New Note" or use templates
- **Edit Note**: Click any note in the file tree
- **Delete Note**: Right-click note → Delete
- **Move Note**: Right-click note → Move to Folder

### Folders

- **Create Folder**: Click the folder icon next to "New Note"
- **Rename Folder**: Right-click folder → Rename
- **Delete Folder**: Right-click folder → Delete (must be empty)

### Templates

- **Create from Template**: New Note dropdown → From Template
- **Save as Template**: Right-click note → Save as Template

### Git Integration

- **View Changes**: Check the Git Status sidebar (Ctrl+Shift+G)
- **Commit Changes**: Enter message and click "Commit"
- **Push/Pull**: Use sync buttons to push/pull from remote
- **View History**: Open Note History sidebar (Ctrl+H)
- **View Diff**: Click the diff button while editing

### Themes

- Click the theme selector in the sidebar
- Choose from built-in themes or create custom ones
- Custom themes can be created in Settings

### Keyboard Shortcuts

- `Ctrl+B` - Toggle file tree
- `Ctrl+Shift+G` - Toggle git status
- `Ctrl+H` - Toggle note history
- `Ctrl+S` - Save note (implicit auto-save on edit)

## Configuration

### Notes Directory

Change your notes directory location:
1. Menu → File → Change Notes Directory
2. Select new directory
3. Restart the application

### Git Configuration

Noti uses your system's git configuration. To set up remote sync:

```bash
cd /path/to/your/notes
git remote add origin https://github.com/yourusername/your-notes-repo.git
```

Or use SSH:

```bash
git remote add origin git@github.com:yourusername/your-notes-repo.git
```

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

## Troubleshooting

### App won't start

- Check that Node.js 20+ is installed
- Ensure notes directory is accessible
- Check console for errors (View → Toggle DevTools)

### Git operations failing

- Ensure git is installed on your system
- Check git credentials for remote operations
- Verify remote repository URL is correct

### Notes not syncing

- Check internet connection
- Verify git remote is configured
- Ensure you have push/pull permissions

## Building for Distribution

### Code Signing (Optional)

For macOS and Windows, you may want to code sign your app:

1. **macOS**: Set `CSC_LINK` and `CSC_KEY_PASSWORD` environment variables
2. **Windows**: Set `WIN_CSC_LINK` and `WIN_CSC_KEY_PASSWORD`

### Publishing Updates

1. Update version in `package.json`
2. Build for all platforms
3. Create GitHub release with built artifacts
4. Auto-updater will notify users of new version

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Credits

Built with:
- [Electron](https://www.electronjs.org/)
- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [simple-git](https://github.com/steveukx/git-js)
- [electron-store](https://github.com/sindresorhus/electron-store)
- [electron-updater](https://github.com/electron-userland/electron-builder)

## Support

For issues and feature requests, please use the [GitHub Issues](https://github.com/devjasha/Noti/issues) page.

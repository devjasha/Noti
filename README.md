# Noti - Personal Note-Taking Desktop App

A powerful, cross-platform desktop note-taking application that combines the simplicity of Markdown files with the convenience of a modern interface and Git version control. Built with Electron and Next.js.

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Electron](https://img.shields.io/badge/Electron-38-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)

## ✨ Features

- ✅ **Desktop Application**: Native app for Windows, macOS, and Linux
- ✅ **Markdown Editor**: Rich GitHub Flavored Markdown with live preview
- ✅ **Git Integration**: Full version control with commit, push, and pull from the UI
- ✅ **Visual Diff**: Side-by-side diff view to see exactly what changed
- ✅ **Folder Organization**: Hierarchical folder structure for note organization
- ✅ **Template System**: Create and use note templates
- ✅ **Dynamic Theming**: Multiple built-in themes + custom theme support
- ✅ **Full-Text Search**: Quickly find notes by title, content, or tags
- ✅ **Auto-Updates**: Automatic updates via GitHub releases
- ✅ **File-Based**: All notes stored as plain markdown files - own your data!

## 🚀 Quick Start

### Download Pre-Built Binaries

Download the latest release for your platform from the [Releases](https://github.com/devjasha/Noti/releases) page:

- **Windows**: `Noti-Setup-1.0.0.exe`
- **Linux**: `Noti-1.0.0.AppImage` or `noti_1.0.0_amd64.deb`

### Build from Source

1. **Clone the repository**:
   ```bash
   git clone https://github.com/devjasha/Noti.git
   cd Noti/noti-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run in development mode**:
   ```bash
   npm run electron:dev
   ```

4. **Build for production**:
   ```bash
   # For your current platform
   npm run electron:build

   # For specific platforms
   npm run electron:build:win   # Windows
   npm run electron:build:linux # Linux
   ```

## 📁 Project Structure

```
Noti/
├── noti-app/                   # Main application
│   ├── app/                    # Next.js app directory
│   │   └── dashboard/          # Dashboard page
│   ├── components/             # React components
│   │   ├── FileTree.tsx        # File tree navigation
│   │   ├── GitStatus.tsx       # Git status widget
│   │   ├── MarkdownEditor.tsx  # Editor with diff/preview
│   │   └── SettingsModal.tsx   # Settings interface
│   ├── electron/               # Electron main process
│   │   ├── main.ts            # Main process entry
│   │   ├── preload.ts         # Preload script (IPC bridge)
│   │   └── ipc-handlers/      # IPC request handlers
│   ├── lib/                    # Shared utilities
│   │   ├── electron-api.ts    # Frontend API wrapper
│   │   ├── notes.ts           # Note management
│   │   ├── folders.ts         # Folder management
│   │   ├── templates.ts       # Template management
│   │   └── themes.ts          # Theme management
│   └── themes/                 # Theme JSON files
└── README.md                   # This file
```

## 📖 First Run

On first launch, Noti will prompt you to select a directory for storing your notes. You can choose any location on your computer.

Your notes are stored as plain Markdown files with YAML frontmatter:

```markdown
---
title: My Note Title
tags: [work, important]
created: 2024-10-23T12:00:00Z
---

# Note Content

This is the markdown content of the note.
```

This makes your notes:
- **Portable**: Move them anywhere, access with any text editor
- **Version-controlled**: Full git history
- **Future-proof**: Plain text files will always be readable

## 🎯 Usage

### Notes Management

- **Create Note**: Click "New Note" or use templates
- **Edit Note**: Click any note in the file tree
- **Delete Note**: Right-click note → Delete
- **Move Note**: Right-click note → Move to Folder
- **Save as Template**: Right-click note → Save as Template

### Folders

- **Create Folder**: Click the folder+ icon or right-click in file tree
- **Rename Folder**: Right-click folder → Rename
- **Delete Folder**: Right-click folder → Delete (must be empty)

### Git Integration

The Git Status sidebar shows all changes in real-time:

- **View Changes**: Modified, created, and deleted files are categorized
- **Commit**: Enter a message and click "Commit"
- **Push/Pull**: Sync with your remote repository
- **View History**: See complete commit history for any note
- **Visual Diff**: Compare any two versions side-by-side

### Templates

Create reusable note templates:

1. Create a note with your desired structure
2. Right-click → Save as Template
3. Use "New Note from Template" to create notes from it

Templates are stored in `.templates/` folder in your notes directory.

### Themes

- Access via Settings (gear icon) or File menu
- Choose from 6+ built-in themes
- Create custom themes (see `themes/README.md`)
- Themes are hot-reloadable - changes apply instantly

### Keyboard Shortcuts

- `Ctrl+N` - New note
- `Ctrl+S` - Save note (auto-saves on edit)
- `Ctrl+F` - Search notes
- `Ctrl+B` - Toggle file tree
- `Ctrl+Shift+G` - Toggle git status
- `Ctrl+,` - Settings

## ⚙️ Configuration

### Notes Directory

Change your notes directory location:
1. File → Change Notes Directory
2. Select new directory
3. App will reload with new directory

### Git Configuration

To sync notes across devices:

1. **Initialize git in your notes directory** (if not already done):
   ```bash
   cd /path/to/your/notes
   git init
   ```

2. **Add a remote repository**:
   ```bash
   git remote add origin https://github.com/yourusername/your-notes-repo.git
   ```

   Or with SSH:
   ```bash
   git remote add origin git@github.com:yourusername/your-notes-repo.git
   ```

3. **Configure git user** (if not already configured globally):
   ```bash
   git config user.name "Your Name"
   git config user.email "your.email@example.com"
   ```

4. **Use the Git Status widget** in Noti to commit and push changes

## 🛠️ Development

### Prerequisites

- Node.js 20 or higher
- Git
- For building: Platform-specific build tools
  - Windows: Visual Studio Build Tools
  - macOS: Xcode Command Line Tools
  - Linux: Build essentials

### Development Workflow

```bash
# Install dependencies
npm install

# Run in development mode (hot reload enabled)
npm run electron:dev

# Compile TypeScript (main and preload)
npm run electron:compile

# Build for production
npm run electron:build
```

### Architecture

Noti uses a multi-process architecture:

- **Main Process** (Electron): Handles file system, git operations, IPC
- **Renderer Process** (Next.js): React UI running in the Electron window
- **Preload Script**: Secure bridge between main and renderer via `contextBridge`

All file and git operations happen in the main process for security and performance. The renderer communicates via IPC (Inter-Process Communication).

### Code Signing (Production Releases)

For production releases, you should sign your application to ensure users can trust the installer and avoid security warnings.

#### macOS Code Signing

1. **Obtain a Developer ID Certificate** from Apple Developer Program
2. **Export the certificate** as a `.p12` file
3. **Set environment variables** when building:

```bash
export CSC_LINK=/path/to/certificate.p12
export CSC_KEY_PASSWORD=your_certificate_password
npm run electron:build:mac
```

For GitHub Actions, add these as secrets:
- `MAC_CERTS` - Base64-encoded .p12 certificate
- `MAC_CERTS_PASSWORD` - Certificate password

Then update the workflow:

```yaml
- name: Build desktop app
  run: |
    cd apps/desktop
    npm ci
    npm run electron:build
  env:
    CSC_LINK: ${{ secrets.MAC_CERTS }}
    CSC_KEY_PASSWORD: ${{ secrets.MAC_CERTS_PASSWORD }}
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### Windows Code Signing

1. **Obtain a code signing certificate** (from DigiCert, Sectigo, etc.)
2. **Export as `.pfx` file**
3. **Set environment variables**:

```bash
export WIN_CSC_LINK=/path/to/certificate.pfx
export WIN_CSC_KEY_PASSWORD=your_password
npm run electron:build:win
```

For GitHub Actions, add secrets:
- `WIN_CERTS` - Base64-encoded .pfx certificate
- `WIN_CERTS_PASSWORD` - Certificate password

#### Linux

Linux builds don't require code signing, but you can sign packages with GPG if desired.

#### Building Without Code Signing

If you're building for personal use or testing, the build will work without certificates. You'll see a warning during the build process, but the application will still be packaged successfully. Users may see security warnings when installing unsigned applications.

## 🐛 Troubleshooting

### App won't start

- Check that Node.js 20+ is installed
- Ensure notes directory is accessible
- Check console for errors (View → Toggle DevTools)
- Try deleting `electron-dist/` and recompiling

### Git operations failing

- Ensure git is installed on your system
- Check git credentials for remote operations
- Verify remote repository URL is correct
- For SSH: Ensure SSH keys are configured

### Notes not showing

- Verify notes directory path in Settings
- Check that notes have `.md` extension
- Ensure files have valid frontmatter
- Try refreshing (Ctrl+R)

### Git Status not updating

- The widget auto-refreshes every 5 seconds
- If files don't appear, check that they're in the notes directory
- Manually refresh by toggling the sidebar

## 🔒 Privacy & Security

- **All data stays local**: Notes are stored on your computer
- **No telemetry**: We don't collect any usage data
- **Open source**: Audit the code yourself
- **Optional sync**: Git integration is optional, works with your own repos

## 🗺️ Roadmap

- [ ] Mobile companion app
- [ ] End-to-end encryption option
- [ ] Note linking and backlinks
- [ ] Graph view of note connections
- [ ] Plugin system
- [ ] Collaborative editing
- [ ] Advanced markdown features (diagrams, math)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

ISC License - see LICENSE file for details

## 🙏 Credits

Built with:
- [Electron](https://www.electronjs.org/) - Desktop application framework
- [Next.js](https://nextjs.org/) - React framework
- [React](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [simple-git](https://github.com/steveukx/git-js) - Git operations
- [gray-matter](https://github.com/jonschlinkert/gray-matter) - Frontmatter parsing
- [minisearch](https://github.com/lucaong/minisearch) - Full-text search
- [electron-store](https://github.com/sindresorhus/electron-store) - Settings persistence
- [electron-updater](https://github.com/electron-userland/electron-builder) - Auto-updates

## 💬 Support

For issues and feature requests, please use the [GitHub Issues](https://github.com/devjasha/Noti/issues) page.

---

**Happy note-taking!** 📝

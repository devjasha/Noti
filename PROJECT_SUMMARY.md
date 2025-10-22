# Noti Project Summary

## What We Built

A complete, self-hosted note-taking system with dual interfaces (Neovim + Web) and Git-based sync.

## Project Structure

```
/home/bwardsen/work/note-system/
│
├── 📁 notes/                          # Git repository for your markdown notes
│   ├── .git/                          # Git version control
│   ├── daily/                         # Daily notes folder
│   ├── projects/                      # Projects folder
│   ├── reference/                     # Reference materials folder
│   ├── templates/                     # Note templates
│   │   └── default.md                 # Default note template
│   ├── .gitignore                     # Git ignore file
│   └── README.md                      # Notes repository guide
│
├── 📁 noti-app/                       # Next.js web application
│   ├── 📁 app/                        # Next.js 15 app directory
│   │   ├── api/                       # API routes
│   │   │   ├── notes/                 # Notes CRUD API
│   │   │   │   ├── [slug]/route.ts   # Get/Update/Delete specific note
│   │   │   │   └── route.ts           # List/Create notes
│   │   │   └── git/                   # Git operations API
│   │   │       ├── status/route.ts    # Git status
│   │   │       ├── commit/route.ts    # Commit changes
│   │   │       └── sync/route.ts      # Push/Pull
│   │   ├── dashboard/                 # Dashboard page
│   │   │   └── page.tsx
│   │   ├── note/[...slug]/           # Dynamic note editor page
│   │   │   └── page.tsx
│   │   ├── layout.tsx                 # Root layout
│   │   ├── page.tsx                   # Home page
│   │   └── globals.css                # Global styles
│   │
│   ├── 📁 components/                 # React components
│   │   ├── NotesList.tsx             # Notes list with search/filter
│   │   ├── GitStatus.tsx             # Git status widget
│   │   └── MarkdownEditor.tsx        # Note editor with preview
│   │
│   ├── 📁 lib/                        # Backend utilities
│   │   └── notes.ts                   # File operations & Git integration
│   │
│   ├── Dockerfile                     # Docker configuration
│   ├── .dockerignore                 # Docker ignore file
│   ├── .gitignore                    # Git ignore file
│   ├── next.config.ts                # Next.js configuration
│   ├── tailwind.config.ts            # Tailwind CSS config
│   ├── postcss.config.mjs            # PostCSS config
│   ├── tsconfig.json                 # TypeScript config
│   └── package.json                  # Node dependencies
│
├── 📁 docker/                         # Docker-related files (empty, for future use)
│
├── docker-compose.yml                 # Docker Compose configuration
├── .env.example                       # Environment variables template
│
├── 📄 README.md                       # Main documentation
├── 📄 GETTING_STARTED.md              # Quick start guide
├── 📄 NEOVIM_SETUP.md                 # Neovim configuration guide
└── 📄 PROJECT_SUMMARY.md              # This file
```

## Components Overview

### 1. Notes Repository (`notes/`)
- Plain markdown files with YAML frontmatter
- Git version control enabled
- Organized into folders: daily, projects, reference
- Templates for quick note creation
- Can be edited with any text editor (Neovim, VSCode, etc.)

### 2. Web Application (`noti-app/`)

#### Frontend
- **Next.js 15** with App Router
- **React 19** for UI components
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- Responsive design for mobile/desktop

#### Backend API
- **File Operations**: Read, write, delete markdown files
- **Git Integration**: Status, commit, push, pull operations
- **Parsing**: gray-matter for frontmatter, remark for markdown
- **Search**: MiniSearch for full-text search

#### Key Features
- Dashboard with notes list
- Search and filter by tags/folders
- Markdown editor with preview
- Git status and sync controls
- Real-time file system access

### 3. Docker Setup
- Containerized Next.js app
- Volume mount for notes directory
- Standalone build for production
- Easy deployment with docker-compose

## Technology Stack

### Frontend
- Next.js 15 (React Framework)
- React 19 (UI Library)
- TypeScript (Type Safety)
- Tailwind CSS (Styling)

### Backend
- Node.js 20 (Runtime)
- Next.js API Routes (Backend)
- simple-git (Git Operations)
- gray-matter (YAML Frontmatter)
- remark/remark-html (Markdown Processing)
- minisearch (Search Engine)

### Infrastructure
- Docker & Docker Compose
- Git (Version Control)

## Key Features Implemented

### ✅ Core Features
1. **Dual Interface**: Neovim + Web browser editing
2. **Markdown Support**: Full GitHub-flavored Markdown
3. **Frontmatter**: YAML metadata (title, tags, dates)
4. **File System**: Direct file access, no database
5. **Git Integration**: Version control, sync, history

### ✅ Web Interface
1. **Dashboard**: View all notes, search, filter
2. **Note Editor**: Rich editing with preview toggle
3. **Tag System**: Add/remove tags, filter by tags
4. **Folder Organization**: Browse by folder structure
5. **Git Status**: See changes, commit, push, pull
6. **Responsive Design**: Works on mobile and desktop

### ✅ API Endpoints
1. `GET /api/notes` - List all notes
2. `GET /api/notes/[slug]` - Get specific note
3. `POST /api/notes` - Create new note
4. `PUT /api/notes/[slug]` - Update note
5. `DELETE /api/notes/[slug]` - Delete note
6. `GET /api/git/status` - Git status
7. `POST /api/git/commit` - Commit changes
8. `POST /api/git/sync` - Push/pull

### ✅ Neovim Integration
1. Direct file access (just open .md files)
2. Configuration guide with plugin recommendations
3. Keybinding examples
4. Snippet templates
5. Auto-commit setup

## How It Works

### Data Flow

1. **Notes Storage**:
   - All notes are `.md` files in `notes/` directory
   - Each note has YAML frontmatter + Markdown content
   - Git tracks all changes

2. **Web Interface**:
   - Next.js reads/writes files directly via API
   - React components render the UI
   - Client-side state management for editor

3. **Neovim**:
   - Opens files directly from file system
   - Saves changes to `.md` files
   - Works alongside web interface seamlessly

4. **Git Sync**:
   - Commit changes via web or terminal
   - Push to remote repository
   - Pull to sync from other devices

### File Format

```markdown
---
title: Note Title
tags: [tag1, tag2]
created: 2025-10-22T10:00:00Z
---

# Note Title

Content in Markdown format...

## Subheading

- List item
- Another item

[Links](https://example.com) and **formatting** work too!
```

## Usage Scenarios

### Daily Workflow
1. Open Neovim for quick notes
2. Use web interface for structured writing
3. Search notes via dashboard
4. Commit and push at end of day

### Multi-Device Sync
1. Set up Git remote (GitHub/GitLab)
2. Push from device A
3. Pull on device B
4. Edit and push back

### Team Collaboration
1. Share private Git repository
2. Each person gets their own Noti instance
3. Push/pull to sync notes
4. Git handles merge conflicts

## Deployment Options

### 1. Local Development
```bash
cd noti-app
npm install
npm run dev
```

### 2. Docker (Recommended)
```bash
docker-compose up -d
```

### 3. VPS/Cloud Server
- Deploy with Docker Compose
- Use nginx as reverse proxy
- Add SSL with Let's Encrypt
- Access from anywhere

## Next Steps & Ideas

### Potential Enhancements
- [ ] Better markdown editor (CodeMirror, Monaco)
- [ ] Note linking and backlinks
- [ ] Graph view of note connections
- [ ] Tags autocomplete
- [ ] Recent notes widget
- [ ] Note templates UI
- [ ] Export to PDF
- [ ] Mobile app
- [ ] Collaborative editing
- [ ] End-to-end encryption

### Current Limitations
- No real-time sync (manual pull/push)
- No conflict resolution UI
- Basic markdown preview
- No mobile app (web only)
- No user authentication (single user)

## Files to Review

### 📚 Documentation
- `README.md` - Complete project documentation
- `GETTING_STARTED.md` - Quick start guide
- `NEOVIM_SETUP.md` - Neovim configuration
- `PROJECT_SUMMARY.md` - This overview

### 🔧 Configuration
- `docker-compose.yml` - Docker setup
- `noti-app/next.config.ts` - Next.js config
- `noti-app/package.json` - Dependencies
- `.env.example` - Environment variables

### 💻 Code
- `noti-app/lib/notes.ts` - Core backend logic
- `noti-app/app/api/*` - API routes
- `noti-app/components/*` - React components

## Success Metrics

✅ **Complete System** - All core features implemented
✅ **Documentation** - Comprehensive guides created
✅ **Docker Ready** - Easy deployment configured
✅ **Neovim Integration** - Setup guide provided
✅ **Git Sync** - Version control and sync enabled

## How to Use This Project

### First Time Setup
1. Read `GETTING_STARTED.md`
2. Run `docker-compose up`
3. Open `http://localhost:3000`
4. Configure Neovim (optional)

### Daily Use
1. Edit notes in Neovim or browser
2. Commit changes when done
3. Push to remote for backup/sync

### Deployment
1. Copy to VPS/server
2. Configure environment variables
3. Run with Docker Compose
4. Set up reverse proxy + SSL

## Support & Maintenance

All code is self-contained and documented. Key areas:
- **Backend Logic**: `lib/notes.ts`
- **API Routes**: `app/api/`
- **Components**: `components/`
- **Docker**: `Dockerfile` & `docker-compose.yml`

## Conclusion

You now have a fully functional, self-hosted note-taking system that combines the best of both worlds:
- **Neovim** for fast, keyboard-driven editing
- **Web interface** for rich features and accessibility
- **Git** for version control and sync
- **Docker** for easy deployment

All your notes are plain markdown files that you fully own and control. No vendor lock-in, no proprietary formats, no subscriptions!

**Happy note-taking!** 📝

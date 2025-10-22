# Noti - Personal Note-Taking System

A powerful, self-hosted note-taking system that combines the simplicity of Markdown files with the convenience of a modern web interface. Take notes in Neovim or your browser, sync via Git, and access them from anywhere.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)

## ✨ Features

- ✅ **Dual Interface**: Edit notes in Neovim or a rich web interface
- ✅ **Markdown-First**: All notes stored as plain markdown files with YAML frontmatter
- ✅ **Git Integration**: Full version control with commit, push, and pull from the UI
- ✅ **Side-by-Side Diff**: Visual diff view to see exactly what changed
- ✅ **Live Preview**: Split-screen preview while editing
- ✅ **Organization**: Tag-based and folder-based organization
- ✅ **Docker-Ready**: Easy deployment with Docker Compose
- ✅ **Self-Hosted**: Own your data, run on your own infrastructure
- ✅ **Mobile-Friendly**: Responsive web interface works on all devices

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose (recommended)
- Git
- Node.js 20+ (for local development)
- SSH keys configured for GitHub (if using remote sync)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd note-system
   ```

2. **Create your notes directory** (outside the project):
   ```bash
   mkdir ~/my-notes
   cd ~/my-notes
   git init
   git remote add origin git@github.com:yourusername/your-notes-repo.git
   ```

3. **Choose your deployment method**:

#### Option A: Docker (Recommended)

Edit `docker-compose.yml` and update the notes path:
```yaml
volumes:
  - /home/yourusername/my-notes:/app/notes  # Update this path
  - ~/.ssh:/tmp/host-ssh:ro,z
```

Start the container:
```bash
docker-compose up -d
```

#### Option B: Local Development

Create `.env.local` in `noti-app/`:
```bash
NOTES_DIR=/home/yourusername/my-notes
```

Install and run:
```bash
cd noti-app
npm install
npm run dev
```

4. **Access the app**:
   Open your browser to `http://localhost:3000`

## 🔐 SSH Authentication Setup (Required for Git Push/Pull)

For Git operations to work, you need SSH keys configured.

### Generate SSH Key (if you don't have one)

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

### Add to GitHub

1. Copy your public key:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

2. Go to GitHub Settings → SSH and GPG keys → New SSH key
3. Paste your public key and save

### Test Connection

```bash
ssh -T git@github.com
```

You should see: "Hi username! You've successfully authenticated..."

## 📁 Project Structure

```
note-system/                    # Application code (THIS REPO)
├── noti-app/                   # Next.js web application
│   ├── app/                    # Next.js 15 App Router
│   │   ├── api/                # REST API endpoints
│   │   │   ├── notes/          # Notes CRUD
│   │   │   └── git/            # Git operations
│   │   ├── dashboard/          # Dashboard page
│   │   └── note/               # Note editor
│   ├── components/             # React components
│   │   ├── GitStatus.tsx       # Git widget
│   │   ├── MarkdownEditor.tsx  # Editor with diff/preview
│   │   └── NotesList.tsx       # Notes list
│   ├── lib/notes.ts            # Core backend logic
│   └── .env.local              # Local configuration (not tracked)
├── docker-compose.yml          # Docker orchestration
├── .gitignore                  # Ignore sensitive files
└── README.md                   # This file

my-notes/                       # Your notes (SEPARATE REPO)
├── daily/                      # Daily journals
├── projects/                   # Project docs
├── reference/                  # Reference materials
├── templates/                  # Note templates
└── .git/                       # Git version control
```

**Important**: Keep your notes in a separate Git repository from the application code!

## 📖 Usage

### Web Interface

#### Dashboard (`http://localhost:3000/dashboard`)

1. **View Notes**: Browse all your notes with metadata
2. **Git Status Widget**:
   - See count of modified/created/deleted files
   - Click to expand and see file list
   - Click "Commit" to stage and commit with a message
   - Click "Push/Pull" to sync with remote

#### Note Editor

1. **Create New Note**: Click "+ New Note"
   - Enter title and content
   - Add tags for organization
   - Click "Save"

2. **Edit Existing Note**: Click any note from dashboard
   - **Editor** (left): Edit your note in Markdown
   - **Preview** (right): Click "Preview" for side-by-side rendered view
   - **Diff** (right): Click "Diff" to see changes (unsaved or uncommitted)
   - Both views are live - edit while previewing/diffing!

3. **Visual Diff**:
   - Red lines = deleted content
   - Green lines = added content
   - Blue lines = location markers
   - Works for both saved and unsaved changes

### Neovim

1. **Open notes directory**:
   ```bash
   cd notes
   nvim .
   ```

2. **Create a new note**:
   ```vim
   :e projects/my-project.md
   ```

3. **Use frontmatter**:
   ```markdown
   ---
   title: My Project
   tags: [project, coding]
   created: 2025-10-22
   ---

   # My Project

   Your content here...
   ```

See [NEOVIM_SETUP.md](./NEOVIM_SETUP.md) for advanced configuration.

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Notes directory (relative to noti-app or absolute path)
NOTES_DIR=../notes

# Optional: Git configuration
GIT_USER_NAME=Your Name
GIT_USER_EMAIL=your.email@example.com
```

### Docker Ports

Default port is `3000`. To change it, edit `docker-compose.yml`:

```yaml
ports:
  - "8080:3000"  # Change 8080 to your preferred port
```

## Git Sync Setup

To sync notes across devices, set up a Git remote:

1. **Create a private repository** on GitHub/GitLab/your Git server

2. **Add remote to notes directory**:
   ```bash
   cd notes
   git remote add origin https://github.com/yourusername/your-notes.git
   git push -u origin master
   ```

3. **Pull before editing, push after changes**:
   - In web interface: Use the Git Status widget
   - In terminal:
     ```bash
     cd notes
     git pull
     # ... make changes ...
     git add .
     git commit -m "Update notes"
     git push
     ```

## Development

### Local Development (without Docker)

1. **Install dependencies**:
   ```bash
   cd noti-app
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Open browser**:
   `http://localhost:3000`

### Building for Production

```bash
cd noti-app
npm run build
npm start
```

## API Endpoints

The web app exposes a REST API:

### Notes
- `GET /api/notes` - List all notes
- `GET /api/notes/[slug]` - Get specific note
- `POST /api/notes` - Create new note
- `PUT /api/notes/[slug]` - Update note
- `DELETE /api/notes/[slug]` - Delete note

### Git Operations
- `GET /api/git/status` - Get git status
- `POST /api/git/commit` - Commit changes
- `POST /api/git/sync` - Push/pull changes

## Deployment

### Deploy with Docker

1. **Production deployment**:
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

2. **Behind a reverse proxy** (nginx example):
   ```nginx
   server {
       listen 80;
       server_name notes.yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Add SSL with Certbot**:
   ```bash
   sudo certbot --nginx -d notes.yourdomain.com
   ```

### Deploy to VPS

1. Copy the entire project to your server
2. Run `docker-compose up -d`
3. Configure your firewall to allow port 3000 (or your chosen port)
4. Set up a reverse proxy (nginx/Caddy) with SSL

## Advanced Features

### Note Linking

Use wiki-style links to connect notes:
```markdown
See [[projects/my-other-project]] for more details.
```

### Tags and Organization

Add tags in frontmatter for better organization:
```yaml
---
title: Meeting Notes
tags: [meetings, work, project-x]
created: 2025-10-22
---
```

Filter by tags in the web interface or search in Neovim.

### Templates

Create note templates in `notes/templates/`:
```markdown
---
title: {{title}}
tags: []
created: {{date}}
---

# {{title}}

## Notes

## Action Items

- [ ]
```

## 🐛 Troubleshooting

### Docker: SSH Keys Not Working

If you see "Host key verification failed" when pushing:

1. Ensure your `docker-compose.yml` has `:z` flag on SSH mount:
   ```yaml
   - ~/.ssh:/tmp/host-ssh:ro,z
   ```

2. Rebuild the container:
   ```bash
   docker-compose down
   docker-compose up --build
   ```

3. Verify SSH keys exist:
   ```bash
   ls -la ~/.ssh/id_*
   ```

### Notes Not Showing in Web Interface

- Check that `NOTES_DIR` environment variable points to the correct absolute path
- For Docker: Verify the volume mount in `docker-compose.yml`
- For local dev: Check `noti-app/.env.local`
- Ensure notes directory exists and contains `.md` files

### Git: Permission Denied

Make sure your SSH key is added to ssh-agent:
```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
ssh -T git@github.com  # Test connection
```

### Port Already in Use

```bash
# Find what's using port 3000
sudo lsof -i :3000

# Stop the container
docker-compose down

# Change port in docker-compose.yml
ports:
  - "3001:3000"  # Use 3001 instead
```

### "No Changes to Display" in Diff View

This is normal if:
- You haven't made any edits yet
- The file is untracked and you're viewing git diff (use the editor diff feature instead)
- All changes have been committed

## Backup

Your notes are just files! Regular backups are recommended:

1. **Git-based backup**: Push to a private repository regularly
2. **File-based backup**: Copy the entire `notes/` directory
3. **Automated backup**: Set up a cron job:
   ```bash
   0 */6 * * * cd /home/bwardsen/work/note-system/notes && git push
   ```

## Roadmap

- [ ] Better markdown editor with syntax highlighting
- [ ] Note linking and backlinks
- [ ] Graph view of note connections
- [ ] Mobile app
- [ ] End-to-end encryption
- [ ] Collaborative editing
- [ ] Plugin system

## Contributing

This is a personal project, but feel free to fork and customize for your needs!

## License

MIT License - do whatever you want with it!

## Credits

Built with:
- [Next.js 15](https://nextjs.org/)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [simple-git](https://github.com/steveukx/git-js)
- [gray-matter](https://github.com/jonschlinkert/gray-matter)
- [minisearch](https://github.com/lucaong/minisearch)

## Support

For issues and questions, see the troubleshooting section above or check the codebase.

---

**Happy note-taking!** 📝

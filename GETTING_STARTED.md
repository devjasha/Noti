# Getting Started with Noti

This guide will walk you through setting up and using Noti for the first time.

## Step 1: Verify Installation

Check that all components are in place:

```bash
cd /home/bwardsen/work/note-system
ls -la
```

You should see:
- `notes/` - Your notes repository
- `noti-app/` - The web application
- `docker-compose.yml` - Docker configuration
- `README.md` - Documentation

## Step 2: Start the Application

### Option A: Using Docker (Recommended)

1. Build and start the container:
   ```bash
   docker-compose up --build
   ```

2. Wait for the build to complete (first time takes a few minutes)

3. Open your browser to `http://localhost:3000`

### Option B: Local Development

1. Install dependencies:
   ```bash
   cd noti-app
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:3000`

## Step 3: Create Your First Note

### Via Web Interface

1. Click "Open Dashboard"
2. Click "+ New Note"
3. Enter a title: "My First Note"
4. Add some content in Markdown
5. Add tags if desired
6. Click "Save"

### Via Neovim

1. Open the notes directory:
   ```bash
   cd notes
   nvim daily/$(date +%Y-%m-%d).md
   ```

2. Add frontmatter and content:
   ```markdown
   ---
   title: My First Daily Note
   tags: [daily, journal]
   created: 2025-10-22
   ---

   # My First Daily Note

   Today I started using Noti for my note-taking.

   ## What I learned
   - Markdown is easy to use
   - My notes are just files
   - I can edit in Neovim or the browser
   ```

3. Save with `:w`

4. Refresh the web interface to see your note!

## Step 4: Understanding the Layout

### Notes Directory Structure

```
notes/
├── daily/          # For daily journals and logs
├── projects/       # For project documentation
├── reference/      # For reference materials and wikis
└── templates/      # For note templates
```

Feel free to create additional folders based on your needs!

### Web Interface

- **Home Page**: Introduction and features
- **Dashboard**: View all notes, search, and filter
- **Note Editor**: Edit individual notes with preview
- **Git Status**: See changes and sync

## Step 5: Set Up Git Sync (Optional)

To access notes from multiple devices:

1. Create a private repository on GitHub/GitLab

2. Add remote:
   ```bash
   cd notes
   git remote add origin https://github.com/yourusername/notes.git
   git push -u origin master
   ```

3. On other devices:
   - Clone your repository
   - Set up Noti to point to that directory
   - Pull before editing, push after

## Step 6: Configure Neovim (Optional)

See [NEOVIM_SETUP.md](./NEOVIM_SETUP.md) for detailed Neovim configuration.

Quick setup:
1. Install telescope.nvim for fuzzy finding
2. Install vim-markdown for better syntax
3. Add keybindings for quick note access

## Daily Workflow

### Morning Routine

1. **Pull latest changes**:
   - Web: Click "Pull" in Git Status
   - Terminal: `cd notes && git pull`

2. **Create today's note**:
   - Web: Navigate to `/note/daily/today`
   - Neovim: `nvim daily/$(date +%Y-%m-%d).md`

3. **Review yesterday**: Look back at what you did

### During the Day

1. **Quick notes**: Use Neovim for fast note-taking
2. **Structured writing**: Use web interface for longer notes
3. **Search**: Use dashboard search to find information

### Evening Routine

1. **Review notes**: Check what you created/modified
2. **Commit changes**:
   - Web: Git Status → Commit → "Daily update"
   - Terminal: `git add . && git commit -m "Daily update"`
3. **Push to remote**: Sync with cloud

## Tips for Success

### 1. Use Consistent Frontmatter

Always include:
```yaml
---
title: Descriptive Title
tags: [relevant, tags]
created: 2025-10-22
---
```

### 2. Organize with Folders

- `daily/` - Date-based notes (YYYY-MM-DD.md)
- `projects/[project-name]/` - Project-specific notes
- `reference/[topic]/` - Long-term reference materials

### 3. Tag Effectively

Good tags:
- `meeting`, `idea`, `todo`
- `work`, `personal`, `learning`
- Project names: `project-x`, `client-name`

### 4. Link Notes

Use wiki links to connect notes:
```markdown
See [[reference/markdown-guide]] for syntax help
Related: [[projects/website-redesign]]
```

### 5. Commit Often

- Commit after significant changes
- Use descriptive commit messages
- Push at end of day

## Common Tasks

### Create a Project Note

```bash
cd notes
mkdir -p projects/my-project
nvim projects/my-project/README.md
```

### Search All Notes

**Web**: Use search bar on dashboard

**Neovim**: Use telescope.nvim:
```vim
:Telescope live_grep cwd=~/work/note-system/notes
```

### Find Notes by Tag

**Web**: Search for tag name in search bar

**Command line**:
```bash
cd notes
grep -r "tags:.*work" .
```

### Export Notes

All notes are markdown files! You can:
- Copy entire `notes/` directory
- Export to PDF with pandoc
- Import into other markdown tools

## Troubleshooting

### Can't see new notes in web interface

1. Check file has `.md` extension
2. Refresh the browser
3. Check NOTES_DIR environment variable

### Changes not syncing between Neovim and web

Both use the same files - try refreshing the browser or checking file paths.

### Git conflicts

```bash
cd notes
git status
# Resolve conflicts manually
git add .
git commit -m "Resolved conflicts"
```

## Next Steps

1. **Customize**: Modify templates to fit your workflow
2. **Integrate**: Add calendar events, todos, etc.
3. **Automate**: Set up cron jobs for auto-sync
4. **Extend**: Add plugins to Neovim for better experience

## Resources

- [README.md](./README.md) - Full documentation
- [NEOVIM_SETUP.md](./NEOVIM_SETUP.md) - Neovim configuration
- [Markdown Guide](https://www.markdownguide.org/) - Learn Markdown

---

Enjoy your new note-taking system! 🚀

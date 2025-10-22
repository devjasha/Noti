# Neovim Setup Guide for Noti

This guide will help you configure Neovim for optimal note-taking with the Noti system.

## Quick Setup

The notes are stored as simple markdown files in the `notes/` directory. You can edit them directly with any text editor, including Neovim.

### Basic Usage

1. Open notes directory in Neovim:
   ```bash
   cd /home/bwardsen/work/note-system/notes
   nvim .
   ```

2. Navigate using your file explorer (e.g., netrw, NvimTree, or oil.nvim)

3. Create new notes:
   ```vim
   :e daily/2025-10-22.md
   ```

## Recommended Plugins

### 1. Markdown Support

**vim-markdown** or **markdown.nvim** - Better syntax highlighting
```lua
-- Using lazy.nvim
{
  'preservim/vim-markdown',
  ft = 'markdown',
  config = function()
    vim.g.vim_markdown_folding_disabled = 1
    vim.g.vim_markdown_frontmatter = 1
  end
}
```

### 2. File Navigation

**telescope.nvim** - Fuzzy finder for notes
```lua
{
  'nvim-telescope/telescope.nvim',
  dependencies = { 'nvim-lua/plenary.nvim' },
  config = function()
    require('telescope').setup{}
  end
}
```

Usage:
```vim
:Telescope find_files cwd=~/work/note-system/notes
:Telescope live_grep cwd=~/work/note-system/notes
```

### 3. Preview

**markdown-preview.nvim** - Live preview in browser
```lua
{
  'iamcco/markdown-preview.nvim',
  build = 'cd app && npm install',
  ft = 'markdown',
}
```

### 4. Note Management

**telekasten.nvim** or **neorg** - Advanced note management
```lua
{
  'renerocksai/telekasten.nvim',
  dependencies = {'nvim-telescope/telescope.nvim'},
  config = function()
    require('telekasten').setup({
      home = vim.fn.expand("~/work/note-system/notes"),
    })
  end
}
```

## Keymappings

Add these to your Neovim config for quick access:

```lua
-- Set notes directory
local notes_dir = "~/work/note-system/notes"

-- Quick commands
vim.keymap.set('n', '<leader>nn', function()
  vim.cmd('cd ' .. notes_dir)
  vim.cmd('Telescope find_files')
end, { desc = 'Find notes' })

vim.keymap.set('n', '<leader>ns', function()
  vim.cmd('cd ' .. notes_dir)
  vim.cmd('Telescope live_grep')
end, { desc = 'Search notes' })

vim.keymap.set('n', '<leader>nt', function()
  local date = os.date('%Y-%m-%d')
  vim.cmd('e ' .. notes_dir .. '/daily/' .. date .. '.md')
end, { desc = 'Today\'s note' })

vim.keymap.set('n', '<leader>ng', function()
  vim.cmd('cd ' .. notes_dir)
  vim.cmd('!git add . && git commit')
end, { desc = 'Git commit notes' })
```

## Note Templates

### Daily Note Template

Create a snippet for daily notes:

```lua
-- Using LuaSnip
local ls = require("luasnip")
local s = ls.snippet
local t = ls.text_node
local i = ls.insert_node
local f = ls.function_node

ls.add_snippets("markdown", {
  s("daily", {
    t({"---", ""}),
    t("title: "),
    f(function() return os.date("%Y-%m-%d") end),
    t({"", "tags: [daily]", ""}),
    t("created: "),
    f(function() return os.date("%Y-%m-%dT%H:%M:%S") end),
    t({"", "---", "", "# "}),
    f(function() return os.date("%Y-%m-%d") end),
    t({"", "", ""}),
    i(0)
  })
})
```

### Project Note Template

```lua
ls.add_snippets("markdown", {
  s("project", {
    t({"---", ""}),
    t("title: "),
    i(1, "Project Title"),
    t({"", "tags: [project]", ""}),
    t("created: "),
    f(function() return os.date("%Y-%m-%dT%H:%M:%S") end),
    t({"", "---", "", "# "}),
    i(2, "Project Title"),
    t({"", "", "## Overview", "", ""}),
    i(3, "Description"),
    t({"", "", "## Tasks", "", "- [ ] "}),
    i(0)
  })
})
```

## Auto-save and Git Integration

Add auto-save on buffer write:

```lua
-- Auto-commit on save (optional, use with caution)
local notes_group = vim.api.nvim_create_augroup("NotesAutoCommit", { clear = true })

vim.api.nvim_create_autocmd("BufWritePost", {
  group = notes_group,
  pattern = "*/notes/*.md",
  callback = function()
    local file = vim.fn.expand('%:t')
    vim.fn.system(string.format(
      'cd %s && git add . && git commit -m "Update: %s"',
      notes_dir,
      file
    ))
  end,
})
```

## Full Example Config

Here's a complete minimal config:

```lua
-- ~/.config/nvim/lua/notes.lua

local M = {}

M.notes_dir = vim.fn.expand("~/work/note-system/notes")

function M.setup()
  -- Keymappings
  vim.keymap.set('n', '<leader>nn', M.find_notes, { desc = 'Find notes' })
  vim.keymap.set('n', '<leader>ns', M.search_notes, { desc = 'Search notes' })
  vim.keymap.set('n', '<leader>nt', M.daily_note, { desc = 'Today\'s note' })
  vim.keymap.set('n', '<leader>nc', M.commit_notes, { desc = 'Commit notes' })
end

function M.find_notes()
  require('telescope.builtin').find_files({
    cwd = M.notes_dir,
    prompt_title = 'Find Notes',
  })
end

function M.search_notes()
  require('telescope.builtin').live_grep({
    cwd = M.notes_dir,
    prompt_title = 'Search Notes',
  })
end

function M.daily_note()
  local date = os.date('%Y-%m-%d')
  local filepath = M.notes_dir .. '/daily/' .. date .. '.md'
  vim.cmd('e ' .. filepath)
end

function M.commit_notes()
  vim.ui.input({ prompt = 'Commit message: ' }, function(input)
    if input then
      vim.fn.system(string.format(
        'cd %s && git add . && git commit -m "%s"',
        M.notes_dir,
        input
      ))
      print('Notes committed!')
    end
  end)
end

return M
```

Then in your main config:
```lua
require('notes').setup()
```

## Tips

1. **Use tags**: Add tags in frontmatter for easy filtering
2. **Wiki links**: Use `[[note-name]]` syntax to link between notes
3. **Regular commits**: Commit frequently to maintain history
4. **Sync regularly**: Pull before editing, push after committing
5. **File structure**: Keep a consistent folder structure (daily/, projects/, reference/)

## Workflow Example

1. Start day: `<leader>nt` - Open today's note
2. Find note: `<leader>nn` - Fuzzy find existing notes
3. Search content: `<leader>ns` - Search across all notes
4. Save and commit: `:w` then `<leader>nc`
5. Push changes: Open web interface and sync, or use Git commands

The web interface and Neovim work seamlessly together - all changes are reflected immediately since they both access the same markdown files!

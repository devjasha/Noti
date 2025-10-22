# Security Guidelines

## What Gets Committed to Git

### ✅ Safe to Commit
- Source code (`.ts`, `.tsx`, `.js`)
- Configuration templates (`.env.example`)
- Documentation (`.md` files)
- Docker configuration (`Dockerfile`, `docker-compose.yml`)
- Package dependencies (`package.json`)

### ❌ Never Commit
- Environment files (`.env`, `.env.local`)
- SSH keys (`id_rsa`, `id_ed25519`, etc.)
- Git credentials (`.git-credentials`)
- Node modules (`node_modules/`)
- Build outputs (`.next/`, `dist/`)
- Your notes directory (`notes/`, `my-notes/`)
- Log files (`*.log`)

## Protected by .gitignore

The following patterns are automatically ignored:
- `.env*` - All environment files
- `node_modules/` - Dependencies
- `.next/` and `out/` - Build outputs
- `notes/` and `my-notes/` - Your personal notes
- `.git-credentials` - Git authentication
- IDE files (`.vscode/`, `.idea/`)
- OS files (`.DS_Store`, `Thumbs.db`)

## SSH Key Security

### Docker Deployment
SSH keys are mounted read-only and with proper SELinux context:
```yaml
- ~/.ssh:/tmp/host-ssh:ro,z
```

The container:
1. Copies keys to `/tmp/home/.ssh` (temporary location)
2. Sets correct permissions (600 for private keys)
3. Keys are never written to disk in the container
4. Keys are never included in the Docker image

### Local Development
Uses your system's SSH agent and keys directly.

## Environment Variables

Sensitive configuration should be in `.env.local` (never committed):
- `NOTES_DIR` - Path to your notes (not sensitive, but user-specific)
- `GIT_USERNAME` - Optional, for HTTPS git
- `GIT_TOKEN` - Optional, for HTTPS git (sensitive!)

## Best Practices

1. **Separate Repositories**: Keep application code and notes in separate repos
2. **Use SSH Keys**: Prefer SSH over HTTPS tokens for Git authentication
3. **Review Before Commit**: Run `git status` and review files before committing
4. **Keep .gitignore Updated**: Add new sensitive patterns as needed
5. **No Secrets in Code**: Use environment variables, never hardcode secrets

## What to Do If You Accidentally Commit Secrets

1. **Stop immediately** - Don't push if you haven't already
2. **Remove from history**:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch path/to/secret" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. **Rotate credentials** - Treat them as compromised
4. **Force push** (if already pushed):
   ```bash
   git push origin --force --all
   ```

## Questions?

If you're unsure whether something should be committed, ask yourself:
- Could this be used to access my accounts? ❌ Don't commit
- Is this user-specific configuration? ❌ Don't commit
- Is this shareable code? ✅ Safe to commit

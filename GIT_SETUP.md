# Git Authentication Setup for Noti

You have two options for Git authentication in Docker:

## Option 1: HTTPS with Personal Access Token (Recommended for Docker)

This is the simplest and most reliable method for Docker environments.

### Step 1: Create a Personal Access Token

1. Go to GitHub: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Name: `Noti Docker Access`
4. Expiration: Choose your preference
5. Scopes: Check **`repo`** (full repository access)
6. Click **"Generate token"**
7. **Copy the token immediately!**

### Step 2: Update Your Git Remote to HTTPS

```bash
cd /home/bwardsen/work/note-system/notes
git remote set-url origin https://github.com/devjasha/Notes.git
```

### Step 3: Configure Docker with Credentials

Edit `docker-compose.yml` and uncomment/set these lines:

```yaml
environment:
  - GIT_USERNAME=devjasha
  - GIT_TOKEN=ghp_your_token_here
```

Or create a `.env` file in the project root:

```bash
# /home/bwardsen/work/note-system/.env
GIT_USERNAME=devjasha
GIT_TOKEN=ghp_your_token_here
```

Then update docker-compose.yml to use it:

```yaml
environment:
  - GIT_USERNAME=${GIT_USERNAME}
  - GIT_TOKEN=${GIT_TOKEN}
```

### Step 4: Restart Docker

```bash
docker-compose down
docker-compose up -d
```

Now push/pull will work automatically! ✅

---

## Option 2: SSH Keys (For Local Development)

If you're running locally (not in Docker), SSH works great:

### Step 1: Generate SSH Key (if you don't have one)

```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
# Press Enter for default location
# Press Enter for no passphrase (or set one)
```

### Step 2: Add SSH Key to GitHub

```bash
cat ~/.ssh/id_ed25519.pub
```

1. Copy the output
2. Go to: https://github.com/settings/keys
3. Click **"New SSH key"**
4. Title: `Noti System`
5. Paste the key
6. Click **"Add SSH key"**

### Step 3: Use SSH Remote URL

```bash
cd /home/bwardsen/work/note-system/notes
git remote set-url origin git@github.com:devjasha/Notes.git
```

### Step 4: Test

```bash
ssh -T git@github.com
# Should say: "Hi devjasha! You've successfully authenticated..."
```

---

## Current Status

Your repository is currently configured for: **SSH**
- Remote URL: `git@github.com:devjasha/Notes.git`

**For Docker**, switch to HTTPS (Option 1) for easier setup.

**For local Neovim**, either method works fine.

---

## Troubleshooting

### "Permission denied" errors in Docker
→ You're using SSH but Docker doesn't have your keys. Switch to HTTPS.

### "Host key verification failed"
→ SSH host keys aren't configured. Switch to HTTPS or use the entrypoint script fix.

### "Authentication failed"
→ Check your token is valid and has `repo` scope.

### Token expired
→ Generate a new token and update the environment variable.

---

## Security Notes

- ⚠️ Never commit `.env` files with tokens to Git
- ⚠️ Add `.env` to `.gitignore`
- ✅ Use "No expiration" for personal projects (or set a reminder to renew)
- ✅ Tokens are as sensitive as passwords - keep them secret!

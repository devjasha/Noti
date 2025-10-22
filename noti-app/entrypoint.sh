#!/bin/sh
set -e

# Set HOME to /tmp/home and ensure it's used by all processes
export HOME=/tmp/home
mkdir -p $HOME/.ssh

echo "🏠 HOME directory set to: $HOME"

# Configure git safe directory
git config --global --add safe.directory /app/notes

# Copy SSH keys from mounted host directory
if [ -d "/tmp/host-ssh" ]; then
  echo "🔑 Copying SSH keys from host..."

  # Copy all files
  cp -r /tmp/host-ssh/* $HOME/.ssh/ 2>/dev/null || true

  # List what we got
  echo "📂 SSH directory contents:"
  ls -la $HOME/.ssh/

  # Fix permissions (SSH is very strict about this)
  chmod 700 $HOME/.ssh

  # Fix key file permissions
  find $HOME/.ssh -type f -name "id_*" ! -name "*.pub" -exec chmod 600 {} \; 2>/dev/null || true
  find $HOME/.ssh -type f -name "*.pub" -exec chmod 644 {} \; 2>/dev/null || true

  # Check if we have any private keys
  if ls $HOME/.ssh/id_* 2>/dev/null | grep -v ".pub" > /dev/null; then
    echo "✅ SSH private keys found"
  else
    echo "⚠️  WARNING: No SSH private keys found!"
    echo "Expected files like: id_rsa, id_ed25519, id_ecdsa"
  fi
else
  echo "⚠️  No SSH keys found at /tmp/host-ssh"
fi

# Add GitHub to known hosts (avoid host key verification)
echo "🔐 Adding GitHub to known hosts..."
ssh-keyscan -H github.com >> $HOME/.ssh/known_hosts 2>/dev/null || true

# Create SSH config
cat > $HOME/.ssh/config <<EOF
Host github.com
  HostName github.com
  User git
  IdentityFile $HOME/.ssh/id_ed25519
  IdentityFile $HOME/.ssh/id_rsa
  IdentityFile $HOME/.ssh/id_ecdsa
  StrictHostKeyChecking accept-new
  UserKnownHostsFile=$HOME/.ssh/known_hosts
EOF
chmod 600 $HOME/.ssh/config

echo "✅ SSH configuration complete"

# Set GIT_SSH_COMMAND to use our SSH config
export GIT_SSH_COMMAND="ssh -F $HOME/.ssh/config"

# Configure git credentials if provided (for HTTPS)
if [ -n "$GIT_USERNAME" ] && [ -n "$GIT_TOKEN" ]; then
  echo "🔐 Configuring HTTPS Git credentials for user: $GIT_USERNAME"
  git config --global credential.helper store
  echo "https://${GIT_USERNAME}:${GIT_TOKEN}@github.com" > $HOME/.git-credentials
  chmod 600 $HOME/.git-credentials
  echo "✅ HTTPS credentials configured"
fi

echo "🚀 Starting Noti..."

# Ensure environment variables are set for the Node.js process
export HOME=/tmp/home
export GIT_SSH_COMMAND="ssh -F /tmp/home/.ssh/config"

# Start the application
exec node server.js

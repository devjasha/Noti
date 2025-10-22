#!/bin/bash

echo "🔧 Noti Git HTTPS Setup"
echo "======================="
echo ""

# Check if we're in the right directory
if [ ! -d "notes" ]; then
    echo "❌ Error: Run this script from the note-system directory"
    exit 1
fi

# Switch remote to HTTPS
echo "📝 Switching Git remote to HTTPS..."
cd notes
git remote set-url origin https://github.com/devjasha/Notes.git
echo "✅ Remote URL updated to: $(git remote get-url origin)"
cd ..

# Prompt for credentials
echo ""
echo "🔑 Git Credentials Setup"
echo "------------------------"
echo "Get a token from: https://github.com/settings/tokens"
echo ""

read -p "Enter your GitHub username [devjasha]: " username
username=${username:-devjasha}

read -sp "Enter your Personal Access Token: " token
echo ""

if [ -z "$token" ]; then
    echo "❌ No token provided. Exiting."
    exit 1
fi

# Create .env file
echo "📄 Creating .env file..."
cat > .env <<EOF
# Git credentials for Docker
GIT_USERNAME=$username
GIT_TOKEN=$token
EOF

echo "✅ .env file created"

# Update docker-compose.yml to use .env
echo "📝 Updating docker-compose.yml..."
if grep -q "GIT_USERNAME=\${GIT_USERNAME}" docker-compose.yml; then
    echo "✅ docker-compose.yml already configured"
else
    # Backup
    cp docker-compose.yml docker-compose.yml.backup

    # Add env vars (simple approach - manually edit if needed)
    echo ""
    echo "⚠️  Manually update docker-compose.yml environment section with:"
    echo "      - GIT_USERNAME=\${GIT_USERNAME}"
    echo "      - GIT_TOKEN=\${GIT_TOKEN}"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit docker-compose.yml and uncomment the GIT_USERNAME and GIT_TOKEN lines"
echo "   Or add:"
echo "      - GIT_USERNAME=\${GIT_USERNAME}"
echo "      - GIT_TOKEN=\${GIT_TOKEN}"
echo ""
echo "2. Restart Docker:"
echo "   docker-compose down"
echo "   docker-compose up -d"
echo ""
echo "3. Test by pushing from the web interface!"

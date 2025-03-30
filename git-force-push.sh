#!/bin/bash

# Force push script for GitHub
# Usage: ./git-force-push.sh <github_username> <github_token>

if [ $# -ne 2 ]; then
  echo "Usage: ./git-force-push.sh <github_username> <github_token>"
  exit 1
fi

USERNAME=$1
TOKEN=$2
REMOTE_URL=$(git config --get remote.origin.url)

# Extract repo information from the remote URL
if [[ $REMOTE_URL == https://github.com/* ]]; then
  REPO=${REMOTE_URL#https://github.com/}
elif [[ $REMOTE_URL == git@github.com:* ]]; then
  REPO=${REMOTE_URL#git@github.com:}
else
  echo "Unsupported remote URL format: $REMOTE_URL"
  exit 1
fi

# Remove .git suffix if present
REPO=${REPO%.git}

# Construct the authenticated URL
AUTH_URL="https://$USERNAME:$TOKEN@github.com/$REPO.git"

# Force push
echo "Pushing to $REPO (URL redacted for security)"
git push "$AUTH_URL" main --force

if [ $? -eq 0 ]; then
  echo "Successfully pushed to repository!"
else
  echo "Failed to push to repository. Check your credentials and try again."
  exit 1
fi
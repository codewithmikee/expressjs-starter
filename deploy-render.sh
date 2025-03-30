#!/bin/bash

# Deploy to Render Script
# This script helps prepare and deploy your application to Render

# Print colored status messages
function print_status() {
  local COLOR='\033[1;36m' # Cyan
  local NC='\033[0m' # No Color
  echo -e "${COLOR}[DEPLOY] $1${NC}"
}

function print_error() {
  local COLOR='\033[1;31m' # Red
  local NC='\033[0m' # No Color
  echo -e "${COLOR}[ERROR] $1${NC}"
}

function print_success() {
  local COLOR='\033[1;32m' # Green
  local NC='\033[0m' # No Color
  echo -e "${COLOR}[SUCCESS] $1${NC}"
}

# Verify required tools
print_status "Checking required tools..."

if ! command -v git &> /dev/null; then
  print_error "git is not installed. Please install it before continuing."
  exit 1
fi

# Check for either npm or pnpm
if ! command -v pnpm &> /dev/null && ! command -v npm &> /dev/null; then
  print_error "Neither npm nor pnpm is installed. Please install one of them before continuing."
  exit 1
fi

if command -v pnpm &> /dev/null; then
  print_status "pnpm is available and will be used for package management."
else
  print_status "npm is available and will be used for package management."
fi

# Make sure we're in the project root
if [ ! -f "package.json" ]; then
  print_error "package.json not found. Please run this script from the project root."
  exit 1
fi

# Test build to make sure it works locally
print_status "Testing build process locally..."
# Use pnpm if available, otherwise fall back to npm
if command -v pnpm &> /dev/null; then
  print_status "Using pnpm for build..."
  pnpm run build
else
  print_status "pnpm not found, using npm instead..."
  npm run build
fi

if [ $? -ne 0 ]; then
  print_error "Build failed. Please fix the errors before deploying."
  exit 1
fi

print_success "Build completed successfully."

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
  print_error "render.yaml not found. Please make sure it exists in the project root."
  exit 1
fi

print_status "render.yaml found."

# Check if the current directory is a git repository
if [ ! -d ".git" ]; then
  print_status "Initializing git repository..."
  git init
  git add .
  git commit -m "Initial commit for Render deployment"
else
  print_status "Git repository already initialized."
  
  # Check for uncommitted changes
  if ! git diff-index --quiet HEAD --; then
    print_status "Uncommitted changes detected. Committing changes..."
    git add .
    git commit -m "Update for Render deployment"
  else
    print_status "No uncommitted changes."
  fi
fi

# Ask for remote repository URL if not already set
REMOTE_URL=$(git config --get remote.origin.url)
if [ -z "$REMOTE_URL" ]; then
  echo ""
  print_status "No git remote repository found."
  echo ""
  echo "To deploy to Render, you need to push your code to a git repository."
  echo "Options:"
  echo "1. Create a new repository on GitHub, GitLab, or Bitbucket"
  echo "2. Use an existing repository"
  echo ""
  
  read -p "Enter your git repository URL (or press enter to skip): " REPO_URL
  
  if [ -n "$REPO_URL" ]; then
    git remote add origin "$REPO_URL"
    print_status "Remote repository added: $REPO_URL"
  else
    print_status "No repository URL provided. Skipping remote configuration."
    print_status "You'll need to manually push your code to a repository before deploying to Render."
  fi
else
  print_status "Remote repository already configured: $REMOTE_URL"
fi

# Push changes if remote is configured
REMOTE_URL=$(git config --get remote.origin.url)
if [ -n "$REMOTE_URL" ]; then
  print_status "Pushing changes to remote repository..."
  git push -u origin HEAD
  
  if [ $? -ne 0 ]; then
    print_error "Failed to push to remote repository. Please push manually."
  else
    print_success "Changes pushed to remote repository."
  fi
fi

# Deployment instructions
echo ""
print_status "Deployment Preparation Complete!"
echo ""
echo "To deploy your application to Render:"
echo ""
echo "1. Go to https://dashboard.render.com/select-repo"
echo "2. Connect your repository"
echo "3. Select 'Use render.yaml' when prompted"
echo "4. Review configuration and click 'Create New Resources'"
echo ""
echo "Your application will be deployed automatically."
echo ""
print_success "For more details, see RENDER_DEPLOYMENT.md"
echo ""
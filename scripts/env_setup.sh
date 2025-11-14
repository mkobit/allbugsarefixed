#!/bin/bash
# Jules environment setup for allbugsarefixed repository
# For more information, see: https://jules.google/docs/environment/

set -euo pipefail

echo "Setting up allbugsarefixed environment..."

echo "--- Diagnostic Information ---"
echo "User: $(whoami)"
echo "Node version: $(node -v)"
echo "PNPM version: $(pnpm -v)"
echo "Environment variables:"
env
GIT_COMMIT_HASH=$(git rev-parse HEAD)
GIT_COMMIT_DATE=$(git log -1 --format=%cI)
export GIT_COMMIT_HASH
export GIT_COMMIT_DATE
echo "Git Commit Hash: ${GIT_COMMIT_HASH}"
echo "Git Commit Date: ${GIT_COMMIT_DATE}"
echo "------------------------------"

# Install pnpm if not present
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    npm install -g pnpm
fi

echo "Installing dependencies..."
pnpm install

echo "Running linter..."
pnpm lint

echo "Building project..."
pnpm build

echo " Environment ready"

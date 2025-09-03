#!/bin/bash
# Jules environment setup for this repository
# For more information, see: https://jules.google/docs/environment/

set -euo pipefail

echo "Setting up environment..."

echo "--- Diagnostic Information ---"
echo "User: $(whoami)"
echo "Environment variables:"
env
export GIT_COMMIT_HASH=$(git rev-parse HEAD)
export GIT_COMMIT_DATE=$(git log -1 --format=%cI)
echo "Git Commit Hash: ${GIT_COMMIT_HASH}"
echo "Git Commit Date: ${GIT_COMMIT_DATE}"
echo "------------------------------"

echo "Checking for Node.js and yarn..."

# The CI uses Node.js 22
# nvm is pre-installed in the Jules environment
source ~/.nvm/nvm.sh
nvm install 22
nvm use 22

# Install yarn if not present
if ! command -v yarn &> /dev/null
then
    echo "yarn could not be found, installing it globally"
    npm install -g yarn
fi

echo "Node version: $(node --version)"
echo "Yarn version: $(yarn --version)"

echo "Installing dependencies..."
yarn install --frozen-lockfile

echo "Running linter..."
yarn lint

echo "Building application..."
yarn build

echo "Environment ready"

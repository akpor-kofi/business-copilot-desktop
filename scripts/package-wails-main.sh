#!/bin/bash

# Define paths
SOURCE_DIR="./frontend/wailsjs/go/main"
TARGET_DIR="./npm-wails-main"
PACKAGE_NAME="@akporkofi/wails-go-functions"
PACKAGE_VERSION="1.0.0"

echo "Preparing to package Wails main functions..."

# Check if the source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
  echo "Error: Source directory $SOURCE_DIR does not exist. Run 'wails build' first."
  exit 1
fi

# Remove old target directory
rm -rf "$TARGET_DIR"

# Copy the source directory
mkdir -p "$TARGET_DIR"
cp -r "$SOURCE_DIR"/* "$TARGET_DIR"

# Create package.json dynamically
cat <<EOF > "$TARGET_DIR/package.json"
{
  "name": "$PACKAGE_NAME",
  "version": "$PACKAGE_VERSION",
  "description": "Wails generated functions for Golang app integration.",
  "main": "App.js",
  "types": "App.d.ts",
  "files": [
    "App.js",
    "App.d.ts"
  ],
  "author": "Your Name",
  "license": "MIT"
}
EOF

echo "Package.json created."

# Publish to NPM
cd "$TARGET_DIR"
npm publish --access public

echo "Package published successfully!"
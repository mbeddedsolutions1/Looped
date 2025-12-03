#!/usr/bin/env sh
# Copy / build a Vite frontend located in ../frontend into server's public folder

set -e

FRONTEND_DIR="../frontend"
PUBLIC_DIR="../public"

if [ -d "$FRONTEND_DIR" ]; then
  echo "Found frontend at $FRONTEND_DIR — installing and building..."
  cd "$FRONTEND_DIR"

  if [ -f package-lock.json ]; then
    npm ci
  else
    npm install
  fi

  npm run build

  echo "Copying build output into server public folder..."
  rm -rf "$PUBLIC_DIR"/*
  mkdir -p "$PUBLIC_DIR"
  cp -r dist/* "$PUBLIC_DIR/" || true

  echo "Frontend imported into $PUBLIC_DIR"
else
  echo "No frontend directory found at $FRONTEND_DIR."
  echo "Place your Vite frontend at ../frontend or run the PowerShell helper to copy it from Downloads."
  exit 0
fi

#!/bin/bash

# setup-mdns.sh
# Installs and enables mDNS (Avahi) and optionally sets the system hostname.
# Usage: sudo ./setup-mdns.sh [hostname]

set -e

HOSTNAME_ARG=${1:-looped}

echo "▶ Installing and configuring mDNS (avahi-daemon)"

# Install Avahi
if ! command -v avahi-daemon >/dev/null 2>&1; then
  echo "Installing avahi-daemon... (apt-get may prompt)"
  sudo apt-get update
  sudo apt-get install -y avahi-daemon
else
  echo "avahi-daemon already installed"
fi

# Set hostname if provided
CURRENT_HOSTNAME=$(hostnamectl --static)
if [ "$CURRENT_HOSTNAME" != "$HOSTNAME_ARG" ]; then
  echo "Setting system hostname to: $HOSTNAME_ARG"
  sudo hostnamectl set-hostname "$HOSTNAME_ARG"
else
  echo "Hostname already set to $HOSTNAME_ARG"
fi

# Ensure Avahi is enabled and restarted
sudo systemctl daemon-reload
sudo systemctl enable avahi-daemon.service
sudo systemctl restart avahi-daemon.service

# Show status
sudo systemctl status avahi-daemon --no-pager -l | sed -n '1,10p'

echo "✓ mDNS (avahi) installed and running. Your device should be reachable at: ${HOSTNAME_ARG}.local"

echo "If you changed hostname, you may need to re-login or reboot for all services to update."

#!/bin/bash

# setup-startup.sh
# Installs the looped-startup.service for auto-starting all services on boot

echo "Installing Looped Startup Service..."

# Copy service file
sudo cp /home/admin/looped/access-point/looped-startup.service /etc/systemd/system/

# Reload systemd daemon
sudo systemctl daemon-reload

# Enable service to run on boot
sudo systemctl enable looped-startup.service

# Start it immediately
sudo systemctl start looped-startup.service

echo "✓ Looped Startup Service installed and enabled"
echo ""
echo "Verify with:"
echo "  sudo systemctl status looped-startup.service"
echo "  sudo journalctl -u looped-startup -f"

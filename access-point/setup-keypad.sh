#!/bin/bash

# Install and enable the Looped Keypad DTMF service

echo "▶ Installing Looped Keypad DTMF service..."

# Copy systemd service file (from current directory)
sudo cp ./looped-keypad.service /etc/systemd/system/

# Reload systemd daemon
sudo systemctl daemon-reload

# Enable the service to start on boot
sudo systemctl enable looped-keypad.service

# Start the service immediately
sudo systemctl start looped-keypad.service

echo "✓ Keypad service installed and started"
echo "  View logs with: sudo journalctl -u looped-keypad -f"
echo ""

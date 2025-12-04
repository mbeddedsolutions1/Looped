#!/bin/bash

# looped-startup.sh
# Starts all Looped services on boot (no installation or upgrades)
# Called by systemd on every boot

set -e

echo "▶ Looped Services Startup"
echo "=========================="

# --- Start WiFi Access Point (if needed) ---
echo "▶ Checking WiFi status..."
if sudo systemctl is-active --quiet hostapd; then
    echo "✓ Access Point already running"
else
    echo "Starting Access Point..."
    sudo systemctl start hostapd
    sudo systemctl start dnsmasq
    echo "✓ Access Point started"
fi

# --- Start Node.js Server ---
echo "▶ Starting Node.js server..."
if sudo systemctl is-active --quiet access-point-server; then
    echo "✓ Server already running"
else
    sudo systemctl start access-point-server
    echo "✓ Server started"
fi

# --- Start Keypad DTMF Scanner ---
echo "▶ Starting keypad scanner..."
if sudo systemctl is-active --quiet looped-keypad; then
    echo "✓ Keypad scanner already running"
else
    sudo systemctl start looped-keypad
    echo "✓ Keypad scanner started"
fi

echo ""
echo "=========================="
echo "✓ All Looped services started"
echo ""
echo "Status:"
sudo systemctl status --no-pager access-point-server looped-keypad hostapd dnsmasq 2>/dev/null | grep "Active:" || true
echo ""

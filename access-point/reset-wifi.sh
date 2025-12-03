#!/bin/bash

# Reset WiFi credentials to force AP mode on next boot
# This erases /etc/wpa_supplicant/wpa_supplicant.conf so the device
# will not connect to any saved network and will auto-start the AP instead

echo "▶ Resetting WiFi credentials..."

if [ -f /etc/wpa_supplicant/wpa_supplicant.conf ]; then
    sudo rm /etc/wpa_supplicant/wpa_supplicant.conf
    echo "✓ WiFi credentials erased"
else
    echo "⚠ No WiFi config file found (already reset)"
fi

echo ""
echo "✓ On next boot, the device will start in Access Point (AP) mode."
echo "  Connect to the AP and configure WiFi via the portal."
echo ""

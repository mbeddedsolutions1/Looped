#!/bin/bash

# setup-pjsua.sh
# Installs the looped-pjsua.service and enables it

echo "Installing Looped pjsua service..."

sudo cp /home/admin/looped/access-point/looped-pjsua.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable looped-pjsua.service
sudo systemctl start looped-pjsua.service

echo "✓ Installed and started looped-pjsua.service"
echo "Check status: sudo systemctl status looped-pjsua.service"

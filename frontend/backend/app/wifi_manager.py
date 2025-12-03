"""
WiFi Management Service for Raspberry Pi
Handles WiFi connectivity and provides captive portal for WiFi setup
"""

import os
import subprocess
import json
import logging
from pathlib import Path
from http.server import HTTPServer, SimpleHTTPRequestHandler
import threading
import time
import socket

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WiFiManager:
    def __init__(self):
        self.ap_ssid = "RaspberryPi-Setup"
        self.ap_password = "raspberrypi123"
        self.config_file = Path("/etc/wpa_supplicant/wpa_supplicant.conf")
        self.ap_mode = False
        self.http_server = None
        
    def check_wifi_connected(self):
        """Check if WiFi is connected with internet access"""
        try:
            result = subprocess.run(
                ["iwgetid", "-r"],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0 and result.stdout.strip():
                # SSID found, check internet connectivity
                return self.has_internet()
            return False
        except Exception as e:
            logger.error(f"Error checking WiFi: {e}")
            return False
    
    def has_internet(self):
        """Check if there's internet connectivity"""
        try:
            socket.create_connection(("8.8.8.8", 53), timeout=3)
            return True
        except OSError:
            return False
    
    def start_ap_mode(self):
        """Start WiFi Access Point mode using hostapd and dnsmasq"""
        try:
            logger.info("Starting AP mode...")
            self.ap_mode = True
            
            # Create hostapd config
            hostapd_config = f"""
interface=wlan0
driver=nl80211
ssid={self.ap_ssid}
hw_mode=g
channel=6
wmm_enabled=1
macaddr_acl=0
auth_algs=1
wpa=2
wpa_passphrase={self.ap_password}
wpa_key_mgmt=WPA-PSK
wpa_pairwise=CCMP
wpa_ptk_rekey=600
"""
            with open("/etc/hostapd/hostapd.conf", "w") as f:
                f.write(hostapd_config)
            
            # Create dnsmasq config for DHCP
            dnsmasq_config = """
interface=wlan0
bind-interfaces
server=8.8.8.8
domain-needed
bogus-priv
dhcp-range=192.168.4.2,192.168.4.20,255.255.255.0,24h
"""
            with open("/etc/dnsmasq.conf", "w") as f:
                f.write(dnsmasq_config)
            
            # Configure wlan0 with static IP
            subprocess.run(["sudo", "ifconfig", "wlan0", "192.168.4.1"], check=False)
            
            # Start services
            subprocess.run(["sudo", "service", "hostapd", "restart"], check=False)
            subprocess.run(["sudo", "service", "dnsmasq", "restart"], check=False)
            
            logger.info(f"AP mode started: {self.ap_ssid}")
        except Exception as e:
            logger.error(f"Error starting AP mode: {e}")
    
    def stop_ap_mode(self):
        """Stop AP mode and reconnect to WiFi"""
        try:
            logger.info("Stopping AP mode...")
            subprocess.run(["sudo", "service", "hostapd", "stop"], check=False)
            subprocess.run(["sudo", "service", "dnsmasq", "stop"], check=False)
            subprocess.run(["sudo", "service", "dhcpcd", "restart"], check=False)
            self.ap_mode = False
            logger.info("AP mode stopped")
        except Exception as e:
            logger.error(f"Error stopping AP mode: {e}")
    
    def connect_to_wifi(self, ssid, password):
        """Connect to a WiFi network"""
        try:
            logger.info(f"Connecting to WiFi: {ssid}")
            
            # Create wpa_supplicant configuration
            wpa_config = f"""
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=US

network={{
    ssid="{ssid}"
    psk="{password}"
    key_mgmt=WPA-PSK
}}
"""
            with open(str(self.config_file), "w") as f:
                f.write(wpa_config)
            
            # Restart WiFi
            subprocess.run(["sudo", "wpa_cli", "-i", "wlan0", "reconfigure"], check=False)
            subprocess.run(["sudo", "service", "dhcpcd", "restart"], check=False)
            
            # Wait and check if connected
            time.sleep(5)
            if self.has_internet():
                logger.info("Successfully connected to WiFi!")
                return True
            return False
        except Exception as e:
            logger.error(f"Error connecting to WiFi: {e}")
            return False


class CaptivePortalHandler(SimpleHTTPRequestHandler):
    """HTTP Request handler for captive portal"""
    
    wifi_manager = None
    
    def do_GET(self):
        if self.path == "/" or self.path == "/index.html":
            self.send_response(200)
            self.send_header("Content-type", "text/html")
            self.end_headers()
            
            html = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Raspberry Pi WiFi Setup</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            max-width: 400px;
            width: 90%;
        }
        h1 {
            text-align: center;
            color: #333;
            margin-top: 0;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            color: #555;
            font-weight: bold;
        }
        input[type="text"],
        input[type="password"] {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 5px;
            box-sizing: border-box;
            font-size: 14px;
        }
        input[type="text"]:focus,
        input[type="password"]:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 5px rgba(102, 126, 234, 0.3);
        }
        button {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.2s;
        }
        button:hover {
            transform: translateY(-2px);
        }
        button:active {
            transform: translateY(0);
        }
        .status {
            margin-top: 20px;
            padding: 10px;
            border-radius: 5px;
            text-align: center;
            display: none;
        }
        .status.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
            display: block;
        }
        .status.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
            display: block;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🍓 Raspberry Pi Setup</h1>
        <form id="wifiForm">
            <div class="form-group">
                <label for="ssid">WiFi Network (SSID)</label>
                <input type="text" id="ssid" name="ssid" required placeholder="Enter WiFi network name">
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required placeholder="Enter WiFi password">
            </div>
            <button type="submit">Connect</button>
        </form>
        <div id="status" class="status"></div>
    </div>
    
    <script>
        document.getElementById('wifiForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const ssid = document.getElementById('ssid').value;
            const password = document.getElementById('password').value;
            const status = document.getElementById('status');
            
            status.textContent = 'Connecting...';
            status.className = 'status';
            
            try {
                const response = await fetch('/api/wifi/connect', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ ssid, password })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    status.textContent = 'Successfully connected! Redirecting...';
                    status.className = 'status success';
                    setTimeout(() => {
                        window.location.href = 'http://192.168.1.1';
                    }, 3000);
                } else {
                    status.textContent = 'Failed to connect: ' + data.message;
                    status.className = 'status error';
                }
            } catch (err) {
                status.textContent = 'Error: ' + err.message;
                status.className = 'status error';
            }
        });
    </script>
</body>
</html>
"""
            self.wfile.write(html.encode())
        elif self.path == "/api/wifi/connect":
            self.do_POST()
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_POST(self):
        if self.path == "/api/wifi/connect":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            
            try:
                data = json.loads(body.decode())
                ssid = data.get("ssid", "")
                password = data.get("password", "")
                
                if self.wifi_manager.connect_to_wifi(ssid, password):
                    response = {"success": True, "message": "Connected"}
                else:
                    response = {"success": False, "message": "Connection failed"}
            except Exception as e:
                response = {"success": False, "message": str(e)}
            
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
    
    def log_message(self, format, *args):
        logger.info(format % args)


def start_captive_portal(wifi_manager):
    """Start the captive portal HTTP server"""
    try:
        CaptivePortalHandler.wifi_manager = wifi_manager
        server = HTTPServer(("0.0.0.0", 80), CaptivePortalHandler)
        logger.info("Captive portal started on port 80")
        server.serve_forever()
    except Exception as e:
        logger.error(f"Error starting captive portal: {e}")


def main():
    """Main WiFi management loop"""
    wifi_manager = WiFiManager()
    
    logger.info("Starting Raspberry Pi WiFi Manager...")
    
    # Check if already connected
    if wifi_manager.check_wifi_connected():
        logger.info("WiFi connected with internet access")
        return
    
    # Start AP mode
    wifi_manager.start_ap_mode()
    
    # Start captive portal in a separate thread
    portal_thread = threading.Thread(target=start_captive_portal, args=(wifi_manager,), daemon=True)
    portal_thread.start()
    
    # Monitor connectivity
    while True:
        time.sleep(10)
        if wifi_manager.check_wifi_connected() and not wifi_manager.ap_mode:
            logger.info("Connected! WiFi Manager ready.")
            break
        elif wifi_manager.check_wifi_connected() and wifi_manager.ap_mode:
            logger.info("Internet connected, stopping AP mode")
            wifi_manager.stop_ap_mode()


if __name__ == "__main__":
    main()

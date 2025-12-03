import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import { pong } from './pong';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// ============================================================================
// WiFi Management Functions
// ============================================================================

/**
 * Check if the device is connected to a WiFi network (not the AP itself)
 * Returns true if connected to a known WiFi, false if not connected or only on AP
 */
async function isConnectedToWiFi(): Promise<boolean> {
  try {
    const { stdout } = await execPromise('iwconfig wlan0 2>/dev/null | grep "SSID"', {
      shell: '/bin/bash'
    });
    // If SSID is set and not empty, we're connected to something
    const match = stdout.match(/SSID:"([^"]*)"/);
    if (match && match[1] && match[1].length > 0) {
      console.log(`✓ Connected to WiFi: ${match[1]}`);
      return true;
    }
    console.log('✗ Not connected to any WiFi network');
    return false;
  } catch (err) {
    console.log('⚠ Could not check WiFi connection status:', err);
    return false;
  }
}

/**
 * Start the Access Point (AP mode)
 * Enables the Raspberry Pi to broadcast its own WiFi network for initial setup
 */
async function startAccessPoint(): Promise<void> {
  try {
    console.log('▶ Starting Access Point...');
    // These commands assume setup-access-point.sh has already been run
    await execPromise('sudo systemctl start hostapd', { shell: '/bin/bash' });
    await execPromise('sudo systemctl start dnsmasq', { shell: '/bin/bash' });
    console.log('✓ Access Point started');
  } catch (err) {
    console.error('✗ Failed to start Access Point:', err);
  }
}

/**
 * Stop the Access Point
 * Disables the AP mode to allow WiFi client mode to take over
 */
async function stopAccessPoint(): Promise<void> {
  try {
    console.log('▶ Stopping Access Point...');
    await execPromise('sudo systemctl stop hostapd', { shell: '/bin/bash' });
    await execPromise('sudo systemctl stop dnsmasq', { shell: '/bin/bash' });
    console.log('✓ Access Point stopped');
  } catch (err) {
    console.error('✗ Failed to stop Access Point:', err);
  }
}

/**
 * Restart networking to apply wpa_supplicant config changes
 */
async function restartNetworking(): Promise<void> {
  try {
    console.log('▶ Restarting networking...');
    await execPromise('sudo systemctl restart wpa_supplicant', { shell: '/bin/bash' });
    console.log('✓ Networking restarted');
  } catch (err) {
    console.error('✗ Failed to restart networking:', err);
  }
}

/**
 * Initialize WiFi on startup:
 * - If already connected to WiFi, skip AP
 * - If not connected, start AP and wait for user to configure WiFi via portal
 */
async function initializeWiFi(): Promise<void> {
  try {
    console.log('▶ Checking WiFi connection on startup...');
    const connected = await isConnectedToWiFi();

    if (connected) {
      console.log('✓ Device is connected to WiFi. Running in client mode.');
    } else {
      console.log('⚠ Device is NOT connected to WiFi. Starting Access Point...');
      console.log('   Users can connect to the AP and configure WiFi via the portal.');
      await startAccessPoint();
    }
  } catch (err) {
    console.error('✗ Error during WiFi initialization:', err);
    // Fail gracefully: try to start AP anyway
    await startAccessPoint();
  }
}

// ============================================================================
// Express Routes
// ============================================================================

/**
 * GET / — Serve the captive portal / dashboard
 * (static files from public/ are served automatically)
 */
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

/**
 * POST /connect — Accept WiFi credentials from the portal
 * Writes wpa_supplicant.conf and transitions to WiFi client mode
 */
app.post('/connect', async (req: Request, res: Response) => {
  const { ssid, psk } = req.body;

  if (!ssid || !psk) {
    return res.status(400).send('Missing SSID or password.');
  }

  console.log(`▶ Received WiFi credentials: SSID="${ssid}"`);

  // Build wpa_supplicant configuration
  const wpaConf = `ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=US

network={
    ssid="${ssid}"
    psk="${psk}"
}
`;

  try {
    // Write the configuration to disk
    await promisify(fs.writeFile)('/etc/wpa_supplicant/wpa_supplicant.conf', wpaConf);
    console.log('✓ WiFi config saved to /etc/wpa_supplicant/wpa_supplicant.conf');

    res.send(
      '<h2>✓ WiFi Configured!</h2>' +
      '<p>The device will now attempt to connect to the specified network.</p>' +
      '<p>Switching to WiFi client mode and stopping the Access Point...</p>'
    );

    // Gracefully transition to client mode after a short delay
    setTimeout(async () => {
      console.log('▶ Transitioning to WiFi client mode...');
      await stopAccessPoint();
      await restartNetworking();
      console.log('✓ Transitioned to WiFi client mode. Device will now connect to the saved network.');
    }, 2000);
  } catch (err) {
    console.error('✗ Failed to save WiFi config:', err);
    res.status(500).send(`<h2>✗ Error</h2><p>Failed to save WiFi configuration: ${err}</p>`);
  }
});

/**
 * GET /api/ping — Simple health check endpoint
 */
app.get('/api/ping', (req: Request, res: Response) => {
  res.send('pong');
});

/**
 * GET /api/wifi-status — Check current WiFi connection status
 */
app.get('/api/wifi-status', async (req: Request, res: Response) => {
  try {
    const connected = await isConnectedToWiFi();
    res.json({ connected, mode: connected ? 'client' : 'ap' });
  } catch (err) {
    res.status(500).json({ error: 'Could not determine WiFi status' });
  }
});

// ============================================================================
// Error Handling
// ============================================================================

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('⚠ Unhandled error:', err);
  res.status(500).send('<h2>Error</h2><p>An error occurred. Check server logs.</p>');
});

// ============================================================================
// Startup
// ============================================================================

async function start() {
  console.log('\n⚡ Looped Captive Portal Server');
  console.log('================================\n');

  // Initialize WiFi: detect and start AP if needed
  await initializeWiFi();

  // Start the Express server
  app.listen(PORT, () => {
    console.log(`\n⚡ Server listening on port ${PORT}`);
    console.log(`   Access the portal at: http://192.168.4.1:${PORT}\n`);
  });
}

start().catch((err) => {
  console.error('✗ Failed to start server:', err);
  process.exit(1);
});

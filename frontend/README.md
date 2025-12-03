# Looped Device Manager (Frontend + Device WiFi Setup)

Overview
--------

This repository contains a Vite + React frontend and a small FastAPI backend used to manage Looped devices (example Raspberry Pi devices). The project includes a WiFi manager that can run on a Pi to present a captive portal for initial WiFi setup, and a simple device registration API to add devices to the system.

**Main features**
- Web UI (Vite + React) to view and add devices and contacts
- FastAPI backend providing device and contacts APIs
- WiFiManager (Raspberry Pi): AP mode + captive portal for network setup

Repository layout (important files)
- `package.json`, `vite.config.js` - frontend project root
- `src/` - React app components and pages
- `backend/` - Python backend and device/wifi manager
  - `backend/app/main.py` - FastAPI app and API endpoints
  - `backend/app/wifi_manager.py` - WiFi/AP + captive portal (runs on Pi)
  - `backend/app/device/device_manager.py` - in-memory device manager
  - `backend/requirements.txt` - Python dependencies
- `docker-compose.yml` - optional Docker dev environment

Prerequisites
-------------
- Node.js (v14+ recommended) and npm/yarn
- Python 3.8+ and `pip`
- For device WiFi features: a Linux device (Raspberry Pi), root/sudo access, and hostapd/dnsmasq installed
- Optional: Docker & Docker Compose for containerized run

Quick start - Local development (Windows PowerShell)
-------------------------------------------------

1) Frontend

```powershell
cd C:\Users\jared\Downloads\M\react_vite_frontend
npm install
npm run dev
```

Vite typically serves at `http://localhost:5173`. Open the app in your browser.

2) Backend

Open a new terminal (PowerShell or WSL recommended) and run:

```powershell
cd C:\Users\jared\Downloads\M\react_vite_frontend\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.

Quick start - Docker Compose (optional)
-------------------------------------

If you prefer containers, you can use the provided `docker-compose.yml`:

```powershell
cd C:\Users\jared\Downloads\M\react_vite_frontend
docker-compose up --build
```

WiFi Setup (Raspberry Pi captive portal)
----------------------------------------

The Pi-side WiFi manager in `backend/app/wifi_manager.py` implements a simple AP + captive portal flow for first-time setup.

- AP SSID: `RaspberryPi-Setup`
- AP Password: `raspberrypi123` (default in the script)
- Captive portal HTTP server listens on port `80` and serves a form at `/`.
- The form sends a POST to `/api/wifi/connect` with JSON `{ "ssid": "...", "password": "..." }`.

Typical flow (on the Pi):
1. Device boots and `WiFiManager` checks connectivity.
2. If no connection, it starts AP mode (hostapd + dnsmasq) and runs the captive portal.
3. User connects to WiFi `RaspberryPi-Setup` and opens a browser to the portal.
4. User submits network SSID and password. The handler writes a `wpa_supplicant` config and attempts to connect.

Notes & cautions:
- The captive portal and AP logic use `sudo` and modify system files like `/etc/wpa_supplicant/wpa_supplicant.conf` and service states. Run this code only on a dedicated device (Raspberry Pi) where these changes are expected.
- The captive portal is intended for Linux devices — it will not work on Windows or inside a general container without appropriate network privileges.

Adding a device
----------------

There are two ways to add a device to the running backend:

1) Using the Web UI

- Open the app in your browser (`http://localhost:5173`).
- Go to the `Devices` page and use the `Add Device` form. Provide a `Name` and optional `Meta` JSON (example: `{ "type": "Raspberry Pi" }`).

2) Using the API (curl example)

```powershell
curl -X POST "http://localhost:8000/api/devices" -H "Content-Type: application/json" -d "{\"name\": \"My Device\", \"meta\": {\"type\": \"Pi 4\"}}"
```

Response example (JSON):

```json
{
  "id": 5,
  "hostname": "LD0123",
  "name": "My Device",
  "meta": {
    "type": "Pi 4"
  }
}
```

Useful API endpoints
--------------------
- `GET /api/devices` - list devices
- `POST /api/devices` - add a device (JSON body `name` and `meta`)
- `GET /api/contacts` - list contacts
- `POST /api/contacts` - add contact
- `GET /api/contacts/{id}` - get contact
- `PUT /api/contacts/{id}` - update contact
- `DELETE /api/contacts/{id}` - delete contact

Troubleshooting
---------------
- If frontend can't reach backend in development, check CORS and the port (backend runs on port `8000`, frontend on `5173`). The FastAPI app in `backend/app/main.py` allows `http://localhost:5173`.
- If WiFi AP doesn't start on the Pi, ensure `hostapd`, `dnsmasq`, and necessary network tools are installed and that the script is run with root privileges.
- For Docker issues on Windows, use Docker Desktop with WSL2 backend enabled for best compatibility.

Where to look in the code
-------------------------
- Frontend pages: `src/pages/` (Devices, Contacts, Dashboard, etc.)
- Device form/UI: `src/components/DeviceForm.jsx` and `src/components/DeviceList.jsx`
- Backend API: `backend/app/main.py`
- WiFi manager: `backend/app/wifi_manager.py`
- Device manager stub: `backend/app/device/device_manager.py`

Next steps / Improvements
------------------------
- Persist devices to a database (SQLite/Postgres) instead of in-memory storage.
- Harden the WiFi setup flow (validate SSIDs, better error handling, secure default passwords, rate limiting).
- Add authentication to the API for production use.

License & Attribution
---------------------
This README is a documentation file for the project. Update or extend as your project evolves.
# React Vite + FastAPI + Asterisk scaffold

This workspace contains a Vite React frontend and a FastAPI backend with placeholder
modules for Asterisk and device management.

Frontend (already present):
- Path: `.` (root)
- Dev: `npm install` then `npm run dev` (Vite default on port 5173)
- The Vite dev server proxies `/api` to `http://localhost:8000` (see `vite.config.js`).

Backend:
- Path: `backend/`
- Create a virtualenv, install deps, and run uvicorn directly for dev:

```powershell
python -m venv .venv; .\.venv\Scripts\Activate; pip install -r backend\requirements.txt; uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Example endpoints:
  - `GET /health` — health check
  - `GET /api/devices` — list devices (in-memory stub)
  - `POST /api/devices` — add device (in-memory stub)
  - `POST /api/asterisk/ping` — ping Asterisk client stub

Docker (optional):
- Build and run backend + Asterisk placeholder with Docker Compose:

```powershell
docker-compose up --build
```

Asterisk integration:
- `backend/app/asterisk/asterisk_client.py` is a stub. Implement AMI/ARI client logic there.
- Secure credentials using environment variables or a `.env` file.

Next steps you might want me to take:
- Implement real Asterisk AMI/ARI integration (need credentials and chosen library).
- Add persistent storage for devices (SQLite/Postgres) and database models.
- Add frontend UI pages to call `/api/devices` and show device list.

If you want, I can now:
- Run `npm install` and `pip install` locally (I can provide the commands), or
- Add a simple frontend page to call the backend API and display devices.

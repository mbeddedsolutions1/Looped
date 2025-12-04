#!/usr/bin/env python3
"""pjsua_client.py

Runs the `pjsua` CLI to register a SIP account to an Asterisk server,
monitors registration status, and exposes a simple HTTP status endpoint
so the frontend can poll registration state.

Usage: configure environment variables and run as a service.
Environment variables used:
  PJSUA_BIN - path to pjsua binary (default: pjsua)
  SIP_USER  - SIP username/extension
  SIP_PASS  - SIP password
  SIP_DOMAIN - SIP domain (used in identity)
  SIP_SERVER - SIP registrar/proxy (hostname or IP)
  LISTEN_PORT - HTTP status port (default: 5050)

This implementation uses only the pjsua CLI (no Python pjsua bindings),
so it works on systems where pjsua binary is available.
"""

from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import os
import subprocess
import threading
import time
from datetime import datetime
import queue
import signal
import sys

# State shared between threads
state = {
    "registered": False,
    "last_event": "starting",
    "last_updated": datetime.utcnow().isoformat() + "Z",
}

event_q = queue.Queue()

PJSUA_BIN = os.environ.get("PJSUA_BIN", "pjsua")
SIP_USER = os.environ.get("SIP_USER")
SIP_PASS = os.environ.get("SIP_PASS")
SIP_DOMAIN = os.environ.get("SIP_DOMAIN")
SIP_SERVER = os.environ.get("SIP_SERVER")
LISTEN_PORT = int(os.environ.get("LISTEN_PORT", "5050"))

LOG_PREFIX = "[pjsua-client]"

if not SIP_USER or not SIP_PASS or not SIP_DOMAIN or not SIP_SERVER:
    print(f"{LOG_PREFIX} Missing SIP configuration. Set SIP_USER,SIP_PASS,SIP_DOMAIN,SIP_SERVER.")
    sys.exit(1)


def update_state(registered: bool, event: str):
    state["registered"] = registered
    state["last_event"] = event
    state["last_updated"] = datetime.utcnow().isoformat() + "Z"
    event_q.put((registered, event, state["last_updated"]))


class StatusHandler(BaseHTTPRequestHandler):
    def _send_json(self, data, code=200):
        payload = json.dumps(data).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self):
        if self.path == "/status":
            self._send_json(state)
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        # Silence default logging to stdout
        return


def run_http_server():
    server = HTTPServer(("0.0.0.0", LISTEN_PORT), StatusHandler)
    print(f"{LOG_PREFIX} HTTP status server listening on :{LISTEN_PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print(f"{LOG_PREFIX} HTTP server stopped")
    finally:
        server.server_close()


def build_pjsua_args():
    # Build a safe pjsua CLI invocation that registers and stays running
    identity = f"sip:{SIP_USER}@{SIP_DOMAIN}"
    registrar = f"sip:{SIP_SERVER}"

    args = [
        PJSUA_BIN,
        "--id", identity,
        "--registrar", registrar,
        "--realm", "*",
        "--username", SIP_USER,
        "--password", SIP_PASS,
        # Less verbose log level by default; frontend can read /status
        "--log-level", "3",
        # Keep console output (we will read it)
    ]

    return args


def monitor_pjsua_process(proc: subprocess.Popen):
    """Reads lines from pjsua stdout/stderr and updates registration state."""
    # pjsua prints to stderr sometimes, so read both fd via iter
    def reader(stream, stream_name):
        for raw in iter(stream.readline, b""):
            try:
                line = raw.decode("utf-8", errors="replace").strip()
            except Exception:
                line = str(raw)
            if not line:
                continue
            print(f"{LOG_PREFIX} ({stream_name}) {line}")
            # Detect registration events in common pjsua output patterns
            lowline = line.lower()
            if "registration complete" in lowline or "registered" in lowline and "status=200" in lowline:
                update_state(True, line)
            elif "registration failed" in lowline or ("status=" in lowline and ("401" in lowline or "403" in lowline or "407" in lowline)):
                update_state(False, line)
            elif "unregistered" in lowline or "registration refresh failed" in lowline:
                update_state(False, line)
            elif "call" in lowline:
                # Generic call event
                update_state(state.get("registered", False), line)

    t_out = threading.Thread(target=reader, args=(proc.stdout, "STDOUT"), daemon=True)
    t_err = threading.Thread(target=reader, args=(proc.stderr, "STDERR"), daemon=True)
    t_out.start()
    t_err.start()
    # Wait for process to exit
    proc.wait()
    print(f"{LOG_PREFIX} pjsua process exited with {proc.returncode}")
    update_state(False, f"pjsua exited ({proc.returncode})")


def start_pjsua_and_monitor():
    args = build_pjsua_args()
    print(f"{LOG_PREFIX} Starting pjsua: {' '.join(args)}")

    # Use pipes for stdout/stderr
    try:
        proc = subprocess.Popen(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except FileNotFoundError:
        print(f"{LOG_PREFIX} pjsua binary not found: {PJSUA_BIN}")
        update_state(False, "pjsua not found")
        return
    except Exception as exc:
        print(f"{LOG_PREFIX} Failed to start pjsua: {exc}")
        update_state(False, f"start failed: {exc}")
        return

    monitor_pjsua_process(proc)


def shutdown(signum, frame):
    print(f"{LOG_PREFIX} Received signal {signum}, shutting down")
    sys.exit(0)


def main():
    # Wire signals
    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)

    # Start HTTP server thread
    http_t = threading.Thread(target=run_http_server, daemon=True)
    http_t.start()

    # Start pjsua monitor (blocking)
    start_pjsua_and_monitor()

    # If pjsua exits, keep HTTP server running for some time to allow inspection
    print(f"{LOG_PREFIX} pjsua exited; keeping HTTP server for 60s")
    time.sleep(60)


if __name__ == '__main__':
    main()

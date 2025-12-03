#!/usr/bin/env python3
"""
keypad_dtmf.py
Scan 4x4 keypad, generate DTMF tones, and broadcast keypresses via HTTP to server.
This runs as a daemon and sends key events to the Node.js server.
"""

import RPi.GPIO as GPIO
import time
import math
import wave
import struct
import subprocess
import os
import requests
import json
from threading import Thread
import logging

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# --- GPIO PIN SETUP ---
ROWS = [5, 6, 13, 12]      # R1, R2, R3, R4
COLS = [16, 20, 26, 25]    # C1, C2, C3, C4

# Key layout (standard 4x4 DTMF mapping)
KEYPAD = [
    ["1", "2", "3", "A"],
    ["4", "5", "6", "B"],
    ["7", "8", "9", "C"],
    ["*", "0", "#", "D"]
]

# DTMF frequency map: (low_freq, high_freq)
DTMF_FREQS = {
    "1": (697, 1209), "2": (697, 1336), "3": (697, 1477), "A": (697, 1633),
    "4": (770, 1209), "5": (770, 1336), "6": (770, 1477), "B": (770, 1633),
    "7": (852, 1209), "8": (852, 1336), "9": (852, 1477), "C": (852, 1633),
    "*": (941, 1209), "0": (941, 1336), "#": (941, 1477), "D": (941, 1633),
}

# WAV / tone parameters
SAMPLE_RATE = 44100
SAMPLE_WIDTH = 2        # bytes (16-bit)
DURATION = 0.20         # tone duration in seconds
AMP = 0.6               # amplitude (0.0 to 1.0)

TMP_DIR = "/tmp/dtmf_wavs"
SERVER_URL = "http://localhost:3000/api/keypad-event"

def generate_dtmf_wav(key, duration=DURATION, rate=SAMPLE_RATE):
    """Generate a mono 16-bit WAV file for a DTMF key."""
    if key not in DTMF_FREQS:
        raise ValueError("Unknown key for DTMF: " + str(key))
    
    low, high = DTMF_FREQS[key]
    n_samples = int(rate * duration)
    max_amp = int((2**15 - 1) * AMP)

    os.makedirs(TMP_DIR, exist_ok=True)
    filepath = os.path.join(TMP_DIR, f"dtmf_{key}.wav")

    with wave.open(filepath, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(SAMPLE_WIDTH)
        wf.setframerate(rate)

        for i in range(n_samples):
            t = i / rate
            # two sine waves summed
            sample = math.sin(2 * math.pi * low * t) + math.sin(2 * math.pi * high * t)
            val = int((sample / 2.0) * max_amp)
            wf.writeframes(struct.pack('<h', val))

    return filepath

def prebuild_wavs():
    """Generate WAVs for all keypad keys."""
    files = {}
    for row in KEYPAD:
        for key in row:
            path = os.path.join(TMP_DIR, f"dtmf_{key}.wav")
            if not os.path.isfile(path):
                logger.info(f"Generating DTMF tone for key '{key}'...")
                generate_dtmf_wav(key)
            files[key] = path
    return files

def play_wav_async(path):
    """Play a WAV file asynchronously using aplay (non-blocking)."""
    try:
        subprocess.Popen(
            ["aplay", "-q", path],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
    except Exception as e:
        logger.error(f"Error launching aplay: {e}")

def send_keypad_event(key):
    """Send keypress event to Node.js server via HTTP."""
    try:
        payload = {"key": key, "timestamp": time.time()}
        requests.post(
            SERVER_URL,
            json=payload,
            timeout=2
        )
    except Exception as e:
        logger.warning(f"Could not send keypad event to server: {e}")

def setup_gpio():
    """Initialize GPIO pins for matrix keypad."""
    GPIO.setmode(GPIO.BCM)
    for r in ROWS:
        GPIO.setup(r, GPIO.OUT)
        GPIO.output(r, GPIO.HIGH)
    for c in COLS:
        GPIO.setup(c, GPIO.IN, pull_up_down=GPIO.PUD_UP)
    logger.info("GPIO setup complete")

def cleanup():
    """Clean up GPIO on exit."""
    GPIO.cleanup()
    logger.info("GPIO cleaned up")

def scan_loop(wav_files):
    """Main scanning loop: detect keypresses and trigger tones + server events."""
    logger.info("DTMF keypad scanner started. Listening for keypresses...")
    last_pressed = None
    debounce_time = 0.05

    try:
        while True:
            for r_idx, r_pin in enumerate(ROWS):
                # Activate this row
                GPIO.output(r_pin, GPIO.LOW)
                
                for c_idx, c_pin in enumerate(COLS):
                    if GPIO.input(c_pin) == GPIO.LOW:
                        key = KEYPAD[r_idx][c_idx]
                        
                        # Debounce: wait and check again
                        time.sleep(debounce_time)
                        if GPIO.input(c_pin) == GPIO.LOW:
                            # Avoid repeating same press instantly
                            if last_pressed != key:
                                logger.info(f"Key pressed: {key}")
                                
                                # Play DTMF tone
                                play_wav_async(wav_files[key])
                                
                                # Notify server
                                send_keypad_event(key)
                                
                                last_pressed = key
                            
                            # Wait for release
                            while GPIO.input(c_pin) == GPIO.LOW:
                                time.sleep(0.01)
                            
                            last_pressed = None
                
                # Deactivate this row
                GPIO.output(r_pin, GPIO.HIGH)
            
            time.sleep(0.01)
    
    except KeyboardInterrupt:
        logger.info("Keyboard interrupt received, exiting...")

if __name__ == "__main__":
    try:
        setup_gpio()
        wav_files = prebuild_wavs()
        scan_loop(wav_files)
    except Exception as e:
        logger.error(f"Error: {e}")
    finally:
        cleanup()

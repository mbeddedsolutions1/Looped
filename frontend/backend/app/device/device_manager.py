"""Simple in-memory device manager stub.

Replace with persistent storage and real device registration logic.
"""

import random

class DeviceManager:
    def __init__(self):
        self._devices = []
        self._next_id = 1
        self._used_codes = set()
        self._initialize_pi_devices()

    def _generate_unique_code(self):
        """Generate a unique 4-digit code (LD0000-LD9999)"""
        while True:
            code = random.randint(0, 9999)
            if code not in self._used_codes:
                self._used_codes.add(code)
                return f"LD{code:04d}"

    def list_devices(self):
        return self._devices

    def add_device(self, device: dict):
        unique_code = self._generate_unique_code()
        device_entry = {
            "id": self._next_id,
            "hostname": unique_code,
            "name": device.get("name", f"Looped {unique_code}"),
            "meta": device.get("meta", {})
        }
        self._next_id += 1
        self._devices.append(device_entry)
        return device_entry

    def get_device(self, device_id: int):
        for d in self._devices:
            if d["id"] == device_id:
                return d
        return None

    def _initialize_pi_devices(self):
        """Initialize with default Pi devices for data collection."""
        pi_devices = [
            {
                "name": "Looped LD1001",
                "meta": {
                    "type": "Raspberry Pi 4",
                    "location": "Main Room",
                    "status": "active"
                }
            },
            {
                "name": "Looped LD1002",
                "meta": {
                    "type": "Raspberry Pi Zero",
                    "location": "Bedroom",
                    "status": "active",
                    "sensors": ["temperature", "humidity"]
                }
            },
            {
                "name": "Looped LD1003",
                "meta": {
                    "type": "Raspberry Pi Zero",
                    "location": "Living Room",
                    "status": "active",
                    "sensors": ["temperature", "motion"]
                }
            },
            {
                "name": "Looped LD1004",
                "meta": {
                    "type": "Raspberry Pi 3B+",
                    "location": "Kitchen",
                    "status": "inactive",
                    "function": "audio_processing"
                }
            }
        ]
        for device in pi_devices:
            self.add_device(device)

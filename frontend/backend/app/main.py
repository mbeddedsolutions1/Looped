from fastapi import FastAPI
import json
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
from app.asterisk.asterisk_client import AsteriskClient
from app.device.device_manager import DeviceManager
from app.contacts.contacts_manager import ContactsManager

app = FastAPI()

# Allow localhost for development and LD-XXXX hostnames
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8000",
    "*"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# simple in-memory managers (replace with real integrations)
device_mgr = DeviceManager()
asterisk = AsteriskClient()
contacts_mgr = ContactsManager()


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/api/devices")
async def list_devices():
    return {"devices": device_mgr.list_devices()}


@app.get("/api/calls")
async def list_calls():
    """Return recent call history from backend/data/recent_calls.json (fixture)."""
    try:
        data_path = Path(__file__).resolve().parents[1] / "data" / "recent_calls.json"
        if data_path.exists():
            with open(data_path, "r", encoding="utf-8") as f:
                calls = json.load(f)
            return {"calls": calls}
        return {"calls": []}
    except Exception as e:
        return {"error": str(e)}


@app.post("/api/devices")
async def add_device(device: dict):
    return device_mgr.add_device(device)


@app.post("/api/asterisk/ping")
async def asterisk_ping():
    # example endpoint to interact with Asterisk client stub
    return {"connected": asterisk.ping()}


# Contacts API Endpoints
@app.get("/api/contacts")
async def list_contacts():
    return {"contacts": contacts_mgr.list_contacts()}


@app.post("/api/contacts")
async def add_contact(contact: dict):
    return contacts_mgr.add_contact(contact)


@app.get("/api/contacts/{contact_id}")
async def get_contact(contact_id: int):
    contact = contacts_mgr.get_contact(contact_id)
    if contact:
        return contact
    return {"error": "Contact not found"}


@app.put("/api/contacts/{contact_id}")
async def update_contact(contact_id: int, updates: dict):
    contact = contacts_mgr.update_contact(contact_id, updates)
    if contact:
        return contact
    return {"error": "Contact not found"}


@app.delete("/api/contacts/{contact_id}")
async def delete_contact(contact_id: int):
    if contacts_mgr.delete_contact(contact_id):
        return {"success": True, "message": "Contact deleted"}
    return {"success": False, "error": "Contact not found"}


@app.get("/api/contacts/hot-dial/{dial_number}")
async def get_hot_dial(dial_number: int):
    contact = contacts_mgr.get_hot_dial(dial_number)
    if contact:
        return contact
    return {"error": "No contact assigned to this hot dial"}


@app.get("/api/hot-dials")
async def list_hot_dials():
    return {"hot_dials": contacts_mgr.list_hot_dials()}

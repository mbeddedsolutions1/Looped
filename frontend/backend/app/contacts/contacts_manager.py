"""Contacts management with hot dial support"""

class ContactsManager:
    def __init__(self):
        self._contacts = []
        self._next_id = 1
        self._hot_dials = {}  # Maps 1-9 to contact_id
        self._initialize_default_contacts()

    def _initialize_default_contacts(self):
        """Initialize with default contacts"""
        default_contacts = [
            {
                "name": "Emergency Services",
                "phone": "911",
                "email": "emergency@local",
                "hot_dial": 1
            },
            {
                "name": "Support Team",
                "phone": "+1-555-0100",
                "email": "support@looped.local",
                "hot_dial": 2
            },
            {
                "name": "Tech Lead",
                "phone": "+1-555-0101",
                "email": "tech@looped.local",
                "hot_dial": None
            }
        ]
        
        for contact in default_contacts:
            self.add_contact(contact)

    def add_contact(self, contact: dict):
        """Add a new contact"""
        contact_entry = {
            "id": self._next_id,
            "name": contact.get("name", f"Contact {self._next_id}"),
            "phone": contact.get("phone", ""),
            "email": contact.get("email", ""),
            "hot_dial": None
        }
        
        # Assign hot dial if provided
        hot_dial = contact.get("hot_dial")
        if hot_dial and 1 <= hot_dial <= 9:
            # Remove old assignment if exists
            old_contact = self._hot_dials.get(hot_dial)
            if old_contact:
                for c in self._contacts:
                    if c["id"] == old_contact:
                        c["hot_dial"] = None
            
            contact_entry["hot_dial"] = hot_dial
            self._hot_dials[hot_dial] = self._next_id
        
        self._next_id += 1
        self._contacts.append(contact_entry)
        return contact_entry

    def list_contacts(self):
        """Get all contacts"""
        return self._contacts

    def get_contact(self, contact_id: int):
        """Get a specific contact"""
        for c in self._contacts:
            if c["id"] == contact_id:
                return c
        return None

    def update_contact(self, contact_id: int, updates: dict):
        """Update a contact"""
        for c in self._contacts:
            if c["id"] == contact_id:
                c.update({k: v for k, v in updates.items() if k in ["name", "phone", "email"]})
                
                # Handle hot dial updates
                if "hot_dial" in updates:
                    hot_dial = updates["hot_dial"]
                    # Remove old assignment
                    if c["hot_dial"]:
                        del self._hot_dials[c["hot_dial"]]
                    
                    # Assign new hot dial
                    if hot_dial and 1 <= hot_dial <= 9:
                        # Remove from other contact
                        old_contact = self._hot_dials.get(hot_dial)
                        if old_contact:
                            for other in self._contacts:
                                if other["id"] == old_contact:
                                    other["hot_dial"] = None
                        
                        c["hot_dial"] = hot_dial
                        self._hot_dials[hot_dial] = contact_id
                    else:
                        c["hot_dial"] = None
                
                return c
        return None

    def delete_contact(self, contact_id: int):
        """Delete a contact"""
        for i, c in enumerate(self._contacts):
            if c["id"] == contact_id:
                if c["hot_dial"]:
                    del self._hot_dials[c["hot_dial"]]
                self._contacts.pop(i)
                return True
        return False

    def get_hot_dial(self, dial_number: int):
        """Get contact for a hot dial number"""
        if 1 <= dial_number <= 9:
            contact_id = self._hot_dials.get(dial_number)
            if contact_id:
                return self.get_contact(contact_id)
        return None

    def list_hot_dials(self):
        """Get all hot dial assignments"""
        result = {}
        for dial_num in range(1, 10):
            contact_id = self._hot_dials.get(dial_num)
            if contact_id:
                result[dial_num] = self.get_contact(contact_id)
        return result

"""Asterisk integration stub.

This module is a placeholder showing where to implement integration with
Asterisk AMI or ARI. For a real integration you can use:
- python-ami (for AMI)
- ari (for ARI)
- pyst2 or starpy libraries

Keep credentials and connection details in environment variables.
"""

class AsteriskClient:
    def __init__(self):
        # TODO: read connection info from env and create AMI/ARI client
        self._connected = False

    def connect(self):
        # Implement real connection logic here
        self._connected = True
        return self._connected

    def ping(self):
        # Simple check method used by the example endpoint
        return self._connected

    def originate_call(self, extension, context='from-internal'):
        # Example stub to originate a call via AMI or ARI
        raise NotImplementedError("Implement originate_call with AMI/ARI client")

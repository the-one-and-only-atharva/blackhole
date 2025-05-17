import hashlib
from datetime import datetime
from db import db

# Hashing function

def hash_property_data(property_data: dict) -> str:
    data_str = str(sorted(property_data.items()))
    return hashlib.sha256(data_str.encode()).hexdigest()

# Audit log function

def log_audit(property_id: str, action: str, changes: dict, user: dict):
    hash_val = hash_property_data(changes)
    log_entry = {
        'property_id': property_id,
        'action': action,
        'hash': hash_val,
        'timestamp': datetime.utcnow(),
        'changes': changes,
        'user': user
    }
    db.audit_logs.insert_one(log_entry)
    return log_entry

# Placeholder for TensorFlow-based fraud detection
def detect_fraud(property_data: dict) -> bool:
    # TODO: Implement with TensorFlow
    # For now, always return False (not fraudulent)
    return False 
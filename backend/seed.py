from db import db
from datetime import datetime
import random
import hashlib

def get_password_hash(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Clean up old data for a fresh start
db.users.delete_many({})
db.properties.delete_many({})
db.audit_logs.delete_many({})

# Dummy users
plain_password = "password123"
dummy_users = [
    {"name": "Alice Smith", "email": "alice@example.com", "password": get_password_hash(plain_password)},
    {"name": "Bob Johnson", "email": "bob@example.com", "password": get_password_hash(plain_password)},
    {"name": "Charlie Lee", "email": "charlie@example.com", "password": get_password_hash(plain_password)}
]

user_ids = []
for user in dummy_users:
    result = db.users.insert_one(user)
    user_with_id = {**user, "id": str(result.inserted_id)}
    user_ids.append(user_with_id)

# Dummy properties
dummy_properties = [
    {
        "owner": user_ids[0],
        "buyer_intent": "sale",
        "location": "New York, NY",
        "verification": "verified",
        "terms": "Full payment upfront",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "owner": user_ids[1],
        "buyer_intent": "rent",
        "location": "San Francisco, CA",
        "verification": "pending",
        "terms": "12-month lease",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "owner": user_ids[2],
        "buyer_intent": "sale",
        "location": "Austin, TX",
        "verification": "verified",
        "terms": "Installments allowed",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
]

property_ids = []
for prop in dummy_properties:
    result = db.properties.insert_one(prop)
    property_ids.append(result.inserted_id)

# Dummy audit logs
for i, prop_id in enumerate(property_ids):
    log = {
        "property_id": str(prop_id),
        "action": "create",
        "hash": "dummyhashvalue" + str(i),
        "timestamp": datetime.utcnow(),
        "changes": dummy_properties[i],
        "user": user_ids[i]
    }
    db.audit_logs.insert_one(log)

print("Dummy data inserted!") 
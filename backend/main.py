from fastapi import FastAPI, HTTPException, Query
from typing import List, Optional
from models import Property, User, AuditLog, PropertyCreate
from db import db
from verification import log_audit, detect_fraud
from bson import ObjectId
from fastapi.middleware.cors import CORSMiddleware
import auth  # Import auth module
from datetime import datetime

app = FastAPI()

# Update CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Helper to convert MongoDB document to dict with string id
def doc_to_dict(doc):
    if doc is None:
        return None
    if isinstance(doc, dict):
        doc = doc.copy()
        if '_id' in doc:
            doc['id'] = str(doc['_id'])
            doc.pop('_id')
        # Convert any nested ObjectIds
        for key, value in doc.items():
            if isinstance(value, dict):
                doc[key] = doc_to_dict(value)
            elif isinstance(value, list):
                doc[key] = [doc_to_dict(item) if isinstance(item, dict) else item for item in value]
    return doc

# Include auth routes
app.include_router(auth.router)

def ensure_owner_id(prop):
    if 'owner' in prop and 'id' not in prop['owner']:
        prop['owner']['id'] = None
    return prop

@app.post('/properties', response_model=Property)
def create_property(property: PropertyCreate):
    prop_dict = property.dict()
    prop_dict['created_at'] = prop_dict['updated_at'] = datetime.utcnow()
    result = db.properties.insert_one(prop_dict)
    prop_dict['id'] = str(result.inserted_id)
    # Ensure owner has an 'id' field for the response model
    if 'owner' in prop_dict and 'id' not in prop_dict['owner']:
        prop_dict['owner']['id'] = None
    log_audit(prop_dict['id'], 'create', prop_dict, prop_dict['owner'])
    return prop_dict

@app.get('/properties', response_model=List[Property])
def list_properties(
    intent: Optional[str] = Query(None),
    location: Optional[str] = Query(None)
):
    query = {}
    if intent:
        query['buyer_intent'] = intent
    if location:
        query['location'] = location
    props = list(db.properties.find(query))
    return [ensure_owner_id(doc_to_dict(p)) for p in props]

@app.get('/properties/{property_id}', response_model=Property)
def get_property(property_id: str):
    try:
        prop = db.properties.find_one({'_id': ObjectId(property_id)})
        if not prop:
            raise HTTPException(status_code=404, detail='Property not found')
        return ensure_owner_id(doc_to_dict(prop))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get('/properties/{property_id}/audit', response_model=List[AuditLog])
def get_audit_log(property_id: str):
    try:
        logs = list(db.audit_logs.find({'property_id': property_id}))
        result = []
        for log in logs:
            log_dict = doc_to_dict(log)
            # Ensure prev_hash is present (for old logs)
            if 'prev_hash' not in log_dict:
                log_dict['prev_hash'] = None
            result.append(log_dict)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put('/properties/{property_id}', response_model=Property)
def update_property(property_id: str, property: Property):
    try:
        prop_dict = property.dict()
        prop_dict['updated_at'] = property.updated_at
        result = db.properties.update_one({'_id': ObjectId(property_id)}, {'$set': prop_dict})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail='Property not found')
        log_audit(property_id, 'update', prop_dict, prop_dict['owner'])
        return get_property(property_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete('/properties/{property_id}')
def delete_property(property_id: str):
    try:
        result = db.properties.delete_one({'_id': ObjectId(property_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail='Property not found')
        log_audit(property_id, 'delete', {}, None)
        return {'status': 'deleted'}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 
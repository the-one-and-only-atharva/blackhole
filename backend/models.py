from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class User(BaseModel):
    id: Optional[str]
    name: str
    email: str

class Property(BaseModel):
    id: Optional[str]
    owner: User
    buyer_intent: str  # e.g., 'rent' or 'sale'
    location: str
    verification: Optional[str]
    terms: str
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class AuditLog(BaseModel):
    id: Optional[str]
    property_id: str
    action: str
    hash: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    changes: dict
    user: Optional[User] 
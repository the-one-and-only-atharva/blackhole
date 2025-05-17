from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: Optional[str]

class PropertyBase(BaseModel):
    owner: UserBase
    buyer_intent: str
    location: str
    verification: Optional[str]
    terms: str

class PropertyCreate(PropertyBase):
    pass

class Property(PropertyBase):
    id: Optional[str]
    owner: User
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class AuditLog(BaseModel):
    id: Optional[str]
    property_id: str
    action: str
    hash: str
    prev_hash: Optional[str]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    changes: dict
    user: Optional[User] 
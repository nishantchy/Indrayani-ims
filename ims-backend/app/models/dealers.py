from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class Address(BaseModel):
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    country: str = "India"

class CloudinaryImage(BaseModel):
    url: str
    public_id: str

class DealerModel(BaseModel):
    id: str = Field(alias="_id")
    dealer_code: str
    company_name: str
    slug: str
    contact_person: Optional[str] = None
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    image: Optional[CloudinaryImage] = None
    gst_number: Optional[str] = None
    status: str = "active"  # active, inactive
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    notes: Optional[str] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True 
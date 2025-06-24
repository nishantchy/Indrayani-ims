from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr
from enum import Enum
from fastapi import UploadFile, File

class DealerStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"

class DealerBase(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=100)
    contact_person: Optional[str] = Field(None, max_length=100)
    phone: str = Field(..., min_length=10, max_length=15, pattern=r'^\+?1?\d{9,15}$')
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    gst_number: Optional[str] = Field(None, max_length=15)
    status: DealerStatus = DealerStatus.ACTIVE
    notes: Optional[str] = None

class DealerCreate(DealerBase):
    pass

class DealerUpdate(BaseModel):
    company_name: Optional[str] = Field(None, min_length=1, max_length=100)
    contact_person: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, min_length=10, max_length=15, pattern=r'^\+?1?\d{9,15}$')
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    gst_number: Optional[str] = Field(None, max_length=15)
    status: Optional[DealerStatus] = None
    notes: Optional[str] = None

class CloudinaryImageResponse(BaseModel):
    url: str
    public_id: str

class DealerResponse(DealerBase):
    id: str = Field(..., alias="_id")
    dealer_code: str
    slug: str
    image: Optional[CloudinaryImageResponse] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True 
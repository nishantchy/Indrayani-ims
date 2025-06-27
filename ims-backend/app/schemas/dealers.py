from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr
from enum import Enum
from fastapi import UploadFile, File

class DealerStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"

class DealerImage(BaseModel):
    image_id: str
    image_url: str

class DealerBase(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=100)
    contact_person: Optional[str] = Field(None, max_length=100)
    phone: str = Field(..., min_length=10, max_length=15, pattern=r'^\+?1?\d{9,15}$')
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    gst_number: Optional[str] = Field(None, max_length=15)
    dealer_status: DealerStatus = DealerStatus.ACTIVE
    notes: Optional[str] = None
    image_id: Optional[str] = None  # Reference to media_center _id (for input)

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
    image_id: Optional[str] = None

class DealerResponse(DealerBase):
    id: str = Field(..., alias="_id")
    dealer_code: str
    slug: str
    created_at: datetime
    updated_at: datetime
    images: List[DealerImage] = []  # Array of images in response

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True 
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class MediaCenterBase(BaseModel):
    filename: str
    image_url: str
    image_public_id: str
    file_type: str
    file_size: int

class MediaCenterCreate(MediaCenterBase):
    pass

class MediaCenterUpdate(BaseModel):
    filename: Optional[str] = None
    image_url: Optional[str] = None
    image_public_id: Optional[str] = None
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    is_active: Optional[bool] = None

class MediaCenterResponse(MediaCenterBase):
    id: str = Field(..., alias="_id")
    usage_count: int
    created_at: Optional[datetime] = None
    is_active: bool

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

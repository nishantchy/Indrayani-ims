from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class MediaCenterModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    filename: str
    image_url: str
    image_public_id: str
    file_type: str
    file_size: int
    usage_count: int = 0
    created_at: Optional[datetime] = None
    is_active: bool = True

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

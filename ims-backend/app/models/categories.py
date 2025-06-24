from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId
from enum import Enum

class CategoryStatus(str, Enum):
    active = "active"
    inactive = "inactive"

class CategoryModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    name: str = Field(..., unique=True)
    slug: Optional[str] = Field(None, unique=True)
    description: Optional[str] = None
    status: CategoryStatus = CategoryStatus.active
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

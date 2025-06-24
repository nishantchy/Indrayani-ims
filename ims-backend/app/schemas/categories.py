from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class CategoryStatus(str, Enum):
    active = "active"
    inactive = "inactive"

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: CategoryStatus = CategoryStatus.active

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[CategoryStatus] = None

class CategoryResponse(CategoryBase):
    id: str = Field(..., alias="_id")
    slug: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

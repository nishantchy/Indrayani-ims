from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum

class ProductStatus(str, Enum):
    IN_STOCK = "in_stock"
    OUT_OF_STOCK = "out_of_stock"
    DISCONTINUED = "discontinued"

class StockUpdate(BaseModel):
    quantity: int = Field(..., ge=0)  # Cannot be negative
    date: datetime = Field(default_factory=datetime.now)
    notes: Optional[str] = None

class ProductModel(BaseModel):
    id: str = Field(alias="_id")
    category_id: str
    product_code: str
    model_number: str  # Unique identifier for restocking
    name: str
    slug: str  # Slug generated from product name
    dealer_id: str
    dealer_price: float = Field(..., ge=0)  # Price in NPR, cannot be negative
    stock: int = Field(..., ge=0)  # Current stock, cannot be negative
    total_stock_received: int = Field(default=0, ge=0)  # Total stock ever received
    status: ProductStatus = ProductStatus.OUT_OF_STOCK
    description: Optional[str] = None
    image_id: Optional[str] = None  # Reference to media_center _id
    stock_updates: List[StockUpdate] = []  # History of all stock updates
    first_added_date: datetime = Field(default_factory=datetime.now)
    last_updated_date: datetime = Field(default_factory=datetime.now)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

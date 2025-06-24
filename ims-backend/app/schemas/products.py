from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, field_validator
from enum import Enum
from bson import ObjectId

class ProductStatus(str, Enum):
    IN_STOCK = "in_stock"
    OUT_OF_STOCK = "out_of_stock"
    DISCONTINUED = "discontinued"

class StockUpdateBase(BaseModel):
    quantity: int = Field(..., ge=0, description="Quantity to add to stock (must be non-negative)")
    notes: Optional[str] = None

class StockUpdateResponse(StockUpdateBase):
    date: datetime

class SaleCreate(BaseModel):
    quantity: int = Field(..., gt=0, description="Quantity sold (must be positive)")
    sale_price: float = Field(..., gt=0, description="Price at which item was sold")
    notes: Optional[str] = None

class SaleResponse(SaleCreate):
    date: datetime

class ProductImage(BaseModel):
    image_id: str
    image_url: str

class ProductBase(BaseModel):
    category_id: str = Field(..., description="Reference to category collection")
    name: str = Field(..., min_length=1, max_length=200)
    model_number: str = Field(..., min_length=1, max_length=50)
    dealer_id: str = Field(..., description="Reference to dealer collection")
    dealer_price: float = Field(..., ge=0, description="Price in NPR (must be non-negative)")
    description: Optional[str] = None
    image_id: Optional[str] = None

    @field_validator('category_id', 'dealer_id', 'image_id')
    @classmethod
    def validate_object_id(cls, v):
        if v is None:
            return v
        if not ObjectId.is_valid(v):
            raise ValueError(f'Invalid ObjectId format: {v}')
        return str(ObjectId(v))

class ProductCreate(ProductBase):
    initial_stock: int = Field(..., ge=0, description="Initial stock quantity (must be non-negative)")
    stock_notes: Optional[str] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    dealer_id: Optional[str] = None
    dealer_price: Optional[float] = Field(None, ge=0)
    description: Optional[str] = None
    image_id: Optional[str] = None
    status: Optional[ProductStatus] = None

    @field_validator('dealer_id', 'image_id')
    @classmethod
    def validate_object_ids(cls, v):
        if v is None:
            return v
        if not ObjectId.is_valid(v):
            raise ValueError(f'Invalid ObjectId format: {v}')
        return str(ObjectId(v))

class StockUpdate(BaseModel):
    quantity: int = Field(..., ge=0, description="Quantity to add to current stock")
    notes: Optional[str] = None

class ProductResponse(ProductBase):
    id: str = Field(..., alias="_id")
    product_code: str
    slug: str
    stock: int
    total_stock_received: int
    total_sales: int
    status: ProductStatus
    stock_updates: List[StockUpdateResponse]
    sales_history: List[SaleResponse]
    images: List[ProductImage] = []

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

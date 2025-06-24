from fastapi import APIRouter, HTTPException, status, Query, Body
from typing import List, Optional
from ..schemas.products import (
    ProductCreate, ProductUpdate, ProductResponse, 
    ProductStatus, StockUpdate
)
from ..models.products import ProductModel
from ..db.mongodb import get_database
from ..db.redis import get_redis
from datetime import datetime
from bson import ObjectId
import json
import logging
from ..core.config import settings
from ..routes.media_center import router as media_center_router
from slugify import slugify

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/products", tags=["products"])

async def invalidate_product_cache(redis_client, model_number: str = None):
    """Invalidate product cache."""
    if model_number:
        await redis_client.delete(f"product:{model_number}")
    await redis_client.delete("products:list")

async def validate_references(db, category_id: str, dealer_id: str):
    """Validate that category and dealer exist."""
    try:
        # First validate ObjectId format
        if not ObjectId.is_valid(category_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid category_id format: {category_id}"
            )
        if not ObjectId.is_valid(dealer_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid dealer_id format: {dealer_id}"
            )

        # Then check if they exist in database
        category = await db.categories.find_one({"_id": ObjectId(category_id)})
        if not category:
            # Try to find if the category exists but in a different collection name
            collections = await db.list_collection_names()
            category_collections = [col for col in collections if col.lower().startswith('categor')]
            if category_collections:
                detail = f"Category not found. Note: Available category collections are: {', '.join(category_collections)}"
            else:
                detail = "Category not found. Note: No category collections found in database."
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=detail
            )
        
        dealer = await db.dealers.find_one({"_id": ObjectId(dealer_id)})
        if not dealer:
            collections = await db.list_collection_names()
            dealer_collections = [col for col in collections if col.lower().startswith('dealer')]
            if dealer_collections:
                detail = f"Dealer not found. Note: Available dealer collections are: {', '.join(dealer_collections)}"
            else:
                detail = "Dealer not found. Note: No dealer collections found in database."
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=detail
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )

async def validate_and_get_media(db, image_id: str):
    """Validate image_id exists and return media details."""
    if not image_id:
        return None
    try:
        if not ObjectId.is_valid(image_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid image_id format: {image_id}"
            )
        media = await db.media_center.find_one({"_id": ObjectId(image_id)})
        if not media:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid image_id: Media not found"
            )
        return media
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid ObjectId format: {str(e)}"
        )

async def enrich_product_with_media(db, product: dict):
    """Add images array to product if image_id exists."""
    if product and product.get("image_id"):
        media = await validate_and_get_media(db, product["image_id"])
        if media:
            product["images"] = [{
                "image_id": str(media["_id"]),
                "image_url": media["image_url"]
            }]
        else:
            product["images"] = []
    else:
        product["images"] = []
    return product

async def enrich_products_with_media(db, products: list):
    """Add images array to multiple products."""
    for product in products:
        await enrich_product_with_media(db, product)
    return products

@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(product: ProductCreate):
    """
    Create a new product with initial stock.
    
    Example request body:
    ```json
    {
        "category_id": "65a12b3c4d5e6f7890123456",
        "name": "Samsung TV",
        "model_number": "SM-TV2024-001",
        "dealer_id": "65a12b3c4d5e6f7890123457",
        "dealer_price": 45000.00,
        "description": "40-inch Smart TV",
        "image_id": "65a12b3c4d5e6f7890123458",
        "initial_stock": 10,
        "stock_notes": "Initial stock from supplier"
    }
    ```
    """
    try:
        db = await get_database()
        
        # Validate references
        await validate_references(db, product.category_id, product.dealer_id)
        
        # Validate image_id if provided
        if product.image_id:
            await validate_and_get_media(db, product.image_id)
        
        # Check if model_number already exists
        existing_product = await db.products.find_one({"model_number": product.model_number})
        if existing_product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product with this model number already exists"
            )

        # Generate product code
        last_product = await db.products.find_one(sort=[("product_code", -1)])
        if last_product:
            last_number = int(last_product["product_code"].split("PRD")[-1])
            new_number = last_number + 1
        else:
            new_number = 1
        product_code = f"PRD{new_number:03d}"
        
        # Generate unique slug from name
        base_slug = slugify(product.name)
        slug = base_slug
        counter = 1
        while await db.products.find_one({"slug": slug}):
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        current_time = datetime.now()
        
        # Create product dict
        product_dict = {
            "category_id": product.category_id,
            "product_code": product_code,
            "model_number": product.model_number,
            "name": product.name,
            "slug": slug,
            "dealer_id": product.dealer_id,
            "dealer_price": product.dealer_price,
            "stock": product.initial_stock,
            "total_stock_received": product.initial_stock,
            "status": ProductStatus.IN_STOCK if product.initial_stock > 0 else ProductStatus.OUT_OF_STOCK,
            "description": product.description,
            "image_id": product.image_id,
            "stock_updates": [{
                "quantity": product.initial_stock,
                "date": current_time,
                "notes": product.stock_notes
            }] if product.initial_stock > 0 else [],
            "first_added_date": current_time,
            "last_updated_date": current_time,
            "created_at": current_time,
            "updated_at": current_time
        }

        result = await db.products.insert_one(product_dict)
        if result.inserted_id:
            product = await db.products.find_one({"_id": result.inserted_id})
            if product:
                product["_id"] = str(product["_id"])
                # Add image data
                await enrich_product_with_media(db, product)
                redis_client = await get_redis()
                await invalidate_product_cache(redis_client)
                return product
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create product"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@router.get("/", response_model=List[ProductResponse])
async def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[ProductStatus] = None,
    category_id: Optional[str] = None,
    dealer_id: Optional[str] = None,
    search: Optional[str] = None,
    model_number: Optional[str] = None,
):
    """
    Get products with optional filters.
    
    Query parameters:
    - skip: Number of records to skip
    - limit: Number of records to return
    - status: Filter by status (in_stock, out_of_stock, discontinued)
    - category_id: Filter by category
    - dealer_id: Filter by dealer
    - search: Search in name, model_number, product_code
    """
    try:
        db = await get_database()
        query = {}
        
        if status:
            query["status"] = status
        if category_id:
            if not ObjectId.is_valid(category_id):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid category_id format"
                )
            query["category_id"] = str(ObjectId(category_id))
        if dealer_id:
            if not ObjectId.is_valid(dealer_id):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid dealer_id format"
                )
            query["dealer_id"] = str(ObjectId(dealer_id))
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"model_number": {"$regex": search, "$options": "i"}},
                {"product_code": {"$regex": search, "$options": "i"}},
                {"slug": {"$regex": search, "$options": "i"}}
            ]
        if model_number:
            query["model_number"] = model_number

        products = await db.products.find(query).skip(skip).limit(limit).to_list(limit)
        
        for product in products:
            product["_id"] = str(product["_id"])
        
        # Add image data to all products
        await enrich_products_with_media(db, products)
        return products
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@router.get("/{slug}", response_model=ProductResponse)
async def get_product(slug: str):
    """Get a product by its slug."""
    try:
        redis_client = await get_redis()
        cache_key = f"product:{slug}"
        
        # Try to get from cache
        try:
            cached_product = await redis_client.get(cache_key)
            if cached_product:
                product = json.loads(cached_product)
                # Add image data to cached product
                db = await get_database()
                await enrich_product_with_media(db, product)
                return product
        except Exception:
            pass
            
        # Get from database
        db = await get_database()
        product = await db.products.find_one({"slug": slug})
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
            
        product["_id"] = str(product["_id"])
        
        # Add image data
        await enrich_product_with_media(db, product)
        
        # Cache the result
        try:
            await redis_client.set(
                cache_key,
                json.dumps(product, default=str),
                ex=settings.REDIS_TTL
            )
        except Exception:
            pass
            
        return product
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@router.put("/{slug}", response_model=ProductResponse)
async def update_product(slug: str, product_update: ProductUpdate):
    """
    Update a product's details by slug (except stock).
    
    Example request body:
    ```json
    {
        "name": "Samsung Smart TV",
        "dealer_id": "685a63e07267459a910a19ae",
        "dealer_price": 48000.00,
        "description": "40-inch Smart TV with HDR",
        "image_id": "685a64a47267459a910a19af",
        "status": "discontinued"
    }
    ```
    Note: This endpoint cannot modify stock. Use POST /{slug}/stock for stock updates.
    """
    try:
        db = await get_database()
        
        # Find existing product
        existing_product = await db.products.find_one({"slug": slug})
        if not existing_product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
            
        # Validate dealer_id if provided
        if product_update.dealer_id:
            dealer = await db.dealers.find_one({"_id": ObjectId(product_update.dealer_id)})
            if not dealer:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid dealer_id: Dealer not found"
                )
                
        # Validate image_id if provided
        if product_update.image_id:
            await validate_and_get_media(db, product_update.image_id)
            
        # Prepare update data
        update_data = product_update.dict(exclude_unset=True)
        if "name" in update_data:
            # Update slug if name changes
            base_slug = slugify(update_data["name"])
            new_slug = base_slug
            counter = 1
            while await db.products.find_one({"slug": new_slug, "_id": {"$ne": existing_product["_id"]}}):
                new_slug = f"{base_slug}-{counter}"
                counter += 1
            update_data["slug"] = new_slug
        if update_data:
            update_data["updated_at"] = datetime.now()
            
            # Update the product
            updated = await db.products.find_one_and_update(
                {"slug": slug},
                {"$set": update_data},
                return_document=True
            )
            
            if updated:
                updated["_id"] = str(updated["_id"])
                # Add image data
                await enrich_product_with_media(db, updated)
                # Invalidate cache
                redis_client = await get_redis()
                await invalidate_product_cache(redis_client, slug)
                if "slug" in update_data:
                    await invalidate_product_cache(redis_client, update_data["slug"])
                return updated
                
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@router.post("/{slug}/stock", response_model=ProductResponse)
async def update_stock(slug: str, stock_update: StockUpdate):
    """
    Add stock to an existing product by slug.
    This endpoint is specifically for adding new stock and maintains a history of all stock updates.
    
    Example request body:
    ```json
    {
        "quantity": 5,
        "notes": "Restocked from supplier batch XYZ"
    }
    ```
    Note: 
    - This only adds to existing stock
    - Updates total_stock_received
    - Maintains history in stock_updates array
    - Automatically updates status (in_stock/out_of_stock)
    """
    try:
        db = await get_database()
        
        # Find existing product
        existing_product = await db.products.find_one({"slug": slug})
        if not existing_product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
            
        current_time = datetime.now()
        new_stock = existing_product["stock"] + stock_update.quantity
        new_total_received = existing_product["total_stock_received"] + stock_update.quantity
        
        # Update product with new stock
        updated = await db.products.find_one_and_update(
            {"slug": slug},
            {
                "$set": {
                    "stock": new_stock,
                    "total_stock_received": new_total_received,
                    "status": ProductStatus.IN_STOCK if new_stock > 0 else ProductStatus.OUT_OF_STOCK,
                    "last_updated_date": current_time,
                    "updated_at": current_time
                },
                "$push": {
                    "stock_updates": {
                        "quantity": stock_update.quantity,
                        "date": current_time,
                        "notes": stock_update.notes
                    }
                }
            },
            return_document=True
        )
        
        if updated:
            updated["_id"] = str(updated["_id"])
            # Add image data
            await enrich_product_with_media(db, updated)
            # Invalidate cache
            redis_client = await get_redis()
            await invalidate_product_cache(redis_client, slug)
            return updated
            
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update stock"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@router.delete("/{slug}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(slug: str):
    """
    Delete a product by its slug.
    Warning: This will permanently delete the product and its stock history.
    """
    try:
        db = await get_database()
        # First get the product to check if it exists and get its image_id
        product = await db.products.find_one({"slug": slug})
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )

        # Check if product has any stock
        if product.get("stock", 0) > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete product with existing stock. Please update status to 'discontinued' instead."
            )

        # Delete the product
        result = await db.products.delete_one({"slug": slug})
        if result.deleted_count:
            # Invalidate cache
            redis_client = await get_redis()
            await invalidate_product_cache(redis_client, slug)
            return
            
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete product"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )

from fastapi import APIRouter, HTTPException, status, Query, Request
from typing import List, Optional
from ..schemas.categories import CategoryCreate, CategoryUpdate, CategoryResponse, CategoryStatus
from ..models.categories import CategoryModel
from ..db.mongodb import get_database
from ..db.redis import get_redis
from datetime import datetime
from bson import ObjectId
import json
from ..core.config import settings
from slugify import slugify

router = APIRouter(prefix="/api/categories", tags=["categories"])

async def invalidate_category_cache(redis_client, slug: str = None):
    if slug:
        await redis_client.delete(f"category:{slug}")
    await redis_client.delete("categories:list")

@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(category: CategoryCreate):
    db = await get_database()
    # Generate slug from name
    base_slug = slugify(category.name)
    slug = base_slug
    counter = 1
    while await db.categories.find_one({"slug": slug}):
        slug = f"{base_slug}-{counter}"
        counter += 1
    category_dict = category.model_dump()
    category_dict["slug"] = slug
    category_dict["created_at"] = datetime.now()
    category_dict["updated_at"] = datetime.now()
    result = await db.categories.insert_one(category_dict)
    if result.inserted_id:
        new_category = await db.categories.find_one({"_id": result.inserted_id})
        if new_category:
            new_category["_id"] = str(new_category["_id"])
            redis_client = await get_redis()
            await invalidate_category_cache(redis_client)
            return new_category
        else:
            raise HTTPException(status_code=500, detail="Category created but not found.")
    raise HTTPException(status_code=400, detail="Failed to create category.")

@router.get("/", response_model=List[CategoryResponse])
async def get_categories(skip: int = Query(0, ge=0), limit: int = Query(10, ge=1, le=100), status_filter: Optional[CategoryStatus] = Query(None, alias="status"), search: Optional[str] = None):
    db = await get_database()
    query = {}
    if status_filter:
        query["status"] = status_filter
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    categories = await db.categories.find(query).skip(skip).limit(limit).to_list(length=limit)
    for cat in categories:
        if cat.get("_id"):
            cat["_id"] = str(cat["_id"])
    return categories

@router.get("/{slug}", response_model=CategoryResponse)
async def get_category(slug: str):
    redis_client = await get_redis()
    cache_key = f"category:{slug}"
    try:
        cached_category = await redis_client.get(cache_key)
        if cached_category:
            category = json.loads(cached_category)
            if category.get("_id"):
                category["_id"] = str(category["_id"])
            return category
    except Exception:
        pass
    db = await get_database()
    category = await db.categories.find_one({"slug": slug})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found.")
    if category.get("_id"):
        category["_id"] = str(category["_id"])
    try:
        await redis_client.set(cache_key, json.dumps(category, default=str), ex=settings.REDIS_TTL)
    except Exception:
        pass
    return category

@router.put("/{slug}", response_model=CategoryResponse)
async def update_category(slug: str, category_update: CategoryUpdate):
    db = await get_database()
    existing_category = await db.categories.find_one({"slug": slug})
    if not existing_category:
        raise HTTPException(status_code=404, detail="Category not found.")
    update_data = {k: v for k, v in category_update.model_dump(exclude_unset=True).items() if v is not None}
    # If name is updated, update slug as well
    if "name" in update_data:
        base_slug = slugify(update_data["name"])
        new_slug = base_slug
        counter = 1
        while await db.categories.find_one({"slug": new_slug, "_id": {"$ne": existing_category["_id"]}}):
            new_slug = f"{base_slug}-{counter}"
            counter += 1
        update_data["slug"] = new_slug
    update_data["updated_at"] = datetime.now()
    updated_category = await db.categories.find_one_and_update(
        {"slug": slug},
        {"$set": update_data},
        return_document=True
    )
    if updated_category and updated_category.get("_id"):
        updated_category["_id"] = str(updated_category["_id"])
    if updated_category:
        redis_client = await get_redis()
        await invalidate_category_cache(redis_client, slug)
        if "slug" in update_data:
            await invalidate_category_cache(redis_client, update_data["slug"])
        return updated_category
    raise HTTPException(status_code=404, detail="Category not found.")

@router.delete("/{slug}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(slug: str):
    db = await get_database()
    result = await db.categories.delete_one({"slug": slug})
    if result.deleted_count:
        redis_client = await get_redis()
        await invalidate_category_cache(redis_client, slug)
        return
    raise HTTPException(status_code=404, detail="Category not found.")

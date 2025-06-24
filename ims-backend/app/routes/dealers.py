from fastapi import APIRouter, HTTPException, status, Query, Request, File, UploadFile, Form, Body
from typing import List, Optional
from ..schemas.dealers import DealerCreate, DealerUpdate, DealerResponse, DealerStatus
from ..models.dealers import DealerModel, CloudinaryImage
from ..db.mongodb import get_database
from ..db.redis import get_redis
from datetime import datetime
from bson import ObjectId
import cloudinary
import cloudinary.uploader
from slugify import slugify
import json
import logging
from ..core.config import settings

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

router = APIRouter(prefix="/api/dealers", tags=["dealers"])

async def upload_to_cloudinary(file: UploadFile) -> CloudinaryImage:
    try:
        # Upload the file to cloudinary
        result = cloudinary.uploader.upload(
            file.file,
            folder="dealers",  # Store in dealers folder
            allowed_formats=["jpg", "png"],
            max_file_size=5 * 1024 * 1024  # 5MB limit
        )
        
        return CloudinaryImage(
            url=result["secure_url"],
            public_id=result["public_id"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to upload image: {str(e)}"
        )

async def delete_from_cloudinary(public_id: str):
    try:
        cloudinary.uploader.destroy(public_id)
    except Exception:
        pass  # Ignore deletion errors

async def invalidate_dealer_cache(redis_client, slug: str = None):
    """Invalidate dealer cache. If slug is provided, only invalidate that dealer's cache."""
    if slug:
        await redis_client.delete(f"dealer:{slug}")
    await redis_client.delete("dealers:list")

@router.post("/", response_model=DealerResponse, status_code=status.HTTP_201_CREATED)
async def create_dealer(
    company_name: str = Form(...),
    contact_person: Optional[str] = Form(None),
    phone: str = Form(...),
    email: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    gst_number: Optional[str] = Form(None),
    dealer_status: Optional[DealerStatus] = Form(DealerStatus.ACTIVE),
    notes: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None)
):
    try:
        db = await get_database()
        last_dealer = await db.dealers.find_one(sort=[("dealer_code", -1)])
        if last_dealer:
            last_number = int(last_dealer["dealer_code"].split("DLR")[-1])
            new_number = last_number + 1
        else:
            new_number = 1
        dealer_code = f"DLR{new_number:03d}"
        base_slug = slugify(company_name)
        slug = base_slug
        counter = 1
        while await db.dealers.find_one({"slug": slug}):
            slug = f"{base_slug}-{counter}"
            counter += 1
        dealer_dict = {
            "company_name": company_name,
            "contact_person": contact_person,
            "phone": phone,
            "email": email,
            "address": address,
            "gst_number": gst_number,
            "status": dealer_status,
            "notes": notes,
            "dealer_code": dealer_code,
            "slug": slug,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        if image and image.filename:
            if image.content_type not in ["image/jpeg", "image/png"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Only JPEG and PNG images are allowed"
                )
            content = await image.read()
            file_size = len(content)
            if file_size > 5 * 1024 * 1024:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="File size exceeds 5MB limit"
                )
            await image.seek(0)
            cloudinary_image = await upload_to_cloudinary(image)
            dealer_dict["image"] = cloudinary_image.model_dump()
        result = await db.dealers.insert_one(dealer_dict)
        if result.inserted_id:
            dealer = await db.dealers.find_one({"_id": result.inserted_id})
            if dealer:
                dealer["_id"] = str(dealer["_id"])
                redis_client = await get_redis()
                await invalidate_dealer_cache(redis_client)
                return dealer
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Dealer was created but could not be retrieved."
                )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create dealer"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@router.get("/", response_model=List[DealerResponse])
async def get_dealers(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),    
    status_filter: Optional[DealerStatus] = Query(None, alias="status"),
    search: Optional[str] = None
):
    db = await get_database()
    query = {}
    if status_filter:
        query["status"] = status_filter
    if search:
        query["$or"] = [
            {"company_name": {"$regex": search, "$options": "i"}},
            {"contact_person": {"$regex": search, "$options": "i"}},
            {"dealer_code": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"slug": {"$regex": search, "$options": "i"}}
        ]
    dealers = await db.dealers.find(query).skip(skip).limit(limit).to_list(limit)
    for dealer in dealers:
        if dealer.get("_id"):
            dealer["_id"] = str(dealer["_id"])
    return dealers

@router.get("/{slug}", response_model=DealerResponse)
async def get_dealer(slug: str):
    redis_client = await get_redis()
    cache_key = f"dealer:{slug}"
    try:
        cached_dealer = await redis_client.get(cache_key)
        if cached_dealer:
            dealer = json.loads(cached_dealer)
            if dealer.get("_id"):
                dealer["_id"] = str(dealer["_id"])
            return dealer
    except Exception as e:
        pass
    db = await get_database()
    dealer = await db.dealers.find_one({"slug": slug})
    if not dealer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dealer not found"
        )
    if dealer.get("_id"):
        dealer["_id"] = str(dealer["_id"])
    try:
        await redis_client.set(
            cache_key,
            json.dumps(dealer, default=str),
            ex=settings.REDIS_TTL
        )
    except Exception as e:
        pass
    return dealer

@router.put("/{slug}", response_model=DealerResponse)
async def update_dealer(
    slug: str,
    company_name: Optional[str] = Form(None),
    contact_person: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    gst_number: Optional[str] = Form(None),
    dealer_status: Optional[DealerStatus] = Form(None),
    notes: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None)
):
    try:
        db = await get_database()
        existing_dealer = await db.dealers.find_one({"slug": slug})
        if not existing_dealer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dealer not found"
            )
        update_data = {}
        if company_name is not None:
            update_data["company_name"] = company_name
        if contact_person is not None:
            update_data["contact_person"] = contact_person
        if phone is not None:
            update_data["phone"] = phone
        if email is not None:
            update_data["email"] = email
        if address is not None:
            update_data["address"] = address
        if gst_number is not None:
            update_data["gst_number"] = gst_number
        if dealer_status is not None:
            update_data["status"] = dealer_status
        if notes is not None:
            update_data["notes"] = notes
        if company_name is not None:
            new_slug = slugify(company_name)
            if new_slug != slug:
                temp_slug = new_slug
                counter = 1
                while await db.dealers.find_one({"slug": temp_slug, "_id": {"$ne": existing_dealer["_id"]}}):
                    temp_slug = f"{new_slug}-{counter}"
                    counter += 1
                update_data["slug"] = temp_slug
        if image and image.filename:
            if image.content_type not in ["image/jpeg", "image/png"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Only JPEG and PNG images are allowed"
                )
            if existing_dealer.get("image", {}).get("public_id"):
                await delete_from_cloudinary(existing_dealer["image"]["public_id"])
            cloudinary_image = await upload_to_cloudinary(image)
            update_data["image"] = cloudinary_image.model_dump()
        update_data["updated_at"] = datetime.now()
        updated_dealer = await db.dealers.find_one_and_update(
            {"slug": slug},
            {"$set": update_data},
            return_document=True
        )
        if updated_dealer and updated_dealer.get("_id"):
            updated_dealer["_id"] = str(updated_dealer["_id"])
        if updated_dealer:
            redis_client = await get_redis()
            await invalidate_dealer_cache(redis_client, slug)
            if "slug" in update_data:
                await invalidate_dealer_cache(redis_client, update_data["slug"])
            return updated_dealer
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dealer not found"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@router.delete("/{slug}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dealer(slug: str):
    db = await get_database()
    
    # Get dealer to access image public_id
    dealer = await db.dealers.find_one({"slug": slug})
    if not dealer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dealer not found"
        )
    
    # Delete image from Cloudinary if exists
    if dealer.get("image", {}).get("public_id"):
        await delete_from_cloudinary(dealer["image"]["public_id"])
    
    # Delete dealer from database
    result = await db.dealers.delete_one({"slug": slug})
    
    if result.deleted_count:
        # Invalidate cache
        redis_client = await get_redis()
        await invalidate_dealer_cache(redis_client, slug)
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dealer not found"
        )
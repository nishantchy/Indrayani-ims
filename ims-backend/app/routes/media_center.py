from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form, Query
from ..schemas.media_center import MediaCenterCreate, MediaCenterResponse, MediaCenterUpdate
from ..models.media_center import MediaCenterModel
from ..db.mongodb import get_database
from ..services.cloudinary_service import upload_image, delete_image, update_image
from datetime import datetime
from bson import ObjectId
from typing import List, Optional

router = APIRouter(prefix="/api/media-center", tags=["media_center"])

@router.post("/", response_model=MediaCenterResponse, status_code=status.HTTP_201_CREATED)
async def create_media(
    filename: str = Form(...),
    image: UploadFile = File(...)
):
    db = await get_database()
    # Upload image and get metadata
    upload_result = await upload_image(image, folder="media_center")
    media_dict = {
        "filename": filename,
        "image_url": upload_result["image_url"],
        "image_public_id": upload_result["image_public_id"],
        "file_type": upload_result["file_type"],
        "file_size": upload_result["file_size"],
        "usage_count": 0,
        "created_at": datetime.now(),
        "is_active": True
    }
    result = await db.media_center.insert_one(media_dict)
    if result.inserted_id:
        new_media = await db.media_center.find_one({"_id": result.inserted_id})
        if new_media:
            new_media["_id"] = str(new_media["_id"])
            return new_media
        else:
            raise HTTPException(status_code=500, detail="Media created but not found.")
    raise HTTPException(status_code=400, detail="Failed to create media.")

@router.get("/", response_model=List[MediaCenterResponse])
async def list_media(skip: int = Query(0, ge=0), limit: int = Query(10, ge=1, le=100)):
    db = await get_database()
    media_list = await db.media_center.find().skip(skip).limit(limit).to_list(length=limit)
    for media in media_list:
        if media.get("_id"):
            media["_id"] = str(media["_id"])
    return media_list

@router.get("/{id}", response_model=MediaCenterResponse)
async def get_media(id: str):
    db = await get_database()
    try:
        obj_id = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid media id.")
    media = await db.media_center.find_one({"_id": obj_id})
    if not media:
        raise HTTPException(status_code=404, detail="Media not found.")
    if media.get("_id"):
        media["_id"] = str(media["_id"])
    return media

@router.put("/{id}", response_model=MediaCenterResponse)
async def update_media(
    id: str,
    filename: Optional[str] = Form(None),
    is_active: Optional[bool] = Form(None),
    image: Optional[UploadFile] = File(None)
):
    db = await get_database()
    try:
        obj_id = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid media id.")
    media = await db.media_center.find_one({"_id": obj_id})
    if not media:
        raise HTTPException(status_code=404, detail="Media not found.")
    update_data = {}
    if filename is not None:
        update_data["filename"] = filename
    if is_active is not None:
        update_data["is_active"] = is_active
    if image is not None:
        # Upload new image, delete old one
        upload_result = await update_image(image, media["image_public_id"], folder="media_center")
        update_data.update({
            "image_url": upload_result["image_url"],
            "image_public_id": upload_result["image_public_id"],
            "file_type": upload_result["file_type"],
            "file_size": upload_result["file_size"]
        })
    if not update_data:
        raise HTTPException(status_code=400, detail="No update fields provided.")
    updated = await db.media_center.find_one_and_update(
        {"_id": obj_id},
        {"$set": update_data},
        return_document=True
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Media not found.")
    updated["_id"] = str(updated["_id"])
    return updated

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_media(id: str):
    db = await get_database()
    try:
        obj_id = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid media id.")
    media = await db.media_center.find_one({"_id": obj_id})
    if not media:
        raise HTTPException(status_code=404, detail="Media not found.")

    # Prevent deletion if referenced by any product or dealer
    # Check products
    product_using = await db.products.find_one({"image_id": str(obj_id)})
    # Check dealers
    dealer_using = await db.dealers.find_one({"image_id": str(obj_id)})
    if product_using or dealer_using:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete media: it is used by a product or dealer. Remove the reference before deleting."
        )

    # Delete from Cloudinary
    try:
        await delete_image(media["image_public_id"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete image from Cloudinary: {str(e)}")
    # Delete from database
    await db.media_center.delete_one({"_id": obj_id})
    return

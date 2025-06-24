import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, HTTPException, status
from ..core.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

def get_file_type(filename: str) -> str:
    if filename.lower().endswith('.jpg') or filename.lower().endswith('.jpeg'):
        return 'image/jpeg'
    elif filename.lower().endswith('.png'):
        return 'image/png'
    return 'application/octet-stream'

async def upload_image(file: UploadFile, folder: str = "media_center") -> dict:
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPEG and PNG images are allowed"
        )
    content = await file.read()
    file_size = len(content)
    if file_size > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds 5MB limit"
        )
    await file.seek(0)
    try:
        result = cloudinary.uploader.upload(
            file.file,
            folder=folder,
            allowed_formats=["jpg", "png"],
            max_file_size=5 * 1024 * 1024
        )
        return {
            "image_url": result["secure_url"],
            "image_public_id": result["public_id"],
            "file_type": file.content_type,
            "file_size": file_size
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to upload image: {str(e)}"
        )

async def delete_image(public_id: str):
    try:
        result = cloudinary.uploader.destroy(public_id)
        if result.get("result") != "ok":
            raise Exception(result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete image from Cloudinary: {str(e)}"
        )

async def update_image(new_file: UploadFile, old_public_id: str, folder: str = "media_center") -> dict:
    # Upload new image
    upload_result = await upload_image(new_file, folder)
    # Delete old image
    try:
        await delete_image(old_public_id)
    except Exception:
        pass  # Ignore errors in deleting old image
    return upload_result 
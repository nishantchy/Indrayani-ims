from motor.motor_asyncio import AsyncIOMotorClient
from ..core.config import settings

class MongoDB:
    client: AsyncIOMotorClient = None
    
async def get_database() -> AsyncIOMotorClient:
    """Return database instance"""
    return MongoDB.client["inventory_db"]

async def connect_to_mongo():
    """Create database connection."""
    MongoDB.client = AsyncIOMotorClient(settings.MONGODB_URL)
    print("Connected to MongoDB!")

async def close_mongo_connection():
    """Close database connection."""
    if MongoDB.client:
        MongoDB.client.close()
        print("MongoDB connection closed!")

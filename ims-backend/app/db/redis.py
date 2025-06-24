import redis.asyncio as redis
from ..core.config import settings

class RedisClient:
    client: redis.Redis = None

async def connect_to_redis():
    """Create Redis connection."""
    RedisClient.client = redis.from_url(
        settings.REDIS_URL,
        encoding="utf-8",
        decode_responses=True
    )
    print("Connected to Redis!")

async def close_redis_connection():
    """Close Redis connection."""
    if RedisClient.client:
        await RedisClient.client.close()
        print("Redis connection closed!")

async def get_redis() -> redis.Redis:
    """Return Redis client instance"""
    return RedisClient.client

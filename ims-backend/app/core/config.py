from pydantic_settings import BaseSettings
from pydantic import Field, field_validator
from dotenv import load_dotenv
import os
from typing import Optional

load_dotenv()

class Settings(BaseSettings):
    # Database URLs
    MONGODB_URL: str
    REDIS_URL: str
    
    # Redis Config
    REDIS_TTL: int = Field(default=3600, description="Cache TTL in seconds")
    
    # Cloudinary
    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    CLOUDINARY_API_KEY: Optional[str] = None
    CLOUDINARY_API_SECRET: Optional[str] = None
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 100
    
    # App Settings
    APP_NAME: str = "Inventory Management System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    @field_validator('REDIS_TTL', mode='before')
    @classmethod
    def parse_redis_ttl(cls, v):
        """Parse REDIS_TTL and remove any inline comments"""
        if isinstance(v, str):
            # Remove inline comments (everything after #)
            v = v.split('#')[0].strip()
            try:
                return int(v)
            except ValueError:
                raise ValueError(f"REDIS_TTL must be a valid integer, got: {v}")
        return v
    
    @field_validator('DEBUG', mode='before')
    @classmethod
    def parse_debug(cls, v):
        """Parse DEBUG boolean values"""
        if isinstance(v, str):
            return v.lower() in ('true', '1', 'yes', 'on')
        return v

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
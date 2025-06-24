from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
import logging

from .db.mongodb import connect_to_mongo, close_mongo_connection
from .db.redis import connect_to_redis, close_redis_connection
from .core.config import settings
from .routes import dealers, categories

# WARNING
logging.basicConfig(level=logging.WARNING)
logging.getLogger("pymongo").setLevel(logging.WARNING)
logging.getLogger("urllib3").setLevel(logging.WARNING)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    await connect_to_redis()
    yield
    await close_mongo_connection()
    await close_redis_connection()

app = FastAPI(
    title="Inventory Management System",
    description="Backend API for Inventory Management System",
    version="1.0.0",
    lifespan=lifespan
)

# Setup rate limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(dealers.router)
app.include_router(categories.router)

@app.get("/")
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def root(request: Request):
    return {"message": "Welcome to Inventory Management System API"}

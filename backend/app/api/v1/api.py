from fastapi import APIRouter
from app.api.v1.endpoints import scraper, public_api, health, stats, auth, users

api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(scraper.router, prefix="/scraper", tags=["scraper"])
api_router.include_router(public_api.router, prefix="/endpoints", tags=["endpoints"])
api_router.include_router(stats.router, prefix="/stats", tags=["stats"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])


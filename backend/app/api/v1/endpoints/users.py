"""
Users endpoint: profile management, credits, and admin operations.
"""
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from app.api import deps
from app.models.user import User
from app.models.endpoint import Endpoint

router = APIRouter()


class UserProfile(BaseModel):
    id: str
    username: str
    email: str | None
    avatar_url: str | None
    name: str | None
    credits: float
    total_requests: int
    is_admin: bool
    created_at: str
    endpoint_count: int


class EndpointUsage(BaseModel):
    id: str
    endpoint_slug: str
    request_count: int
    credits_used: float
    created_at: str


class AddCreditsRequest(BaseModel):
    user_id: str
    amount: float


@router.get("/me", response_model=UserProfile)
async def get_my_profile(
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """Get current user profile with stats."""
    # Count user's endpoints
    result = await db.execute(
        select(func.count(Endpoint.id)).where(Endpoint.user_id == current_user.id)
    )
    endpoint_count = result.scalar() or 0

    return UserProfile(
        id=str(current_user.id),
        username=current_user.username,
        email=current_user.email,
        avatar_url=current_user.avatar_url,
        name=current_user.name,
        credits=current_user.credits,
        total_requests=current_user.total_requests,
        is_admin=current_user.is_admin,
        created_at=current_user.created_at.isoformat(),
        endpoint_count=endpoint_count,
    )


@router.get("/me/endpoints", response_model=List[EndpointUsage])
async def get_my_endpoints(
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """Get all endpoints created by current user with usage stats."""
    result = await db.execute(
        select(Endpoint)
        .where(Endpoint.user_id == current_user.id)
        .order_by(Endpoint.created_at.desc())
    )
    endpoints = result.scalars().all()

    return [
        EndpointUsage(
            id=str(ep.id),
            endpoint_slug=ep.endpoint_slug,
            request_count=ep.request_count,
            credits_used=ep.credits_used,
            created_at=ep.created_at.isoformat(),
        )
        for ep in endpoints
    ]


@router.get("/admin/all", response_model=List[UserProfile])
async def get_all_users(
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """Get all users (admin only)."""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()

    user_profiles = []
    for user in users:
        # Count endpoints for each user
        ep_result = await db.execute(
            select(func.count(Endpoint.id)).where(Endpoint.user_id == user.id)
        )
        endpoint_count = ep_result.scalar() or 0

        user_profiles.append(
            UserProfile(
                id=str(user.id),
                username=user.username,
                email=user.email,
                avatar_url=user.avatar_url,
                name=user.name,
                credits=user.credits,
                total_requests=user.total_requests,
                is_admin=user.is_admin,
                created_at=user.created_at.isoformat(),
                endpoint_count=endpoint_count,
            )
        )

    return user_profiles


@router.post("/admin/add-credits")
async def add_credits_to_user(
    request: AddCreditsRequest,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """Add credits to a user (admin only)."""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    # Get target user
    from uuid import UUID
    result = await db.execute(select(User).where(User.id == UUID(request.user_id)))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Add credits
    user.credits += request.amount
    await db.commit()
    await db.refresh(user)

    return {
        "success": True,
        "user_id": str(user.id),
        "username": user.username,
        "new_balance": user.credits,
        "added": request.amount,
    }

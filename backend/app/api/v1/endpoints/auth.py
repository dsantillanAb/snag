"""
Auth endpoint: handles GitHub OAuth user upsert.
Called by NextAuth.js after a successful GitHub login.
"""
from typing import Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.api import deps
from app.models.user import User

router = APIRouter()


class GithubUserIn(BaseModel):
    github_id: str
    username: str
    email: str | None = None
    avatar_url: str | None = None
    name: str | None = None


@router.post("/github", response_model=Any)
async def upsert_github_user(
    user_in: GithubUserIn,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Called by NextAuth after a successful GitHub login.
    Creates a new user or updates the existing one.
    """
    result = await db.execute(select(User).where(User.github_id == user_in.github_id))
    user = result.scalar_one_or_none()

    if user:
        # Update existing user
        user.username = user_in.username
        user.email = user_in.email
        user.avatar_url = user_in.avatar_url
        user.name = user_in.name
        user.last_login = datetime.utcnow()
    else:
        # Create new user with initial credits
        is_admin = user_in.username == "dsantillanAb"
        user = User(
            github_id=user_in.github_id,
            username=user_in.username,
            email=user_in.email,
            avatar_url=user_in.avatar_url,
            name=user_in.name,
            credits=30.0,  # 30 USD iniciales
            is_admin=is_admin,
        )
        db.add(user)

    await db.commit()
    await db.refresh(user)

    from app.core.security import create_access_token
    access_token = create_access_token(subject=user.id)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "github_id": user.github_id,
            "username": user.username,
            "email": user.email,
            "avatar_url": user.avatar_url,
            "name": user.name,
            "is_admin": user.is_admin,
            "credits": user.credits,
            "total_requests": user.total_requests,
            "created_at": user.created_at.isoformat(),
            "last_login": user.last_login.isoformat() if user.last_login else None,
        }
    }


@router.get("/users", response_model=Any)
async def list_users(
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """List all registered users (for admin stats)."""
    result = await db.execute(select(User).order_by(User.last_login.desc()))
    users = result.scalars().all()
    return [
        {
            "id": str(u.id),
            "username": u.username,
            "name": u.name,
            "avatar_url": u.avatar_url,
            "is_admin": u.is_admin,
            "created_at": u.created_at.isoformat(),
            "last_login": u.last_login.isoformat() if u.last_login else None,
        }
        for u in users
    ]

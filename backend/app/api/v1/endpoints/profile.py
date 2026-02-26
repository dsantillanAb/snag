"""
Profile endpoint: gestión de perfil de usuario y créditos
"""
from typing import Any, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.api import deps
from app.models.user import User
from app.models.endpoint import Endpoint

router = APIRouter()


class UserProfileResponse(BaseModel):
    id: str
    username: str
    email: str | None
    avatar_url: str | None
    name: str | None
    is_admin: bool
    credits: float
    max_endpoints: int
    total_requests: int
    created_at: str
    last_login: str | None


class EndpointUsageResponse(BaseModel):
    id: str
    endpoint_slug: str
    request_count: int
    credits_used: float
    created_at: str


class AddCreditsRequest(BaseModel):
    user_id: str
    amount: float


@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Obtener perfil del usuario actual"""
    return UserProfileResponse(
        id=str(current_user.id),
        username=current_user.username,
        email=current_user.email,
        avatar_url=current_user.avatar_url,
        name=current_user.name,
        is_admin=current_user.is_admin,
        credits=current_user.credits,
        max_endpoints=current_user.max_endpoints,
        total_requests=current_user.total_requests,
        created_at=current_user.created_at.isoformat(),
        last_login=current_user.last_login.isoformat() if current_user.last_login else None,
    )


@router.get("/me/endpoints", response_model=List[EndpointUsageResponse])
async def get_my_endpoints(
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """Obtener todos los endpoints del usuario con su uso"""
    result = await db.execute(
        select(Endpoint)
        .where(Endpoint.user_id == current_user.id)
        .order_by(Endpoint.created_at.desc())
    )
    endpoints = result.scalars().all()
    
    return [
        EndpointUsageResponse(
            id=str(e.id),
            endpoint_slug=e.endpoint_slug,
            request_count=e.request_count,
            credits_used=e.credits_used,
            created_at=e.created_at.isoformat(),
        )
        for e in endpoints
    ]


@router.get("/admin/users", response_model=List[UserProfileResponse])
async def list_all_users(
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """Listar todos los usuarios (solo admin)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="No tienes permisos de administrador")
    
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    
    return [
        UserProfileResponse(
            id=str(u.id),
            username=u.username,
            email=u.email,
            avatar_url=u.avatar_url,
            name=u.name,
            is_admin=u.is_admin,
            credits=u.credits,
            max_endpoints=u.max_endpoints,
            total_requests=u.total_requests,
            created_at=u.created_at.isoformat(),
            last_login=u.last_login.isoformat() if u.last_login else None,
        )
        for u in users
    ]


@router.post("/admin/add-credits")
async def add_credits_to_user(
    request: AddCreditsRequest,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """Agregar créditos a un usuario (solo admin)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="No tienes permisos de administrador")
    
    result = await db.execute(select(User).where(User.id == UUID(request.user_id)))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    user.credits += request.amount
    await db.commit()
    await db.refresh(user)
    
    return {
        "success": True,
        "user_id": str(user.id),
        "username": user.username,
        "new_credits": user.credits,
        "added_amount": request.amount,
    }

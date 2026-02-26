import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.endpoint import Endpoint
from app.models.user import User
from app.schemas.endpoint import EndpointCreate
from fastapi import HTTPException

# Costo por request (en USD)
COST_PER_REQUEST = 0.03  # $0.03 por request
MAX_REQUESTS_PER_ENDPOINT = 1000

class EndpointService:
    async def create_endpoint(self, db: AsyncSession, endpoint_in: EndpointCreate, user_id: uuid.UUID):
        # Verificar que el usuario existe
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        # Verificar límite de endpoints
        result = await db.execute(
            select(Endpoint).where(Endpoint.user_id == user_id)
        )
        user_endpoints = result.scalars().all()
        
        if len(user_endpoints) >= user.max_endpoints:
            raise HTTPException(
                status_code=403, 
                detail=f"Has alcanzado el límite de {user.max_endpoints} endpoints"
            )
        
        # Verificar que el usuario tenga créditos suficientes
        if user.credits <= 0:
            raise HTTPException(
                status_code=403,
                detail="No tienes créditos suficientes para crear un endpoint"
            )
        
        db_obj = Endpoint(
            id=uuid.uuid4(),
            scraper_id=endpoint_in.scraper_id,
            user_id=user_id,
            endpoint_slug=endpoint_in.endpoint_slug,
            api_key=endpoint_in.api_key,
            rate_limit=endpoint_in.rate_limit,
            cache_enabled=endpoint_in.cache_enabled,
            cache_ttl=endpoint_in.cache_ttl,
            request_count=0,
            credits_used=0.0
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    
    async def increment_request_count(self, db: AsyncSession, endpoint_id: uuid.UUID):
        """Incrementa el contador de requests y descuenta créditos"""
        result = await db.execute(
            select(Endpoint).where(Endpoint.id == endpoint_id)
        )
        endpoint = result.scalar_one_or_none()
        
        if not endpoint:
            raise HTTPException(status_code=404, detail="Endpoint no encontrado")
        
        # Verificar límite de requests
        if endpoint.request_count >= MAX_REQUESTS_PER_ENDPOINT:
            raise HTTPException(
                status_code=403,
                detail="Has agotado el límite de requests para este endpoint (1000 requests)"
            )
        
        # Obtener usuario
        result = await db.execute(select(User).where(User.id == endpoint.user_id))
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        # Verificar créditos
        if user.credits < COST_PER_REQUEST:
            raise HTTPException(
                status_code=403,
                detail="Has agotado tus créditos. Contacta al administrador para recargar."
            )
        
        # Incrementar contador y descontar créditos
        endpoint.request_count += 1
        endpoint.credits_used += COST_PER_REQUEST
        user.credits -= COST_PER_REQUEST
        user.total_requests += 1
        
        await db.commit()
        await db.refresh(endpoint)
        await db.refresh(user)
        
        return {
            "request_count": endpoint.request_count,
            "credits_used": endpoint.credits_used,
            "user_credits_remaining": user.credits
        }

endpoint_service = EndpointService()

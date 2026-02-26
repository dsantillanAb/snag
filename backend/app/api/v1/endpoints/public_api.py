from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.api import deps
from app.models.endpoint import Endpoint
from app.models.scraper import Scraper
from app.services.scraper_service import scraper_service

router = APIRouter()

@router.get("", response_model=Any)
@router.get("/", response_model=Any)
async def list_endpoints(
    db: AsyncSession = Depends(deps.get_db),
    current_user: deps.User = Depends(deps.get_current_user)
) -> Any:
    # Join with Scraper to get metadata, filter by user_id
    result = await db.execute(
        select(Endpoint, Scraper.name, Scraper.url)
        .join(Scraper, Endpoint.scraper_id == Scraper.id)
        .where(Endpoint.user_id == current_user.id)
    )
    
    rows = result.all()
    endpoints_data = []
    for row in rows:
        endpoint, name, url = row
        endpoints_data.append({
            "id": str(endpoint.id),
            "endpoint_slug": endpoint.endpoint_slug,
            "scraper_name": name,
            "url": url,
            "status": "active",
            "request_count": endpoint.request_count,
            "credits_used": endpoint.credits_used,
        })
    return endpoints_data

@router.get("/scrape/{slug}")
async def public_scrape(
    slug: str,
    limit: int = 10,
    fetch_full_content: bool = False,
    wait_time: int = 2000,
    db: AsyncSession = Depends(deps.get_db)
) -> Any:
    # Find endpoint by slug
    result = await db.execute(select(Endpoint).where(Endpoint.endpoint_slug == slug))
    endpoint = result.scalar_one_or_none()
    
    if not endpoint:
        raise HTTPException(status_code=404, detail="Endpoint not found")
    
    # Get associated scraper and user
    result = await db.execute(select(Scraper).where(Scraper.id == endpoint.scraper_id))
    scraper = result.scalar_one_or_none()
    
    if not scraper:
        raise HTTPException(status_code=404, detail="Scraper not found for this endpoint")
    
    # Get user to check credits
    from app.models.user import User
    result = await db.execute(select(User).where(User.id == endpoint.user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Validar límite de 1000 requests
    if endpoint.request_count >= 1000:
        raise HTTPException(
            status_code=402,
            detail="Has agotado el límite de 1000 requests para este endpoint. Contacta al administrador para más créditos."
        )
    
    # Validar créditos del usuario
    if user.credits < 0.01:
        raise HTTPException(
            status_code=402,
            detail="Créditos insuficientes. Has agotado tu saldo."
        )
    
    # Execute scraping
    try:
        # Preparar configuración de autenticación si existe
        auth_config = None
        if scraper.auth_required and scraper.auth_username and scraper.auth_password:
            login_selectors = scraper.login_selectors or {}
            auth_config = {
                'required': True,
                'username': scraper.auth_username,
                'password': scraper.auth_password,
                'login_url': scraper.login_url,
                'login_selectors': {
                    'username_field': login_selectors.get('username_field', 'input[name="username"]'),
                    'password_field': login_selectors.get('password_field', 'input[name="password"]'),
                    'submit_button': login_selectors.get('submit_button')
                }
            }
        
        # Use query params if provided, else use database defaults
        data = await scraper_service.scrape_data(
            scraper.url, 
            scraper.selector_config, 
            limit=limit if limit != 10 else scraper.limit_articles,
            fetch_full_content=fetch_full_content if fetch_full_content is not False else scraper.fetch_full_content,
            wait_time=wait_time if wait_time != 2000 else scraper.wait_time,
            auth_config=auth_config
        )
        
        # Calcular costo: $0.03 por request (30 USD / 1000 requests)
        cost_per_request = 0.03
        
        # Descontar créditos del usuario
        user.credits -= cost_per_request
        user.total_requests += 1
        
        # Actualizar contador del endpoint
        endpoint.request_count += 1
        endpoint.credits_used += cost_per_request
        
        await db.commit()
        
        import datetime
        return {
            "endpoint": slug,
            "url": scraper.url,
            "data": data,
            "params": {
                "limit": limit,
                "fetch_full_content": fetch_full_content,
                "wait_time": wait_time
            },
            "usage": {
                "request_count": endpoint.request_count,
                "remaining_requests": 1000 - endpoint.request_count,
                "credits_remaining": round(user.credits, 2),
                "cost": cost_per_request
            },
            "timestamp": datetime.datetime.now().isoformat()
        }
    except Exception as e:
        import traceback
        print(f"ERROR SCRAPING: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Scraping failed: {str(e)}")

@router.get("/info/{slug}")
async def get_endpoint_info(
    slug: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user: deps.User = Depends(deps.get_current_user)
) -> Any:
    # 1. Fetch Endpoint, filter by user
    result = await db.execute(
        select(Endpoint).where(Endpoint.endpoint_slug == slug, Endpoint.user_id == current_user.id)
    )
    endpoint = result.scalar_one_or_none()
    
    if not endpoint:
        raise HTTPException(status_code=404, detail=f"Endpoint '{slug}' not found")
    
    # 2. Fetch Scraper
    result = await db.execute(select(Scraper).where(Scraper.id == endpoint.scraper_id))
    scraper = result.scalar_one_or_none()
    
    if not scraper:
        raise HTTPException(status_code=404, detail="Scraper not found")
        
    return {
        "id": str(endpoint.id),
        "endpoint_slug": endpoint.endpoint_slug,
        "scraper_name": scraper.name,
        "url": scraper.url,
        "selector_config": scraper.selector_config,
        "status": "active",
        "request_count": endpoint.request_count,
        "credits_used": endpoint.credits_used,
    }

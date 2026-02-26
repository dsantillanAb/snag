from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app.services.scraper_service import scraper_service
from app.schemas.scraper import ScraperCreate, ScraperUpdate, ScraperResponse, ScraperAnalyze

router = APIRouter()

@router.post("/analyze", response_model=Any)
@router.post("/analyze/", response_model=Any)
async def analyze_url(scraper_in: ScraperAnalyze) -> Any:
    """
    Analiza una URL y sugiere selectores CSS basados en el tipo de contenido detectado.
    Retorna: page_type, confidence, detected_patterns, y suggestions
    """
    try:
        result = await scraper_service.analyze_and_suggest(scraper_in.url)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", response_model=ScraperResponse)
@router.post("/", response_model=ScraperResponse)
async def create_scraper(
    *,
    db: AsyncSession = Depends(deps.get_db),
    scraper_in: ScraperCreate,
    current_user: deps.User = Depends(deps.get_current_user)
) -> Any:
    from app.models.scraper import Scraper
    from app.models.endpoint import Endpoint
    from sqlalchemy import select, func
    import uuid
    import random
    import string
    
    # Validar límite de 3 endpoints por usuario (excepto admins)
    if not current_user.is_admin:
        result = await db.execute(
            select(func.count(Endpoint.id)).where(Endpoint.user_id == current_user.id)
        )
        endpoint_count = result.scalar() or 0
        
        if endpoint_count >= 3:
            raise HTTPException(
                status_code=403, 
                detail="Has alcanzado el límite de 3 endpoints. Elimina uno para crear otro."
            )
    
    # Validar que tenga créditos suficientes (al menos $0.01 para crear) - excepto admins
    if not current_user.is_admin and current_user.credits < 0.01:
        raise HTTPException(
            status_code=402,
            detail="Créditos insuficientes. Necesitas al menos $0.01 para crear un endpoint."
        )
    
    # 1. Crear el Scraper
    db_scraper = Scraper(
        id=uuid.uuid4(),
        user_id=current_user.id,
        name=scraper_in.name,
        url=str(scraper_in.url),
        page_type=scraper_in.page_type,  # Guardar el tipo de página detectado
        selector_config=scraper_in.selector_config,
        limit_articles=scraper_in.limit_articles,
        fetch_full_content=scraper_in.fetch_full_content,
        wait_time=scraper_in.wait_time,
        schedule=scraper_in.schedule,
        status="active",
        # Authentication fields
        auth_required=scraper_in.auth_required,
        auth_username=scraper_in.auth_username,
        auth_password=scraper_in.auth_password,
        auth_type=scraper_in.auth_type,
        login_url=scraper_in.login_url,
        login_selectors=scraper_in.login_selectors
    )
    db.add(db_scraper)
    
    # 2. Crear el Endpoint automáticamente
    # Generar un slug aleatorio si no se provee uno (basado en el nombre)
    slug = scraper_in.name.lower().replace(" ", "-") + "-" + "".join(random.choices(string.ascii_lowercase + string.digits, k=4))
    
    db_endpoint = Endpoint(
        id=uuid.uuid4(),
        scraper_id=db_scraper.id,
        user_id=current_user.id,
        endpoint_slug=slug,
        api_key=None, # Public por ahora (pero solo el dueño puede ver datos si queremos)
        rate_limit=60,
        cache_enabled=True,
        cache_ttl=3600
    )
    db.add(db_endpoint)
    
    await db.commit()
    await db.refresh(db_scraper)
    return db_scraper

@router.get("/{id}", response_model=ScraperResponse)
async def get_scraper(
    id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user: deps.User = Depends(deps.get_current_user)
) -> Any:
    from app.models.scraper import Scraper
    from sqlalchemy import select
    
    result = await db.execute(
        select(Scraper).where(Scraper.id == id, Scraper.user_id == current_user.id)
    )
    scraper = result.scalar_one_or_none()
    if not scraper:
        raise HTTPException(status_code=404, detail="Scraper not found")
    return scraper

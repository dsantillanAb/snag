import sys
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.core.config import settings
from app.db.base import Base, engine
from app.models.scraper import Scraper
from app.models.endpoint import Endpoint
from app.models.user import User  # noqa: F401 - ensures table is created

# Fix for Playwright on Windows: explicitly set ProactorEventLoopPolicy
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            
            # MIGRATION FIX: Add missing columns
            from sqlalchemy import text
            
            # Endpoints and scrapers
            await conn.execute(text("ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id)"))
            await conn.execute(text("ALTER TABLE scrapers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id)"))
            await conn.execute(text("ALTER TABLE scrapers ADD COLUMN IF NOT EXISTS limit_articles INTEGER DEFAULT 10"))
            await conn.execute(text("ALTER TABLE scrapers ADD COLUMN IF NOT EXISTS fetch_full_content BOOLEAN DEFAULT FALSE"))
            await conn.execute(text("ALTER TABLE scrapers ADD COLUMN IF NOT EXISTS wait_time INTEGER DEFAULT 2000"))
            await conn.execute(text("ALTER TABLE scrapers ADD COLUMN IF NOT EXISTS page_type VARCHAR"))
            
            # Authentication fields for scrapers
            await conn.execute(text("ALTER TABLE scrapers ADD COLUMN IF NOT EXISTS auth_required BOOLEAN DEFAULT FALSE"))
            await conn.execute(text("ALTER TABLE scrapers ADD COLUMN IF NOT EXISTS auth_username VARCHAR"))
            await conn.execute(text("ALTER TABLE scrapers ADD COLUMN IF NOT EXISTS auth_password VARCHAR"))
            await conn.execute(text("ALTER TABLE scrapers ADD COLUMN IF NOT EXISTS auth_type VARCHAR"))
            await conn.execute(text("ALTER TABLE scrapers ADD COLUMN IF NOT EXISTS login_url VARCHAR"))
            await conn.execute(text("ALTER TABLE scrapers ADD COLUMN IF NOT EXISTS login_selectors JSON"))
            
            # Users - Credits system
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS credits FLOAT DEFAULT 30.0"))
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS max_endpoints INTEGER DEFAULT 3"))
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS total_requests INTEGER DEFAULT 0"))
            
            # Endpoints - Credits tracking
            await conn.execute(text("ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS request_count INTEGER DEFAULT 0"))
            await conn.execute(text("ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS credits_used FLOAT DEFAULT 0.0"))
            await conn.execute(text("ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))
            
            print("✅ Database migrations completed successfully", flush=True)
    except Exception as e:
        print(f"CRITICAL: Lifespan Error: {e}", flush=True)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)


# Configuración de CORS basada en sugerencias
allow_origins = [str(origin) for origin in settings.BACKEND_CORS_ORIGINS]
print(f"🔒 CORS Origins configured: {allow_origins}", flush=True)

if "*" in allow_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

@app.middleware("http")
async def log_requests(request: Request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"CRITICAL: Request Error on {request.url.path}:\n{error_details}", flush=True)
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=500, 
            content={"detail": str(e), "path": request.url.path}
        )

@app.get("/")
async def root_status():
    return {"status": "ok", "message": "Snag API is live", "routes": [r.path for r in app.routes]}

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health")
async def health_check():
    import asyncio
    try:
        loop = asyncio.get_running_loop()
        loop_type = type(loop).__name__
    except Exception as e:
        loop_type = f"Error: {e}"
    return {
        "status": "ok",
        "loop": loop_type,
        "platform": sys.platform,
        "python": sys.version
    }

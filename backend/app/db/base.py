from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=True)
async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)
AsyncSessionLocal = async_session  # Alias para compatibilidad
Base = declarative_base()

import uuid
from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, Float, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime

class Endpoint(Base):
    __tablename__ = "endpoints"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scraper_id = Column(UUID(as_uuid=True), ForeignKey("scrapers.id"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    endpoint_slug = Column(String, unique=True, index=True)
    api_key = Column(String, nullable=True)
    rate_limit = Column(Integer, default=60)
    cache_enabled = Column(Boolean, default=True)
    cache_ttl = Column(Integer, default=3600)
    request_count = Column(Integer, default=0)  # Contador de requests
    credits_used = Column(Float, default=0.0)  # Créditos gastados por este endpoint
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="endpoints")
    scraper = relationship("Scraper", back_populates="endpoints")

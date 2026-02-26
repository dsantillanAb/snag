import uuid
from datetime import datetime
from sqlalchemy import Column, String, JSON, DateTime, Boolean, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base

class Scraper(Base):
    __tablename__ = "scrapers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True) # Will be mandatory after migration
    name = Column(String, index=True)
    url = Column(String)
    page_type = Column(String, nullable=True)  # ecommerce, blog, news, directory, gallery, other
    selector_config = Column(JSON, nullable=True)
    limit_articles = Column(Integer, default=10)
    fetch_full_content = Column(Boolean, default=False)
    wait_time = Column(Integer, default=2000)
    schedule = Column(String, nullable=True)
    status = Column(String, default="active")
    
    # Authentication fields
    auth_required = Column(Boolean, default=False)
    auth_username = Column(String, nullable=True)
    auth_password = Column(String, nullable=True)
    auth_type = Column(String, nullable=True)  # basic, form, custom
    login_url = Column(String, nullable=True)
    login_selectors = Column(JSON, nullable=True)  # {username_field, password_field, submit_button}
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="scrapers")
    endpoints = relationship("Endpoint", back_populates="scraper", cascade="all, delete-orphan")

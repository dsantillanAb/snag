from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, HttpUrl

class ScraperBase(BaseModel):
    name: str
    url: HttpUrl
    page_type: Optional[str] = None  # ecommerce, blog, news, etc.
    selector_config: Optional[Dict[str, str]] = None
    limit_articles: int = 10
    fetch_full_content: bool = False
    wait_time: int = 2000
    schedule: Optional[str] = None
    status: str = "active"
    
    # Authentication fields
    auth_required: bool = False
    auth_username: Optional[str] = None
    auth_password: Optional[str] = None
    auth_type: Optional[str] = None  # basic, form, custom
    login_url: Optional[str] = None
    login_selectors: Optional[Dict[str, str]] = None  # {username_field, password_field, submit_button}


class ScraperCreate(ScraperBase):
    pass

class ScraperUpdate(ScraperBase):
    name: Optional[str] = None
    url: Optional[HttpUrl] = None

class ScraperResponse(ScraperBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        
class ScraperAnalyze(BaseModel):
    url: HttpUrl

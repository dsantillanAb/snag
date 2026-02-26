from typing import Optional
from uuid import UUID
from pydantic import BaseModel

class EndpointBase(BaseModel):
    scraper_id: UUID
    endpoint_slug: str
    api_key: Optional[str] = None
    rate_limit: int = 60
    cache_enabled: bool = True
    cache_ttl: int = 3600

class EndpointCreate(EndpointBase):
    pass

class EndpointUpdate(EndpointBase):
    endpoint_slug: Optional[str] = None
    rate_limit: Optional[int] = None

class EndpointResponse(EndpointBase):
    id: UUID

    class Config:
        from_attributes = True

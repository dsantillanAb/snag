"""
Stats endpoint: returns system statistics.
- total_endpoints: from DB
- online_users: unique IPs seen in the last 5 minutes (in-memory)
- total_visitors: cumulative unique IP count (in-memory, resets on restart)
- visitor_history: last 20 visitor entries with timestamp and IP (anonymized)
"""
from typing import Any
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.api import deps
from app.models.endpoint import Endpoint

router = APIRouter()

# In-memory store keyed by anonymized IP
# Structure: {"ip_hash": {"last_seen": datetime, "first_seen": datetime, "visits": int}}
_visitors: dict = {}
ONLINE_THRESHOLD_MINUTES = 5


def _anonymize_ip(ip: str) -> str:
    """Keep only first 2 octets for privacy e.g. 192.168.x.x"""
    parts = ip.split(".")
    if len(parts) == 4:
        return f"{parts[0]}.{parts[1]}.x.x"
    return "?.?.x.x"


def record_visit(ip: str):
    anon = _anonymize_ip(ip)
    now = datetime.utcnow()
    if anon not in _visitors:
        _visitors[anon] = {"first_seen": now, "last_seen": now, "visits": 1}
    else:
        _visitors[anon]["last_seen"] = now
        _visitors[anon]["visits"] += 1


@router.get("", response_model=Any)
@router.get("/", response_model=Any)
async def get_stats(
    request: Request,
    db: AsyncSession = Depends(deps.get_db),
    current_user: deps.User | None = Depends(deps.get_current_user_optional)
) -> Any:
    try:
        # Record this visitor
        client_ip = request.client.host if request.client else "unknown"
        record_visit(client_ip)

        # 1. Count endpoints
        if current_user:
            # User Specific count
            result = await db.execute(
                select(func.count()).select_from(Endpoint).where(Endpoint.user_id == current_user.id)
            )
            total_endpoints = result.scalar() or 0
        else:
            # Global count for public view
            result = await db.execute(select(func.count()).select_from(Endpoint))
            total_endpoints = result.scalar() or 0
    except Exception as e:
        print(f"ERROR in get_stats metadata part: {e}")
        total_endpoints = 0

    # 2. Online users: last seen within threshold
    now = datetime.utcnow()
    threshold = now - timedelta(minutes=ONLINE_THRESHOLD_MINUTES)
    online = [
        ip for ip, data in _visitors.items()
        if data["last_seen"] >= threshold
    ]

    # 3. Visitor history: last 20 entries sorted by last_seen desc
    history = sorted(
        [
            {
                "ip": ip,
                "first_seen": data["first_seen"].isoformat(),
                "last_seen": data["last_seen"].isoformat(),
                "visits": data["visits"],
            }
            for ip, data in _visitors.items()
        ],
        key=lambda x: x["last_seen"],
        reverse=True
    )[:20]

    return {
        "total_endpoints": total_endpoints,
        "online_users": len(online),
        "total_unique_visitors": len(_visitors),
        "visitor_history": history,
    }

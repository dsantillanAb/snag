"""
Script para establecer un usuario como administrador.
Uso: python set_admin.py <username>
"""
import asyncio
import sys
from sqlalchemy import select
from app.db.base import async_session
from app.models.user import User


async def set_admin(username: str):
    async with async_session() as db:
        # Buscar usuario por username
        result = await db.execute(select(User).where(User.username == username))
        user = result.scalar_one_or_none()
        
        if not user:
            print(f"❌ Usuario '{username}' no encontrado")
            return
        
        # Establecer como admin
        user.is_admin = True
        await db.commit()
        
        print(f"✅ Usuario '{username}' ahora es administrador")
        print(f"   ID: {user.id}")
        print(f"   Email: {user.email}")
        print(f"   Créditos: ${user.credits}")


async def list_users():
    async with async_session() as db:
        result = await db.execute(select(User))
        users = result.scalars().all()
        
        print("\n📋 Usuarios en el sistema:")
        print("-" * 80)
        for user in users:
            admin_badge = "⭐ ADMIN" if user.is_admin else ""
            print(f"{user.username:20} | {user.email:30} | ${user.credits:6.2f} | {admin_badge}")
        print("-" * 80)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python set_admin.py <username>")
        print("     python set_admin.py --list  (para ver todos los usuarios)")
        sys.exit(1)
    
    if sys.argv[1] == "--list":
        asyncio.run(list_users())
    else:
        username = sys.argv[1]
        asyncio.run(set_admin(username))

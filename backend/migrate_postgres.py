"""
Migration script for PostgreSQL database
Adds credits system columns
"""
import asyncio
import sys
from sqlalchemy import text
from app.db.base import engine

async def migrate():
    print("="*60)
    print("  SNAG - PostgreSQL Credits Migration")
    print("="*60)
    print()
    
    try:
        async with engine.begin() as conn:
            print("✓ Connected to PostgreSQL database")
            print()
            
            # Add columns to users table
            print("1. Updating users table...")
            
            # Add credits column
            try:
                await conn.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN IF NOT EXISTS credits FLOAT DEFAULT 30.0
                """))
                print("  ✓ Added 'credits' column")
            except Exception as e:
                print(f"  • 'credits' column: {e}")
            
            # Add total_requests column
            try:
                await conn.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN IF NOT EXISTS total_requests INTEGER DEFAULT 0
                """))
                print("  ✓ Added 'total_requests' column")
            except Exception as e:
                print(f"  • 'total_requests' column: {e}")
            
            print()
            print("2. Updating endpoints table...")
            
            # Add request_count column
            try:
                await conn.execute(text("""
                    ALTER TABLE endpoints 
                    ADD COLUMN IF NOT EXISTS request_count INTEGER DEFAULT 0
                """))
                print("  ✓ Added 'request_count' column")
            except Exception as e:
                print(f"  • 'request_count' column: {e}")
            
            # Add credits_used column
            try:
                await conn.execute(text("""
                    ALTER TABLE endpoints 
                    ADD COLUMN IF NOT EXISTS credits_used FLOAT DEFAULT 0.0
                """))
                print("  ✓ Added 'credits_used' column")
            except Exception as e:
                print(f"  • 'credits_used' column: {e}")
            
            # Add created_at column
            try:
                await conn.execute(text("""
                    ALTER TABLE endpoints 
                    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                """))
                print("  ✓ Added 'created_at' column")
            except Exception as e:
                print(f"  • 'created_at' column: {e}")
            
            print()
            print("3. Updating existing data...")
            
            # Update existing users with initial credits
            result = await conn.execute(text("""
                UPDATE users 
                SET credits = 30.0 
                WHERE credits IS NULL OR credits = 0
            """))
            print(f"  ✓ Gave $30 credits to users")
            
            # Initialize total_requests
            await conn.execute(text("""
                UPDATE users 
                SET total_requests = 0 
                WHERE total_requests IS NULL
            """))
            print(f"  ✓ Initialized total_requests")
            
            # Set admin user
            result = await conn.execute(text("""
                UPDATE users 
                SET is_admin = TRUE 
                WHERE username = 'dsantillanAb'
            """))
            if result.rowcount > 0:
                print(f"  ✓ Set 'dsantillanAb' as admin")
            else:
                print(f"  • Admin user will be set on first login")
            
            # Initialize endpoint counters
            await conn.execute(text("""
                UPDATE endpoints 
                SET request_count = 0 
                WHERE request_count IS NULL
            """))
            
            await conn.execute(text("""
                UPDATE endpoints 
                SET credits_used = 0.0 
                WHERE credits_used IS NULL
            """))
            print(f"  ✓ Initialized endpoint counters")
            
            print()
            print("4. Getting statistics...")
            
            # Get stats
            result = await conn.execute(text("SELECT COUNT(*) FROM users"))
            user_count = result.scalar()
            
            result = await conn.execute(text("SELECT COUNT(*) FROM endpoints"))
            endpoint_count = result.scalar()
            
            print()
            print("="*60)
            print("✅ Migration completed successfully!")
            print("="*60)
            print()
            print(f"📊 Database Statistics:")
            print(f"  • Total users: {user_count}")
            print(f"  • Total endpoints: {endpoint_count}")
            
            # Show users
            result = await conn.execute(text("""
                SELECT username, credits, is_admin 
                FROM users 
                ORDER BY created_at
            """))
            users = result.fetchall()
            
            if users:
                print()
                print("👥 Users:")
                for username, credits, is_admin in users:
                    admin_badge = " [ADMIN]" if is_admin else ""
                    print(f"  • {username}: ${credits:.2f}{admin_badge}")
            
            print()
            print("🚀 Backend is ready! Keep it running or restart:")
            print("   uvicorn app.main:app --reload")
            print()
            
    except Exception as e:
        print()
        print(f"❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(migrate())

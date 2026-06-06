import logging
from typing import AsyncGenerator
from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

logger = logging.getLogger("career_twin")

# Declarative Base for models
Base = declarative_base()

# Async Engine and Session
engine = create_async_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

def init_db_server_and_database():
    """
    Connect to MySQL server and ensure the target database exists.
    Then, create all tables.
    """
    try:
        # Connect to host without DB name to run CREATE DATABASE
        sync_engine = create_engine(settings.base_server_url, isolation_level="AUTOCOMMIT")
        with sync_engine.connect() as conn:
            conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {settings.DB_NAME}"))
        sync_engine.dispose()
        logger.info(f"Database '{settings.DB_NAME}' verified/created successfully.")
    except Exception as e:
        logger.error(f"Error checking/creating database: {e}")
        raise e

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that yields an async database session.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

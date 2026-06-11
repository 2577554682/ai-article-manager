from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine, AsyncSession
from sqlalchemy.orm import DeclarativeBase

from config import DATABASE_URL


class Base(DeclarativeBase):
    pass


engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def init_db():
    """创建所有数据库表"""
    async with engine.begin() as conn:
        await conn.run_sync(lambda c: Base.metadata.create_all(c))


async def dispose_db():
    """关闭数据库连接"""
    await engine.dispose()

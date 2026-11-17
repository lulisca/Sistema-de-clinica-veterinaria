from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from app.core.config import settings

connect_args = {'check_same_thread': False} if settings.database_url.startswith('sqlite') else {}
# pool_pre_ping testa a conexão antes de usar. Na Vercel, o banco (Neon) desliga quando fica parado
# e a conexão guardada morre; sem o teste, a primeira chamada depois disso daria erro 500.
engine = create_engine(settings.database_url, future=True, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

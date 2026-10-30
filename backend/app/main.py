from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import router
from app.core.config import settings
from app.core.database import Base, engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Conveniência para MVP/local. Em produção, prefira Alembic migrations.
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title=settings.app_name,
    version='0.1.0',
    description='Backend acadêmico para Agenda + Fila Virtual veterinária.',
    lifespan=lifespan,
)

origins = ['*'] if settings.cors_origins == ['*'] else settings.cors_origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=origins != ['*'],
    allow_methods=['*'],
    allow_headers=['*'],
)
app.include_router(router, prefix='/api')

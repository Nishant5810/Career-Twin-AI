import logging
import asyncio
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.database import engine, Base, init_db_server_and_database
from app.api import auth, resume, insights, mentor
from app.services.ml_service import ml_service

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("career_twin")

app = FastAPI(
    title="Career Twin AI Backend",
    description="Production-ready API for Career Twin AI platform",
    version="1.0.0"
)

# CORS Middleware config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(resume.router, prefix="/api/v1")
app.include_router(insights.router, prefix="/api/v1")
app.include_router(mentor.router, prefix="/api/v1")

@app.on_event("startup")
async def startup_event():
    logger.info("Starting up Career Twin AI Backend...")
    
    # 1. Initialize DB Server & Schema
    init_db_server_and_database()
    
    # 2. Run schema migrations/creation
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("MySQL tables verified/created successfully.")
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
        
    # 3. Ensure ML models are trained and serialized
    try:
        ml_service.load_or_train_models()
        logger.info("Machine Learning pipelines ready.")
    except Exception as e:
        logger.error(f"Error initializing ML pipelines: {e}")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please check logs."}
    )


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": "Career Twin AI Backend"}

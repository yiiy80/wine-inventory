from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import engine, Base
from routers import (
    auth_router,
    wines_router,
    inventory_router,
    dashboard_router,
    users_router,
    logs_router,
    export_import_router
)
from seed import seed_admin_user

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup
    Base.metadata.create_all(bind=engine)
    # Seed admin user
    seed_admin_user()
    yield

app = FastAPI(
    title="红酒库存管理系统 API",
    description="Wine Inventory Management System API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration - Must be added before other middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(wines_router, prefix="/api/wines", tags=["Wines"])
app.include_router(inventory_router, prefix="/api/inventory", tags=["Inventory"])
app.include_router(dashboard_router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(users_router, prefix="/api/users", tags=["Users"])
app.include_router(logs_router, prefix="/api/logs", tags=["Logs"])
app.include_router(export_import_router, prefix="/api", tags=["Export/Import"])

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "message": "红酒库存管理系统运行正常"}

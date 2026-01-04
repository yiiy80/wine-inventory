from .auth import router as auth_router
from .wines import router as wines_router
from .inventory import router as inventory_router
from .dashboard import router as dashboard_router
from .users import router as users_router
from .logs import router as logs_router
from .export_import import router as export_import_router

__all__ = [
    "auth_router",
    "wines_router",
    "inventory_router",
    "dashboard_router",
    "users_router",
    "logs_router",
    "export_import_router"
]

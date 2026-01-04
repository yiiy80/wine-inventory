from database import SessionLocal
from models import User
from auth import get_password_hash


def seed_admin_user():
    """Create default admin user if not exists"""
    db = SessionLocal()
    try:
        # Check if admin exists
        admin = db.query(User).filter(User.email == "admin@wine.com").first()
        if not admin:
            admin = User(
                email="admin@wine.com",
                password_hash=get_password_hash("admin123"),
                name="系统管理员",
                role="admin",
                is_active=True
            )
            db.add(admin)
            db.commit()
            print("Created default admin user: admin@wine.com / admin123")
    finally:
        db.close()

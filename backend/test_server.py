#!/usr/bin/env python3
"""Test server startup to debug issues"""

import uvicorn
import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from main import app
    print("✓ App imported successfully")

    # Test database connection
    from database import engine, Base, SessionLocal
    print("✓ Database module imported")

    # Create tables
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created")

    # Test session
    db = SessionLocal()
    db.close()
    print("✓ Database session created and closed")

    print("✓ All checks passed, starting server...")
    print("Routes:")
    for route in app.routes:
        print(f"  {route.path}")

    # Start server with explicit parameters
    print("Starting uvicorn server...")
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8001,
        log_level="info",
        access_log=True,
        server_header=False,
        date_header=False
    )

except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

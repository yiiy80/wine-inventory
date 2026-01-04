# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A professional wine inventory management system (红酒库存管理系统) designed for wine merchants and winery owners. The application provides complete wine inventory tracking, stock management, alerts, data visualization, and multi-user role-based access control.

**Test Status:** 95.8% API test coverage (23/24 tests passing) - See [TEST_REPORT.md](TEST_REPORT.md) for details.

## Technology Stack

**Frontend:**
- React 19 with TypeScript
- Vite build tool
- Tailwind CSS for styling
- React Router for navigation
- Recharts for data visualization
- Axios for API communication
- Port: 5173

**Backend:**
- Python with FastAPI
- SQLAlchemy ORM with SQLite database
- JWT authentication with python-jose
- Password hashing with passlib
- Port: 8000

## Quick Start Commands

### Starting the Application

**Recommended (automated):**
```bash
./init.sh
```

**Manual startup - Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**Manual startup - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Development Commands

**Backend:**
```bash
# Start with auto-reload
cd backend
uvicorn main:app --reload

# Start with specific host/port
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# View API documentation (after starting)
# http://localhost:8000/docs (Swagger UI)
# http://localhost:8000/redoc (ReDoc)
```

**Frontend:**
```bash
# Development server
npm run dev

# Type checking
npx tsc -b

# Linting
npm run lint

# Production build
npm run build

# Preview production build
npm run preview
```

## Default Credentials

- **Email:** admin@wine.com
- **Password:** admin123

Change these credentials after first login.

## Architecture

### Backend Structure

```
backend/
├── main.py              # FastAPI app entry, CORS, router registration
├── database.py          # SQLAlchemy engine and session configuration
├── models.py            # SQLAlchemy ORM models (User, Wine, InventoryTransaction, OperationLog)
├── schemas.py           # Pydantic models for request/response validation
├── auth.py              # JWT token creation/validation, password hashing, dependency injection
├── seed.py              # Database seeding (creates default admin user)
└── routers/
    ├── auth.py          # Login, logout, user profile, password management
    ├── wines.py         # CRUD for wines, filtering, search, low-stock queries
    ├── inventory.py     # Stock in/out transactions, transaction history
    ├── dashboard.py     # Summary stats, trends, distribution charts
    ├── users.py         # User management (admin only)
    ├── logs.py          # Operation logs viewing
    └── export_import.py # CSV/Excel export and import
```

**Key Backend Patterns:**

1. **Authentication Flow:**
   - JWT tokens generated in `auth.py` via `create_access_token()`
   - Bearer token validation via `get_current_user()` dependency
   - Admin-only routes use `get_current_admin_user()` dependency
   - Token expiry: 24 hours (configurable in `auth.py`)

2. **Database Models (models.py):**
   - `User`: Authentication and role management (admin/user)
   - `Wine`: Core wine inventory with stock tracking
   - `InventoryTransaction`: Stock in/out history with CASCADE delete
   - `OperationLog`: Audit trail for all system actions
   - Relationships use SQLAlchemy `relationship()` with `back_populates`

3. **Request/Response Patterns:**
   - Pydantic schemas in `schemas.py` for validation
   - Base/Create/Update/Response schema pattern for each entity
   - List responses include pagination metadata

### Frontend Structure

```
frontend/src/
├── main.tsx             # Entry point, renders App
├── App.tsx              # Router setup, route definitions, provider nesting
├── contexts/
│   ├── AuthContext.tsx  # User authentication state and methods
│   └── ThemeContext.tsx # Dark/light theme switching
├── components/
│   ├── Layout.tsx       # Main layout with sidebar and topbar
│   ├── ProtectedRoute.tsx   # Route guard for authenticated users
│   ├── Toast.tsx        # Global notification system
│   ├── Modal.tsx        # Reusable modal wrapper
│   ├── ConfirmDialog.tsx    # Confirmation dialogs
│   ├── WineFormModal.tsx    # Add/edit wine form
│   └── StockTransactionModal.tsx  # Stock in/out form
├── pages/
│   ├── LoginPage.tsx    # Login form
│   ├── DashboardPage.tsx    # Overview with charts and stats
│   ├── WinesPage.tsx    # Wine list with filters and search
│   ├── InventoryPage.tsx    # Transaction history
│   ├── AlertsPage.tsx   # Low stock warnings
│   └── [other pages]
├── services/
│   └── api.ts           # Axios instance with auth interceptors
├── types/
│   └── index.ts         # TypeScript type definitions
└── utils/               # Helper functions
```

**Key Frontend Patterns:**

1. **Authentication (AuthContext.tsx):**
   - Token stored in localStorage
   - Auto-validates token on mount via `/auth/me` endpoint
   - Provides `login()`, `logout()`, `isAuthenticated`, `isAdmin`
   - Axios interceptor adds Bearer token to all requests
   - 401 responses trigger automatic redirect to login

2. **API Communication (services/api.ts):**
   - Base URL: `http://localhost:8000/api`
   - Request interceptor: Adds `Authorization: Bearer {token}` header
   - Response interceptor: Handles 401 by clearing auth and redirecting
   - All API calls use this configured axios instance

3. **Routing:**
   - Public route: `/login`
   - Protected routes wrapped with `<ProtectedRoute>`
   - Admin-only routes use `<ProtectedRoute adminOnly>`
   - Default redirect: `/` → `/dashboard`

4. **Component Patterns:**
   - Context providers: AuthProvider → ThemeProvider → ToastProvider
   - Modal forms for create/edit operations
   - Toast notifications for user feedback
   - Responsive layout with collapsible sidebar

### Database Schema

**Users table:**
- `id`, `email` (unique), `password_hash`, `name`, `role` (admin/user)
- `is_active` (boolean for account status)
- Timestamps: `created_at`, `updated_at`

**Wines table:**
- `id`, `name`, `vintage_year`, `region`, `grape_variety`
- `price`, `supplier`, `storage_location`
- `current_stock`, `low_stock_threshold`
- `notes`, `image_url`
- `created_by` (FK to users), timestamps

**Inventory_transactions table:**
- `id`, `wine_id` (FK with CASCADE delete), `transaction_type` ('in'/'out')
- `quantity`, `reason`
- `performed_by` (FK to users)
- `created_at`

**Operation_logs table:**
- `id`, `user_id` (FK to users)
- `action_type`, `entity_type`, `entity_id`
- `details` (JSON), `ip_address`
- `created_at`

## API Endpoints Summary

**Authentication (`/api/auth`):**
- `POST /login` - Email/password authentication, returns JWT
- `POST /logout` - Invalidate session
- `GET /me` - Get current user info
- `PUT /profile` - Update user profile
- `PUT /password` - Change password

**Wines (`/api/wines`):**
- `GET /` - List wines with pagination, search, filters, sorting
- `POST /` - Create new wine
- `GET /{id}` - Get single wine
- `PUT /{id}` - Update wine
- `DELETE /{id}` - Delete wine
- `GET /low-stock` - Get wines below threshold
- `GET /regions` - Get distinct regions (for filters)
- `GET /varieties` - Get distinct grape varieties
- `GET /suppliers` - Get distinct suppliers
- `GET /locations` - Get distinct storage locations

**Inventory (`/api/inventory`):**
- `GET /` - List transactions with filters
- `POST /in` - Record stock in (increases current_stock)
- `POST /out` - Record stock out (decreases current_stock, validates quantity)
- `GET /{id}` - Get single transaction
- `GET /wine/{wineId}` - Get transactions for specific wine

**Dashboard (`/api/dashboard`):**
- `GET /summary` - Total wines, stock, value, low-stock count
- `GET /trends` - Stock in/out over time (for charts)
- `GET /distribution` - Stock by region/variety

**Users (`/api/users`):** (Admin only)
- `GET /` - List users
- `POST /` - Create user
- `GET /{id}` - Get user
- `PUT /{id}` - Update user
- `DELETE /{id}` - Delete user
- `PUT /{id}/status` - Toggle active status

**Logs (`/api/logs`):**
- `GET /` - List operation logs with filters
- `GET /{id}` - Get single log entry

**Export/Import (`/api`):**
- `GET /export/wines` - Export wines to CSV/Excel
- `GET /export/transactions` - Export transaction history
- `POST /import/wines` - Import wines from CSV

## Key Implementation Details

### Authentication & Authorization

**JWT Token Handling:**
- Secret key defined in `backend/auth.py` (change in production!)
- Token expiry: 24 hours
- Frontend stores token in localStorage
- All protected routes require valid Bearer token

**Role-Based Access:**
- Two roles: `admin` and `user`
- Admin routes protected by `get_current_admin_user()` dependency
- Frontend uses `isAdmin` from AuthContext to conditionally render UI

### Stock Management Rules

**Stock Operations:**
- Stock IN: Adds to `current_stock`, creates transaction record
- Stock OUT: Validates quantity ≤ current_stock, subtracts from stock
- All stock changes are atomic (database transaction)
- Deleting a wine CASCADE deletes all its transactions

**Low Stock Alerts:**
- Each wine has independent `low_stock_threshold`
- Alert triggered when `current_stock < low_stock_threshold`
- Dashboard shows count of low-stock wines
- Alerts page lists all wines below threshold

### Data Validation

**Backend (Pydantic schemas):**
- Email format validation
- Password minimum 8 characters
- Vintage year range: 1900-2100
- Price/stock must be ≥ 0
- Stock OUT quantity must be > 0

**Frontend (Form validation):**
- Required field checks
- Type validation (numbers, dates)
- Client-side validation before API calls

### CORS Configuration

**Backend (main.py):**
```python
allow_origins=["http://localhost:5173"]
allow_credentials=True
allow_methods=["*"]
allow_headers=["*"]
```

Update `allow_origins` for production deployment.

### Database Initialization

**On Startup (main.py lifespan):**
1. Creates all tables via `Base.metadata.create_all()`
2. Seeds default admin user via `seed_admin_user()`

**Database File Location:**
- `backend/wine_inventory.db`

## Design System

**Color Palette:**
- Primary: #722F37 (Burgundy wine red)
- Secondary: #C9A227 (Champagne gold)
- Accent: #1E4D2B (Bottle green)
- Supports light/dark theme switching

**Typography:**
- Headings: Playfair Display (serif)
- Body: Source Sans 3 (sans-serif)
- Monospace: JetBrains Mono

**Icons:** Lucide React

## Testing

### Running API Tests

```bash
python test_api.py
```

This runs a comprehensive test suite covering:
- Authentication (login, token validation)
- Wines CRUD operations
- Inventory management (stock in/out)
- Dashboard statistics
- User management
- Operation logs

**Current Coverage:** 23/24 tests passing (95.8%)

### Quick Authentication Test

```bash
python quick_test.py
```

Tests basic login and token usage.

## Common Development Tasks

### Adding a New API Endpoint

1. Define Pydantic schemas in `backend/schemas.py`
2. Add route function in appropriate router file
3. Register router in `backend/main.py` if new
4. Update TypeScript types in `frontend/src/types/index.ts`
5. Call endpoint from frontend component using `api` instance

### Adding a New Page

1. Create component in `frontend/src/pages/`
2. Add route in `App.tsx` (wrap with ProtectedRoute if needed)
3. Add navigation link in `Layout.tsx` sidebar
4. Update route access logic in ProtectedRoute if needed

### Database Migration

This project uses SQLAlchemy without Alembic. For schema changes:

1. Update model in `backend/models.py`
2. Delete `backend/wine_inventory.db` (development only!)
3. Restart backend - database will be recreated
4. For production: Implement Alembic or manual SQL migrations

### Testing API Endpoints

Use FastAPI's built-in documentation:
- Navigate to http://localhost:8000/docs
- Use "Authorize" button to add JWT token
- Test endpoints interactively

## Troubleshooting

### Backend won't start

**"Could not import module 'main'"**
- Ensure you're in the `backend/` directory
- Activate virtual environment first

**Port 8000 already in use:**
```bash
# Find and kill process using port 8000
lsof -ti:8000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :8000   # Windows (note PID, then taskkill)
```

### Frontend issues

**CORS errors:**
- Verify backend is running on port 8000
- Check CORS settings in `backend/main.py`
- Confirm frontend uses `http://localhost:8000/api` in `services/api.ts`

**401 Unauthorized on all requests:**
- Check localStorage for valid token
- Verify token hasn't expired (24hr default)
- Login again to get fresh token

**Build errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database issues

**Database locked:**
- Ensure only one backend instance is running
- Close any SQLite browser tools
- Restart backend

**Need to reset database:**
```bash
# Development only - deletes all data!
rm backend/wine_inventory.db
# Restart backend to recreate
```

## Known Issues & Fixes

### Fixed: JWT Authentication Bug (Critical)

**Issue:** python-jose requires JWT `sub` claim to be a string, but code was passing integer user IDs, causing all authenticated endpoints to return 401.

**Fix Applied:** In `backend/auth.py`:
- `create_access_token()` now converts integer user ID to string
- `get_current_user()` converts string back to integer for database queries

**Status:** ✅ FIXED - All authentication now works correctly

### Minor: DELETE Returns 200 Instead of 204

**Issue:** `DELETE /wines/{id}` returns 200 OK instead of RESTful 204 No Content
**Impact:** Minimal - deletion works correctly, only response format differs
**Status:** Code fixed, requires clean server restart

## Security Notes

**Production Checklist:**
- [ ] Remove debug logging from `backend/auth.py` (lines with `print("[DEBUG]")`)
- [ ] Change `SECRET_KEY` in `backend/auth.py` to environment variable
- [ ] Update CORS origins in `backend/main.py`
- [ ] Use environment variables for sensitive config
- [ ] Change default admin credentials
- [ ] Use PostgreSQL/MySQL instead of SQLite
- [ ] Enable HTTPS
- [ ] Implement rate limiting
- [ ] Add input sanitization for XSS prevention
- [ ] Review and restrict file upload functionality

## Windows-Specific Notes

When using Git Bash or WSL, paths may need forward slashes:
```bash
cd /c/github/autonomous-coding/generations/wine-inventory
```

Virtual environment activation on Windows:
```bash
# Git Bash
source venv/Scripts/activate

# Command Prompt
venv\Scripts\activate.bat

# PowerShell
venv\Scripts\Activate.ps1
```

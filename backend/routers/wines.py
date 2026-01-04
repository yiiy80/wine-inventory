from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import Optional, List
import json

from database import get_db
from models import Wine, OperationLog, User
from schemas import WineCreate, WineUpdate, WineResponse, WineListResponse
from auth import get_current_user

router = APIRouter()


@router.get("", response_model=WineListResponse)
def get_wines(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    region: Optional[str] = None,
    grape_variety: Optional[str] = None,
    supplier: Optional[str] = None,
    storage_location: Optional[str] = None,
    vintage_year: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    stock_status: Optional[str] = None,  # 'normal', 'low', 'out'
    sort_by: Optional[str] = "created_at",
    sort_order: Optional[str] = "desc",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get paginated list of wines with filters"""
    query = db.query(Wine)

    # Apply search filter
    if search:
        query = query.filter(
            or_(
                Wine.name.ilike(f"%{search}%"),
                Wine.region.ilike(f"%{search}%"),
                Wine.grape_variety.ilike(f"%{search}%"),
                Wine.supplier.ilike(f"%{search}%")
            )
        )

    # Apply filters
    if region:
        query = query.filter(Wine.region == region)
    if grape_variety:
        query = query.filter(Wine.grape_variety == grape_variety)
    if supplier:
        query = query.filter(Wine.supplier == supplier)
    if storage_location:
        query = query.filter(Wine.storage_location == storage_location)
    if vintage_year:
        query = query.filter(Wine.vintage_year == vintage_year)
    if min_price is not None:
        query = query.filter(Wine.price >= min_price)
    if max_price is not None:
        query = query.filter(Wine.price <= max_price)

    # Stock status filter
    if stock_status == "out":
        query = query.filter(Wine.current_stock == 0)
    elif stock_status == "low":
        query = query.filter(Wine.current_stock > 0, Wine.current_stock <= Wine.low_stock_threshold)
    elif stock_status == "normal":
        query = query.filter(Wine.current_stock > Wine.low_stock_threshold)

    # Get total count
    total = query.count()

    # Apply sorting
    sort_column = getattr(Wine, sort_by, Wine.created_at)
    if sort_order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    # Apply pagination
    offset = (page - 1) * page_size
    wines = query.offset(offset).limit(page_size).all()

    total_pages = (total + page_size - 1) // page_size

    return WineListResponse(
        items=[WineResponse.model_validate(w) for w in wines],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.post("", response_model=WineResponse, status_code=status.HTTP_201_CREATED)
def create_wine(
    wine_data: WineCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new wine"""
    wine = Wine(
        **wine_data.model_dump(),
        created_by=current_user.id
    )
    db.add(wine)
    db.commit()
    db.refresh(wine)

    # Log the action
    log = OperationLog(
        user_id=current_user.id,
        action_type="create",
        entity_type="wine",
        entity_id=wine.id,
        details=json.dumps({"name": wine.name, "vintage_year": wine.vintage_year})
    )
    db.add(log)
    db.commit()

    return wine


@router.get("/low-stock", response_model=List[WineResponse])
def get_low_stock_wines(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get wines with low stock"""
    wines = db.query(Wine).filter(
        Wine.current_stock <= Wine.low_stock_threshold
    ).order_by(Wine.current_stock.asc()).all()

    return wines


@router.get("/regions")
def get_regions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get distinct regions"""
    regions = db.query(Wine.region).distinct().filter(Wine.region.isnot(None)).all()
    return [r[0] for r in regions if r[0]]


@router.get("/varieties")
def get_varieties(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get distinct grape varieties"""
    varieties = db.query(Wine.grape_variety).distinct().filter(Wine.grape_variety.isnot(None)).all()
    return [v[0] for v in varieties if v[0]]


@router.get("/suppliers")
def get_suppliers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get distinct suppliers"""
    suppliers = db.query(Wine.supplier).distinct().filter(Wine.supplier.isnot(None)).all()
    return [s[0] for s in suppliers if s[0]]


@router.get("/locations")
def get_locations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get distinct storage locations"""
    locations = db.query(Wine.storage_location).distinct().filter(Wine.storage_location.isnot(None)).all()
    return [l[0] for l in locations if l[0]]


@router.get("/{wine_id}", response_model=WineResponse)
def get_wine(
    wine_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a single wine by ID"""
    wine = db.query(Wine).filter(Wine.id == wine_id).first()
    if not wine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="红酒不存在"
        )
    return wine


@router.put("/{wine_id}", response_model=WineResponse)
def update_wine(
    wine_id: int,
    wine_data: WineUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a wine"""
    wine = db.query(Wine).filter(Wine.id == wine_id).first()
    if not wine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="红酒不存在"
        )

    # Store old values for logging
    old_values = {
        "name": wine.name,
        "vintage_year": wine.vintage_year,
        "region": wine.region,
        "price": wine.price,
        "current_stock": wine.current_stock
    }

    # Update fields
    update_data = wine_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(wine, field, value)

    db.commit()
    db.refresh(wine)

    # Log the action
    log = OperationLog(
        user_id=current_user.id,
        action_type="update",
        entity_type="wine",
        entity_id=wine.id,
        details=json.dumps({
            "old": old_values,
            "new": update_data
        })
    )
    db.add(log)
    db.commit()

    return wine


@router.delete("/{wine_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_wine(
    wine_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a wine"""
    wine = db.query(Wine).filter(Wine.id == wine_id).first()
    if not wine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="红酒不存在"
        )

    wine_name = wine.name

    db.delete(wine)
    db.commit()

    # Log the action
    log = OperationLog(
        user_id=current_user.id,
        action_type="delete",
        entity_type="wine",
        entity_id=wine_id,
        details=json.dumps({"name": wine_name})
    )
    db.add(log)
    db.commit()

    return None  # 204 No Content response

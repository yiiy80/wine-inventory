from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import Optional

from database import get_db
from models import Wine, InventoryTransaction, User
from schemas import DashboardSummary, StockTrend, StockDistribution
from auth import get_current_user

router = APIRouter()


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashboard summary statistics"""
    total_wines = db.query(func.count(Wine.id)).scalar() or 0
    total_stock = db.query(func.sum(Wine.current_stock)).scalar() or 0

    # Calculate total value (price * stock for each wine)
    wines = db.query(Wine).all()
    total_value = sum((w.price or 0) * w.current_stock for w in wines)

    # Count low stock wines (current_stock <= low_stock_threshold and > 0)
    low_stock_count = db.query(func.count(Wine.id)).filter(
        Wine.current_stock <= Wine.low_stock_threshold,
        Wine.current_stock > 0
    ).scalar() or 0

    # Count out of stock wines
    out_of_stock_count = db.query(func.count(Wine.id)).filter(
        Wine.current_stock == 0
    ).scalar() or 0

    return DashboardSummary(
        total_wines=total_wines,
        total_stock=total_stock,
        total_value=round(total_value, 2),
        low_stock_count=low_stock_count,
        out_of_stock_count=out_of_stock_count
    )


@router.get("/trends")
def get_stock_trends(
    days: int = Query(default=7, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get stock in/out trends over time"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)

    trends = []
    current_date = start_date

    while current_date <= end_date:
        next_date = current_date + timedelta(days=1)

        # Get stock in for this day
        stock_in = db.query(func.sum(InventoryTransaction.quantity)).filter(
            InventoryTransaction.transaction_type == "in",
            InventoryTransaction.created_at >= current_date,
            InventoryTransaction.created_at < next_date
        ).scalar() or 0

        # Get stock out for this day
        stock_out = db.query(func.sum(InventoryTransaction.quantity)).filter(
            InventoryTransaction.transaction_type == "out",
            InventoryTransaction.created_at >= current_date,
            InventoryTransaction.created_at < next_date
        ).scalar() or 0

        trends.append(StockTrend(
            date=current_date.strftime("%Y-%m-%d"),
            stock_in=stock_in,
            stock_out=stock_out
        ))

        current_date = next_date

    return trends


@router.get("/distribution/region")
def get_distribution_by_region(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get stock distribution by region"""
    results = db.query(
        Wine.region,
        func.sum(Wine.current_stock).label("total_stock")
    ).group_by(Wine.region).all()

    return [
        StockDistribution(name=r.region or "未知", value=r.total_stock or 0)
        for r in results
    ]


@router.get("/distribution/variety")
def get_distribution_by_variety(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get stock distribution by grape variety"""
    results = db.query(
        Wine.grape_variety,
        func.sum(Wine.current_stock).label("total_stock")
    ).group_by(Wine.grape_variety).all()

    return [
        StockDistribution(name=r.grape_variety or "未知", value=r.total_stock or 0)
        for r in results
    ]


@router.get("/alerts")
def get_alerts_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get count of low stock alerts"""
    low_stock_count = db.query(func.count(Wine.id)).filter(
        Wine.current_stock <= Wine.low_stock_threshold
    ).scalar() or 0

    return {"low_stock_count": low_stock_count}

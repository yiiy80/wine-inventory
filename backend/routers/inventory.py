from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List
from datetime import datetime
import json

from database import get_db
from models import Wine, InventoryTransaction, OperationLog, User
from schemas import TransactionCreate, TransactionResponse, TransactionListResponse
from auth import get_current_user

router = APIRouter()


@router.get("", response_model=TransactionListResponse)
def get_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    wine_id: Optional[int] = None,
    transaction_type: Optional[str] = None,
    performed_by: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get paginated list of inventory transactions"""
    query = db.query(InventoryTransaction)

    # Apply filters
    if wine_id:
        query = query.filter(InventoryTransaction.wine_id == wine_id)
    if transaction_type:
        query = query.filter(InventoryTransaction.transaction_type == transaction_type)
    if performed_by:
        query = query.filter(InventoryTransaction.performed_by == performed_by)
    if start_date:
        query = query.filter(InventoryTransaction.created_at >= start_date)
    if end_date:
        query = query.filter(InventoryTransaction.created_at <= end_date)

    # Get total count
    total = query.count()

    # Apply sorting and pagination
    query = query.order_by(InventoryTransaction.created_at.desc())
    offset = (page - 1) * page_size
    transactions = query.offset(offset).limit(page_size).all()

    total_pages = (total + page_size - 1) // page_size

    # Build response with wine and performer names
    items = []
    for t in transactions:
        wine = db.query(Wine).filter(Wine.id == t.wine_id).first()
        performer = db.query(User).filter(User.id == t.performed_by).first() if t.performed_by else None

        items.append(TransactionResponse(
            id=t.id,
            wine_id=t.wine_id,
            transaction_type=t.transaction_type,
            quantity=t.quantity,
            reason=t.reason,
            performed_by=t.performed_by,
            created_at=t.created_at,
            wine_name=wine.name if wine else None,
            performer_name=performer.name if performer else None
        ))

    return TransactionListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.post("/in", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def stock_in(
    transaction_data: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Record stock in transaction"""
    wine = db.query(Wine).filter(Wine.id == transaction_data.wine_id).first()
    if not wine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="红酒不存在"
        )

    # Create transaction
    transaction = InventoryTransaction(
        wine_id=transaction_data.wine_id,
        transaction_type="in",
        quantity=transaction_data.quantity,
        reason=transaction_data.reason,
        performed_by=current_user.id
    )
    db.add(transaction)

    # Update wine stock
    old_stock = wine.current_stock
    wine.current_stock += transaction_data.quantity

    db.commit()
    db.refresh(transaction)

    # Log the action
    log = OperationLog(
        user_id=current_user.id,
        action_type="stock_in",
        entity_type="wine",
        entity_id=wine.id,
        details=json.dumps({
            "wine_name": wine.name,
            "quantity": transaction_data.quantity,
            "old_stock": old_stock,
            "new_stock": wine.current_stock,
            "reason": transaction_data.reason
        })
    )
    db.add(log)
    db.commit()

    return TransactionResponse(
        id=transaction.id,
        wine_id=transaction.wine_id,
        transaction_type=transaction.transaction_type,
        quantity=transaction.quantity,
        reason=transaction.reason,
        performed_by=transaction.performed_by,
        created_at=transaction.created_at,
        wine_name=wine.name,
        performer_name=current_user.name
    )


@router.post("/out", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def stock_out(
    transaction_data: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Record stock out transaction"""
    wine = db.query(Wine).filter(Wine.id == transaction_data.wine_id).first()
    if not wine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="红酒不存在"
        )

    # Check if enough stock
    if wine.current_stock < transaction_data.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"库存不足，当前库存: {wine.current_stock}"
        )

    # Create transaction
    transaction = InventoryTransaction(
        wine_id=transaction_data.wine_id,
        transaction_type="out",
        quantity=transaction_data.quantity,
        reason=transaction_data.reason,
        performed_by=current_user.id
    )
    db.add(transaction)

    # Update wine stock
    old_stock = wine.current_stock
    wine.current_stock -= transaction_data.quantity

    db.commit()
    db.refresh(transaction)

    # Log the action
    log = OperationLog(
        user_id=current_user.id,
        action_type="stock_out",
        entity_type="wine",
        entity_id=wine.id,
        details=json.dumps({
            "wine_name": wine.name,
            "quantity": transaction_data.quantity,
            "old_stock": old_stock,
            "new_stock": wine.current_stock,
            "reason": transaction_data.reason
        })
    )
    db.add(log)
    db.commit()

    return TransactionResponse(
        id=transaction.id,
        wine_id=transaction.wine_id,
        transaction_type=transaction.transaction_type,
        quantity=transaction.quantity,
        reason=transaction.reason,
        performed_by=transaction.performed_by,
        created_at=transaction.created_at,
        wine_name=wine.name,
        performer_name=current_user.name
    )


@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a single transaction by ID"""
    transaction = db.query(InventoryTransaction).filter(InventoryTransaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="交易记录不存在"
        )

    wine = db.query(Wine).filter(Wine.id == transaction.wine_id).first()
    performer = db.query(User).filter(User.id == transaction.performed_by).first() if transaction.performed_by else None

    return TransactionResponse(
        id=transaction.id,
        wine_id=transaction.wine_id,
        transaction_type=transaction.transaction_type,
        quantity=transaction.quantity,
        reason=transaction.reason,
        performed_by=transaction.performed_by,
        created_at=transaction.created_at,
        wine_name=wine.name if wine else None,
        performer_name=performer.name if performer else None
    )


@router.get("/wine/{wine_id}", response_model=List[TransactionResponse])
def get_wine_transactions(
    wine_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all transactions for a specific wine"""
    wine = db.query(Wine).filter(Wine.id == wine_id).first()
    if not wine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="红酒不存在"
        )

    transactions = db.query(InventoryTransaction).filter(
        InventoryTransaction.wine_id == wine_id
    ).order_by(InventoryTransaction.created_at.desc()).all()

    items = []
    for t in transactions:
        performer = db.query(User).filter(User.id == t.performed_by).first() if t.performed_by else None
        items.append(TransactionResponse(
            id=t.id,
            wine_id=t.wine_id,
            transaction_type=t.transaction_type,
            quantity=t.quantity,
            reason=t.reason,
            performed_by=t.performed_by,
            created_at=t.created_at,
            wine_name=wine.name,
            performer_name=performer.name if performer else None
        ))

    return items

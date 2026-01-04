from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from database import get_db
from models import User, OperationLog
from schemas import LogResponse, LogListResponse
from auth import get_current_user, get_current_admin_user

router = APIRouter()


@router.get("")
def list_logs(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    user_id: Optional[int] = None,
    action_type: Optional[str] = None,
    entity_type: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List operation logs"""
    query = db.query(OperationLog)

    # Non-admin users can only see their own logs
    if current_user.role != "admin":
        query = query.filter(OperationLog.user_id == current_user.id)
    elif user_id:
        query = query.filter(OperationLog.user_id == user_id)

    if action_type:
        query = query.filter(OperationLog.action_type == action_type)

    if entity_type:
        query = query.filter(OperationLog.entity_type == entity_type)

    if start_date:
        try:
            start = datetime.fromisoformat(start_date)
            query = query.filter(OperationLog.created_at >= start)
        except ValueError:
            pass

    if end_date:
        try:
            end = datetime.fromisoformat(end_date)
            query = query.filter(OperationLog.created_at <= end)
        except ValueError:
            pass

    total = query.count()
    total_pages = (total + page_size - 1) // page_size

    logs = query.order_by(OperationLog.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    # Add user names to logs
    items = []
    for log in logs:
        log_dict = {
            "id": log.id,
            "user_id": log.user_id,
            "user_name": log.user.name if log.user else None,
            "action_type": log.action_type,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "details": log.details,
            "ip_address": log.ip_address,
            "created_at": log.created_at
        }
        items.append(LogResponse(**log_dict))

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }


@router.get("/{log_id}", response_model=LogResponse)
def get_log(
    log_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a single log entry"""
    log = db.query(OperationLog).filter(OperationLog.id == log_id).first()

    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="日志不存在"
        )

    # Non-admin users can only see their own logs
    if current_user.role != "admin" and log.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权访问此日志"
        )

    return LogResponse(
        id=log.id,
        user_id=log.user_id,
        user_name=log.user.name if log.user else None,
        action_type=log.action_type,
        entity_type=log.entity_type,
        entity_id=log.entity_id,
        details=log.details,
        ip_address=log.ip_address,
        created_at=log.created_at
    )

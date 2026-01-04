from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
import json

from database import get_db
from models import User, OperationLog
from schemas import UserCreate, UserUpdate, UserResponse
from auth import get_current_user, get_current_admin_user, get_password_hash

router = APIRouter()


@router.get("")
def list_users(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    search: Optional[str] = None,
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """List all users (admin only)"""
    query = db.query(User)

    if search:
        query = query.filter(
            (User.name.ilike(f"%{search}%")) |
            (User.email.ilike(f"%{search}%"))
        )

    if role:
        query = query.filter(User.role == role)

    if is_active is not None:
        query = query.filter(User.is_active == is_active)

    total = query.count()
    total_pages = (total + page_size - 1) // page_size

    users = query.order_by(User.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": [UserResponse.model_validate(u) for u in users],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_data: UserCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new user (admin only)"""
    # Check if email already exists
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该邮箱已被注册"
        )

    # Create user
    user = User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        name=user_data.name,
        role=user_data.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Log the action
    log = OperationLog(
        user_id=current_user.id,
        action_type="create",
        entity_type="user",
        entity_id=user.id,
        details=json.dumps({"email": user.email, "name": user.name, "role": user.role})
    )
    db.add(log)
    db.commit()

    return user


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a single user"""
    # Users can only view themselves unless they're admin
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权访问此用户信息"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )

    return user


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a user"""
    # Users can only update themselves unless they're admin
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权修改此用户信息"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )

    # Only admin can change role
    if user_data.role and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只有管理员可以修改用户角色"
        )

    # Check email uniqueness
    if user_data.email and user_data.email != user.email:
        existing = db.query(User).filter(User.email == user_data.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="该邮箱已被使用"
            )

    # Update fields
    old_data = {"email": user.email, "name": user.name, "role": user.role}

    if user_data.email:
        user.email = user_data.email
    if user_data.name:
        user.name = user_data.name
    if user_data.role and current_user.role == "admin":
        user.role = user_data.role
    if user_data.is_active is not None and current_user.role == "admin":
        user.is_active = user_data.is_active

    db.commit()
    db.refresh(user)

    # Log the action
    new_data = {"email": user.email, "name": user.name, "role": user.role}
    log = OperationLog(
        user_id=current_user.id,
        action_type="update",
        entity_type="user",
        entity_id=user.id,
        details=json.dumps({"old": old_data, "new": new_data})
    )
    db.add(log)
    db.commit()

    return user


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a user (admin only)"""
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="不能删除自己的账户"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )

    # Log before deletion
    log = OperationLog(
        user_id=current_user.id,
        action_type="delete",
        entity_type="user",
        entity_id=user.id,
        details=json.dumps({"email": user.email, "name": user.name})
    )
    db.add(log)

    db.delete(user)
    db.commit()

    return {"message": "用户已删除"}


@router.put("/{user_id}/status")
def toggle_user_status(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Toggle user active status (admin only)"""
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="不能禁用自己的账户"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )

    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)

    # Log the action
    log = OperationLog(
        user_id=current_user.id,
        action_type="status_change",
        entity_type="user",
        entity_id=user.id,
        details=json.dumps({"email": user.email, "is_active": user.is_active})
    )
    db.add(log)
    db.commit()

    status_text = "启用" if user.is_active else "禁用"
    return {"message": f"用户已{status_text}", "is_active": user.is_active}

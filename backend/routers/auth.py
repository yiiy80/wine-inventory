from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from database import get_db
from models import User, OperationLog
from schemas import UserLogin, Token, UserResponse, PasswordChange, ForgotPassword, PasswordReset, UserUpdate
from auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
    create_password_reset_token,
    verify_password_reset_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
import json

router = APIRouter()


@router.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """User login endpoint"""
    print(f"[LOGIN] Attempting login for email: {user_data.email}")
    user = db.query(User).filter(User.email == user_data.email).first()

    if not user:
        print(f"[LOGIN] User not found: {user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="邮箱或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )

    print(f"[LOGIN] User found: {user.email}, checking password...")
    password_valid = verify_password(user_data.password, user.password_hash)
    print(f"[LOGIN] Password valid: {password_valid}")

    if not password_valid:
        print(f"[LOGIN] Invalid password for user: {user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="邮箱或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="用户账户已被禁用"
        )

    # Create access token
    expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    if user_data.remember_me:
        expires_delta = timedelta(days=7)

    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=expires_delta
    )

    # Log the login action
    log = OperationLog(
        user_id=user.id,
        action_type="login",
        entity_type="user",
        entity_id=user.id,
        details=json.dumps({"email": user.email})
    )
    db.add(log)
    db.commit()

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """User logout endpoint"""
    # Log the logout action
    log = OperationLog(
        user_id=current_user.id,
        action_type="logout",
        entity_type="user",
        entity_id=current_user.id,
        details=json.dumps({"email": current_user.email})
    )
    db.add(log)
    db.commit()

    return {"message": "登出成功"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return current_user


@router.put("/profile", response_model=UserResponse)
def update_profile(
    profile_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user profile"""
    if profile_data.email and profile_data.email != current_user.email:
        existing = db.query(User).filter(User.email == profile_data.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="该邮箱已被使用"
            )
        current_user.email = profile_data.email

    if profile_data.name:
        current_user.name = profile_data.name

    db.commit()
    db.refresh(current_user)

    return current_user


@router.put("/password")
def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change current user password"""
    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="当前密码错误"
        )

    current_user.password_hash = get_password_hash(password_data.new_password)
    db.commit()

    # Log password change
    log = OperationLog(
        user_id=current_user.id,
        action_type="password_change",
        entity_type="user",
        entity_id=current_user.id,
        details=json.dumps({"email": current_user.email})
    )
    db.add(log)
    db.commit()

    return {"message": "密码修改成功"}


@router.post("/forgot-password")
def forgot_password(data: ForgotPassword, db: Session = Depends(get_db)):
    """Request password reset"""
    user = db.query(User).filter(User.email == data.email).first()

    # Always return success to prevent email enumeration
    if user:
        token = create_password_reset_token(user.email)
        # In development, print the reset link to console
        reset_link = f"http://localhost:5173/reset-password?token={token}"
        print(f"\n{'='*60}")
        print(f"Password Reset Link for {user.email}:")
        print(f"{reset_link}")
        print(f"{'='*60}\n")

    return {"message": "如果该邮箱存在，重置链接已发送"}


@router.post("/reset-password")
def reset_password(data: PasswordReset, db: Session = Depends(get_db)):
    """Reset password with token"""
    email = verify_password_reset_token(data.token)

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效或过期的重置令牌"
        )

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )

    user.password_hash = get_password_hash(data.new_password)
    db.commit()

    return {"message": "密码重置成功"}


@router.post("/refresh", response_model=Token)
def refresh_token(current_user: User = Depends(get_current_user)):
    """Refresh access token"""
    access_token = create_access_token(
        data={"sub": current_user.id},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(current_user)
    )

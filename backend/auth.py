from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from database import get_db
from models import User

# Security configuration
SECRET_KEY = "wine-inventory-secret-key-change-in-production-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    # Convert sub to string if it's an integer (python-jose requires string)
    if "sub" in to_encode and isinstance(to_encode["sub"], int):
        to_encode["sub"] = str(to_encode["sub"])
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无法验证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )

    print(f"[DEBUG] Credentials received: {credentials}")
    if credentials is None:
        print("[DEBUG] No credentials provided")
        raise credentials_exception

    token = credentials.credentials
    print(f"[DEBUG] Token extracted: {token[:50] if token else 'None'}...")
    payload = decode_token(token)
    print(f"[DEBUG] Token payload: {payload}")

    if payload is None:
        print("[DEBUG] Payload is None")
        raise credentials_exception

    user_id_str = payload.get("sub")
    print(f"[DEBUG] User ID (string): {user_id_str}")
    if user_id_str is None:
        raise credentials_exception

    try:
        user_id = int(user_id_str)
    except (ValueError, TypeError):
        print(f"[DEBUG] Invalid user ID format: {user_id_str}")
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    print(f"[DEBUG] User found: {user.email if user else 'None'}")
    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="用户账户已被禁用"
        )

    return user


async def get_current_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="需要管理员权限"
        )
    return current_user


def create_password_reset_token(email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=1)
    to_encode = {"sub": email, "exp": expire, "type": "password_reset"}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_password_reset_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "password_reset":
            return None
        return payload.get("sub")
    except JWTError:
        return None

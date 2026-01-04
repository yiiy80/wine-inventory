from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


# User schemas
class UserBase(BaseModel):
    email: str
    name: str


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    role: str = "user"


class UserUpdate(BaseModel):
    email: Optional[str] = None
    name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: str
    password: str
    remember_me: bool = False


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class TokenData(BaseModel):
    user_id: Optional[int] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


class PasswordReset(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)


class ForgotPassword(BaseModel):
    email: str


# Wine schemas
class WineBase(BaseModel):
    name: str
    vintage_year: int = Field(..., ge=1900, le=2100)
    region: str
    grape_variety: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)
    supplier: Optional[str] = None
    storage_location: Optional[str] = None
    current_stock: int = Field(default=0, ge=0)
    low_stock_threshold: int = Field(default=10, ge=0)
    notes: Optional[str] = None
    image_url: Optional[str] = None


class WineCreate(WineBase):
    pass


class WineUpdate(BaseModel):
    name: Optional[str] = None
    vintage_year: Optional[int] = Field(None, ge=1900, le=2100)
    region: Optional[str] = None
    grape_variety: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)
    supplier: Optional[str] = None
    storage_location: Optional[str] = None
    current_stock: Optional[int] = Field(None, ge=0)
    low_stock_threshold: Optional[int] = Field(None, ge=0)
    notes: Optional[str] = None
    image_url: Optional[str] = None


class WineResponse(WineBase):
    id: int
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class WineListResponse(BaseModel):
    items: List[WineResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# Inventory transaction schemas
class TransactionBase(BaseModel):
    wine_id: int
    quantity: int = Field(..., gt=0)
    reason: Optional[str] = None


class TransactionCreate(TransactionBase):
    pass


class TransactionResponse(BaseModel):
    id: int
    wine_id: int
    transaction_type: str
    quantity: int
    reason: Optional[str] = None
    performed_by: Optional[int] = None
    created_at: datetime
    wine_name: Optional[str] = None
    performer_name: Optional[str] = None

    class Config:
        from_attributes = True


class TransactionListResponse(BaseModel):
    items: List[TransactionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# Dashboard schemas
class DashboardSummary(BaseModel):
    total_wines: int
    total_stock: int
    total_value: float
    low_stock_count: int
    out_of_stock_count: int


class StockTrend(BaseModel):
    date: str
    stock_in: int
    stock_out: int


class StockDistribution(BaseModel):
    name: str
    value: int


# Operation log schemas
class LogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    action_type: str
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    details: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class LogListResponse(BaseModel):
    items: List[LogResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

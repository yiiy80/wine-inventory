from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False, default="user")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    wines = relationship("Wine", back_populates="creator")
    transactions = relationship("InventoryTransaction", back_populates="performer")
    logs = relationship("OperationLog", back_populates="user")


class Wine(Base):
    __tablename__ = "wines"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    vintage_year = Column(Integer, nullable=False)
    region = Column(String, nullable=False)
    grape_variety = Column(String)
    price = Column(Float)
    supplier = Column(String)
    storage_location = Column(String)
    current_stock = Column(Integer, default=0)
    low_stock_threshold = Column(Integer, default=10)
    notes = Column(Text)
    image_url = Column(String)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    creator = relationship("User", back_populates="wines")
    transactions = relationship("InventoryTransaction", back_populates="wine", cascade="all, delete-orphan")


class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    wine_id = Column(Integer, ForeignKey("wines.id", ondelete="CASCADE"), nullable=False)
    transaction_type = Column(String, nullable=False)  # 'in' or 'out'
    quantity = Column(Integer, nullable=False)
    reason = Column(Text)
    performed_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    wine = relationship("Wine", back_populates="transactions")
    performer = relationship("User", back_populates="transactions")


class OperationLog(Base):
    __tablename__ = "operation_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action_type = Column(String, nullable=False)
    entity_type = Column(String)
    entity_id = Column(Integer)
    details = Column(Text)  # JSON format
    ip_address = Column(String)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="logs")

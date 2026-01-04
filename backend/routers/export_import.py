from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional
import csv
import io
import json
from datetime import datetime

from database import get_db
from models import User, Wine, InventoryTransaction, OperationLog
from schemas import WineCreate
from auth import get_current_user, get_password_hash

router = APIRouter()


@router.get("/export/wines")
def export_wines(
    format: str = Query(default="csv", regex="^(csv|excel)$"),
    region: Optional[str] = None,
    grape_variety: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export wines to CSV or Excel format"""
    query = db.query(Wine)

    if region:
        query = query.filter(Wine.region == region)
    if grape_variety:
        query = query.filter(Wine.grape_variety == grape_variety)

    wines = query.all()

    # Create CSV content
    output = io.StringIO()
    writer = csv.writer(output)

    # Header row
    writer.writerow([
        "ID", "名称", "年份", "产区", "葡萄品种", "价格",
        "供应商", "存放位置", "当前库存", "低库存阈值", "备注"
    ])

    # Data rows
    for wine in wines:
        writer.writerow([
            wine.id,
            wine.name,
            wine.vintage_year,
            wine.region,
            wine.grape_variety or "",
            wine.price or "",
            wine.supplier or "",
            wine.storage_location or "",
            wine.current_stock,
            wine.low_stock_threshold,
            wine.notes or ""
        ])

    output.seek(0)

    # Log the export
    log = OperationLog(
        user_id=current_user.id,
        action_type="export",
        entity_type="wine",
        details=json.dumps({"count": len(wines), "format": format})
    )
    db.add(log)
    db.commit()

    filename = f"wines_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/export/transactions")
def export_transactions(
    format: str = Query(default="csv", regex="^(csv|excel)$"),
    transaction_type: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export inventory transactions to CSV"""
    query = db.query(InventoryTransaction)

    if transaction_type:
        query = query.filter(InventoryTransaction.transaction_type == transaction_type)

    if start_date:
        try:
            start = datetime.fromisoformat(start_date)
            query = query.filter(InventoryTransaction.created_at >= start)
        except ValueError:
            pass

    if end_date:
        try:
            end = datetime.fromisoformat(end_date)
            query = query.filter(InventoryTransaction.created_at <= end)
        except ValueError:
            pass

    transactions = query.order_by(InventoryTransaction.created_at.desc()).all()

    # Create CSV content
    output = io.StringIO()
    writer = csv.writer(output)

    # Header row
    writer.writerow([
        "ID", "红酒ID", "红酒名称", "操作类型", "数量", "原因", "操作人", "操作时间"
    ])

    # Data rows
    for t in transactions:
        writer.writerow([
            t.id,
            t.wine_id,
            t.wine.name if t.wine else "",
            "入库" if t.transaction_type == "in" else "出库",
            t.quantity,
            t.reason or "",
            t.performer.name if t.performer else "",
            t.created_at.strftime("%Y-%m-%d %H:%M:%S") if t.created_at else ""
        ])

    output.seek(0)

    # Log the export
    log = OperationLog(
        user_id=current_user.id,
        action_type="export",
        entity_type="transaction",
        details=json.dumps({"count": len(transactions), "format": format})
    )
    db.add(log)
    db.commit()

    filename = f"transactions_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.post("/import/wines")
async def import_wines(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Import wines from CSV file"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="只支持CSV文件格式"
        )

    content = await file.read()

    try:
        decoded = content.decode('utf-8')
    except UnicodeDecodeError:
        try:
            decoded = content.decode('gbk')
        except UnicodeDecodeError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="无法解析文件编码，请使用UTF-8或GBK编码"
            )

    reader = csv.DictReader(io.StringIO(decoded))

    created_count = 0
    errors = []

    for row_num, row in enumerate(reader, start=2):
        try:
            # Map Chinese headers to English field names
            name = row.get('名称') or row.get('name')
            vintage_year = row.get('年份') or row.get('vintage_year')
            region = row.get('产区') or row.get('region')
            grape_variety = row.get('葡萄品种') or row.get('grape_variety')
            price = row.get('价格') or row.get('price')
            supplier = row.get('供应商') or row.get('supplier')
            storage_location = row.get('存放位置') or row.get('storage_location')
            current_stock = row.get('当前库存') or row.get('current_stock')
            low_stock_threshold = row.get('低库存阈值') or row.get('low_stock_threshold')
            notes = row.get('备注') or row.get('notes')

            if not name or not vintage_year or not region:
                errors.append(f"第{row_num}行: 名称、年份和产区为必填项")
                continue

            wine = Wine(
                name=name,
                vintage_year=int(vintage_year),
                region=region,
                grape_variety=grape_variety if grape_variety else None,
                price=float(price) if price else None,
                supplier=supplier if supplier else None,
                storage_location=storage_location if storage_location else None,
                current_stock=int(current_stock) if current_stock else 0,
                low_stock_threshold=int(low_stock_threshold) if low_stock_threshold else 10,
                notes=notes if notes else None,
                created_by=current_user.id
            )
            db.add(wine)
            created_count += 1

        except ValueError as e:
            errors.append(f"第{row_num}行: 数据格式错误 - {str(e)}")
        except Exception as e:
            errors.append(f"第{row_num}行: {str(e)}")

    if created_count > 0:
        db.commit()

        # Log the import
        log = OperationLog(
            user_id=current_user.id,
            action_type="import",
            entity_type="wine",
            details=json.dumps({"created": created_count, "errors": len(errors)})
        )
        db.add(log)
        db.commit()

    return {
        "message": f"成功导入 {created_count} 条红酒记录",
        "created": created_count,
        "errors": errors
    }

from fastapi import APIRouter, HTTPException
from ..db.mongodb import get_database
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/summary")
async def dashboard_summary():
    db = await get_database()
    now = datetime.now()
    seven_days = now + timedelta(days=7)
    # Products
    total_products = await db.products.count_documents({})
    total_stock_quantity = 0
    total_stock_value = 0.0
    low_stock_alerts = []
    out_of_stock_count = 0
    recent_stock_updates = []
    async for product in db.products.find({}):
        stock = product.get("stock", 0)
        dealer_price = product.get("dealer_price", 0)
        total_stock_quantity += stock
        total_stock_value += stock * dealer_price
        if stock < 5:
            low_stock_alerts.append({
                "name": product.get("name"),
                "stock": stock,
                "product_code": product.get("product_code"),
                "id": str(product.get("_id"))
            })
        if stock == 0:
            out_of_stock_count += 1
        # For recent stock updates, collect product and latest stock_update date
        if product.get("stock_updates"):
            last_update = max(product["stock_updates"], key=lambda s: s.get("date", datetime.min))
            recent_stock_updates.append({
                "name": product.get("name"),
                "product_code": product.get("product_code"),
                "last_stock_update": last_update.get("date"),
                "notes": last_update.get("notes"),
                "id": str(product.get("_id"))
            })
    # Sort and limit recent stock updates
    recent_stock_updates = sorted(recent_stock_updates, key=lambda x: x["last_stock_update"] or datetime.min, reverse=True)[:5]
    # Party Ledger
    total_outstanding_dues = 0.0
    upcoming_dues = []
    overdue_dues = []
    recent_payments = []
    async for entry in db.party_ledger.find({}):
        status = entry.get("status", "pending")
        amount = entry.get("amount", 0)
        due_date = entry.get("due_date")
        paid_at = entry.get("paid_at")
        # Outstanding
        if status in ("pending", "overdue"):
            total_outstanding_dues += amount
        # Upcoming
        if status != "paid" and due_date and now <= due_date <= seven_days:
            upcoming_dues.append({
                "amount": amount,
                "due_date": due_date,
                "dealer_id": entry.get("dealer_id"),
                "id": str(entry.get("_id")),
                "notes": entry.get("notes")
            })
        # Overdue
        if status != "paid" and due_date and due_date < now:
            overdue_dues.append({
                "amount": amount,
                "due_date": due_date,
                "dealer_id": entry.get("dealer_id"),
                "id": str(entry.get("_id")),
                "notes": entry.get("notes")
            })
        # Recent payments
        if status == "paid" and paid_at:
            recent_payments.append({
                "amount": amount,
                "paid_at": paid_at,
                "dealer_id": entry.get("dealer_id"),
                "id": str(entry.get("_id")),
                "notes": entry.get("notes")
            })
    recent_payments = sorted(recent_payments, key=lambda x: x["paid_at"] or datetime.min, reverse=True)[:5]
    return {
        "total_products": total_products,
        "total_stock_quantity": total_stock_quantity,
        "total_stock_value": total_stock_value,
        "low_stock_alerts": {
            "count": len(low_stock_alerts),
            "products": low_stock_alerts
        },
        "out_of_stock_count": out_of_stock_count,
        "total_outstanding_dues": total_outstanding_dues,
        "upcoming_dues": {
            "count": len(upcoming_dues),
            "dues": upcoming_dues
        },
        "overdue_dues": {
            "count": len(overdue_dues),
            "dues": overdue_dues
        },
        "recent_stock_updates": recent_stock_updates,
        "recent_payments": recent_payments
    } 
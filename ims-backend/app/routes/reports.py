from fastapi import APIRouter, Query
from ..db.mongodb import get_database
from datetime import datetime
from collections import defaultdict

router = APIRouter(prefix="/api/reports", tags=["reports"])

@router.get("/category-wise")
async def category_wise_report():
    db = await get_database()
    # Aggregate stock and value per category
    category_data = defaultdict(lambda: {"stock": 0, "value": 0.0})
    async for product in db.products.find({}):
        cat_id = product.get("category_id")
        stock = product.get("stock", 0)
        price = product.get("dealer_price", 0)
        category_data[cat_id]["stock"] += stock
        category_data[cat_id]["value"] += stock * price
    # Get category names
    categories = {str(cat["_id"]): cat["name"] for cat in await db.categories.find({}).to_list(length=100)}
    result = []
    for cat_id, data in category_data.items():
        result.append({
            "category_id": cat_id,
            "category_name": categories.get(cat_id, "Unknown"),
            "stock": data["stock"],
            "value": data["value"]
        })
    return result

@router.get("/monthly-stock")
async def monthly_stock_report():
    db = await get_database()
    # Aggregate stock additions per month
    monthly = defaultdict(int)
    async for product in db.products.find({}):
        for update in product.get("stock_updates", []):
            date = update.get("date")
            qty = update.get("quantity", 0)
            if date:
                month = date.strftime("%Y-%m")
                monthly[month] += qty
    # Return sorted by month
    return [
        {"month": month, "stock_added": qty}
        for month, qty in sorted(monthly.items())
    ]

@router.get("/dues-summary")
async def dues_summary_report():
    db = await get_database()
    summary = {"pending": 0.0, "paid": 0.0, "overdue": 0.0}
    now = datetime.now()
    async for entry in db.party_ledger.find({}):
        status = entry.get("status", "pending")
        amount = entry.get("amount", 0)
        due_date = entry.get("due_date")
        if status == "paid":
            summary["paid"] += amount
        elif status == "overdue" or (status != "paid" and due_date and due_date < now):
            summary["overdue"] += amount
        else:
            summary["pending"] += amount
    return summary

@router.get("/stock-value")
async def stock_value_report(group_by_category: bool = Query(False)):
    db = await get_database()
    if group_by_category:
        category_values = defaultdict(float)
        async for product in db.products.find({}):
            cat_id = product.get("category_id")
            stock = product.get("stock", 0)
            price = product.get("dealer_price", 0)
            category_values[cat_id] += stock * price
        categories = {str(cat["_id"]): cat["name"] for cat in await db.categories.find({}).to_list(length=100)}
        return [
            {"category_id": cat_id, "category_name": categories.get(cat_id, "Unknown"), "value": value}
            for cat_id, value in category_values.items()
        ]
    else:
        total_value = 0.0
        async for product in db.products.find({}):
            stock = product.get("stock", 0)
            price = product.get("dealer_price", 0)
            total_value += stock * price
        return {"total_stock_value": total_value} 
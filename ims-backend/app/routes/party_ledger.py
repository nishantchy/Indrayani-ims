from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional
from ..schemas.party_ledger import PartyLedgerCreate, PartyLedgerUpdate, PartyLedgerOut
from ..models.party_ledger import PartyLedgerModel
from ..db.mongodb import get_database
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/party-ledger", tags=["party_ledger"])

@router.post("/", response_model=PartyLedgerOut, status_code=status.HTTP_201_CREATED)
async def create_ledger(entry: PartyLedgerCreate):
    db = await get_database()
    # Validate dealer_id
    try:
        dealer_obj_id = ObjectId(entry.dealer_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid dealer_id format. Must be a 24-character hex string.")
    dealer = await db.dealers.find_one({"_id": dealer_obj_id})
    if not dealer:
        raise HTTPException(status_code=400, detail="Dealer not found")
    now = datetime.now()
    entry_dict = entry.model_dump()
    entry_dict.update({
        "created_at": now,
        "status": entry_dict.get("status", "pending"),
        "paid_at": None
    })
    result = await db.party_ledger.insert_one(entry_dict)
    if result.inserted_id:
        entry_dict["_id"] = str(result.inserted_id)
        return PartyLedgerOut(**entry_dict)
    raise HTTPException(status_code=500, detail="Failed to create ledger entry")

@router.get("/", response_model=List[PartyLedgerOut])
async def list_ledgers(
    dealer_id: Optional[str] = None,
    status: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    db = await get_database()
    query = {}
    if dealer_id:
        query["dealer_id"] = dealer_id
    if status:
        query["status"] = status
    if date_from or date_to:
        query["due_date"] = {}
        if date_from:
            query["due_date"]["$gte"] = date_from
        if date_to:
            query["due_date"]["$lte"] = date_to
    ledgers = await db.party_ledger.find(query).skip(skip).limit(limit).to_list(length=limit)
    for l in ledgers:
        l["_id"] = str(l["_id"])
    return [PartyLedgerOut(**l) for l in ledgers]

@router.get("/{ledger_id}", response_model=PartyLedgerOut)
async def get_ledger(ledger_id: str):
    db = await get_database()
    ledger = await db.party_ledger.find_one({"_id": ObjectId(ledger_id)})
    if not ledger:
        raise HTTPException(status_code=404, detail="Ledger entry not found")
    ledger["_id"] = str(ledger["_id"])
    return PartyLedgerOut(**ledger)

@router.put("/{ledger_id}", response_model=PartyLedgerOut)
async def update_ledger(ledger_id: str, update: PartyLedgerUpdate):
    db = await get_database()
    update_data = {k: v for k, v in update.model_dump(exclude_unset=True).items()}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    # If paid_at is provided, set status to 'paid'
    if "paid_at" in update_data and update_data["paid_at"] is not None:
        update_data["status"] = "paid"
    updated = await db.party_ledger.find_one_and_update(
        {"_id": ObjectId(ledger_id)},
        {"$set": update_data},
        return_document=True
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Ledger entry not found")
    updated["_id"] = str(updated["_id"])
    return PartyLedgerOut(**updated)

@router.delete("/{ledger_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ledger(ledger_id: str):
    db = await get_database()
    result = await db.party_ledger.delete_one({"_id": ObjectId(ledger_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Ledger entry not found")
    return

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class PartyLedgerBase(BaseModel):
    dealer_id: str = Field(...)
    amount: float = Field(..., ge=0)
    due_date: datetime
    status: str = "pending"  # 'pending', 'paid', 'overdue'
    notes: Optional[str] = None

class PartyLedgerCreate(PartyLedgerBase):
    pass

class PartyLedgerUpdate(BaseModel):
    amount: Optional[float] = Field(None, ge=0)
    due_date: Optional[datetime] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    paid_at: Optional[datetime] = None

class PartyLedgerOut(PartyLedgerBase):
    id: str = Field(alias="_id")
    created_at: datetime
    paid_at: Optional[datetime] = None

    class Config:
        orm_mode = True

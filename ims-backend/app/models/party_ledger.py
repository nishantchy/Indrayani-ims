from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class PartyLedgerModel(BaseModel):
    id: str = Field(alias="_id")
    dealer_id: str
    amount: float = Field(..., ge=0)
    due_date: datetime
    status: str = "pending"  # 'pending', 'paid', 'overdue'
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    paid_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

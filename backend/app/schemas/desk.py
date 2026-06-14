from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DeskOut(BaseModel):
    id: int
    desk_code: str
    section: str
    pos_x: float
    pos_y: float
    status: str

    class Config:
        from_attributes = True

class BookingOut(BaseModel):
    id: int
    desk_id: int
    desk_code: str
    checked_in_at: datetime
    away_since: Optional[datetime]
    is_active: bool

    class Config:
        from_attributes = True

class CheckInRequest(BaseModel):
    desk_code: str

class MyBookingOut(BaseModel):
    desk_code: str
    desk_id: int
    checked_in_at: datetime
    away_since: Optional[datetime] = None
    prompt_sent_at: Optional[datetime] = None
    is_active: bool

class OccupantOut(BaseModel):
    name: str
    email: str
    checked_in_at: datetime
    away_since: Optional[datetime] = None
    prompt_sent_at: Optional[datetime] = None

class AdminDeskOut(DeskOut):
    occupant: Optional[OccupantOut] = None

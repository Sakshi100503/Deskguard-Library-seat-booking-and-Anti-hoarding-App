from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from datetime import datetime
from app.core.database import get_db
from app.core.auth import get_current_user, require_librarian
from app.models.user import User
from app.models.desk import Desk
from app.models.booking import Booking
from app.schemas.desk import DeskOut, CheckInRequest, MyBookingOut, AdminDeskOut, OccupantOut

router = APIRouter(prefix="/desks", tags=["desks"])

@router.get("/", response_model=list[DeskOut])
async def list_desks(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Desk).order_by(Desk.desk_code))
    return result.scalars().all()

@router.get("/my-booking", response_model=Optional[MyBookingOut])
async def my_booking(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Booking).where(Booking.user_id == current_user.id, Booking.is_active == True)
    )
    booking = result.scalar_one_or_none()
    if not booking:
        return None
    desk = await db.get(Desk, booking.desk_id)
    return MyBookingOut(
        desk_code=desk.desk_code,
        desk_id=booking.desk_id,
        checked_in_at=booking.checked_in_at,
        away_since=booking.away_since,
        prompt_sent_at=booking.prompt_sent_at,
        is_active=booking.is_active,
    )

@router.get("/admin", response_model=list[AdminDeskOut])
async def admin_desks(_: User = Depends(require_librarian), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Desk).order_by(Desk.desk_code))
    desks = result.scalars().all()

    out = []
    for desk in desks:
        b_result = await db.execute(
            select(Booking).where(Booking.desk_id == desk.id, Booking.is_active == True)
        )
        booking = b_result.scalar_one_or_none()
        occupant = None
        if booking:
            user = await db.get(User, booking.user_id)
            occupant = OccupantOut(
                name=user.name,
                email=user.email,
                checked_in_at=booking.checked_in_at,
                away_since=booking.away_since,
                prompt_sent_at=booking.prompt_sent_at,
            )
        out.append(AdminDeskOut(
            id=desk.id,
            desk_code=desk.desk_code,
            section=desk.section,
            pos_x=desk.pos_x,
            pos_y=desk.pos_y,
            status=desk.status,
            occupant=occupant,
        ))
    return out

@router.post("/checkin")
async def check_in(payload: CheckInRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Desk).where(Desk.desk_code == payload.desk_code))
    desk = result.scalar_one_or_none()
    if not desk:
        raise HTTPException(status_code=404, detail="Desk not found")
    if desk.status != "FREE":
        raise HTTPException(status_code=400, detail=f"Desk is currently {desk.status}")

    old = await db.execute(
        select(Booking).where(Booking.user_id == current_user.id, Booking.is_active == True)
    )
    for b in old.scalars().all():
        b.is_active = False
        b.released_at = datetime.utcnow()
        old_desk = await db.get(Desk, b.desk_id)
        if old_desk:
            old_desk.status = "FREE"

    booking = Booking(user_id=current_user.id, desk_id=desk.id)
    desk.status = "OCCUPIED"
    db.add(booking)
    await db.commit()
    return {"message": f"Checked in to desk {desk.desk_code}"}

@router.post("/away")
async def go_away(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Booking).where(Booking.user_id == current_user.id, Booking.is_active == True)
    )
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="No active booking found")

    desk = await db.get(Desk, booking.desk_id)
    desk.status = "AWAY"
    booking.away_since = datetime.utcnow()
    await db.commit()
    return {"message": "Status set to Away. You have 20 minutes."}

@router.post("/return")
async def return_to_desk(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Booking).where(Booking.user_id == current_user.id, Booking.is_active == True)
    )
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="No active booking found")

    desk = await db.get(Desk, booking.desk_id)
    desk.status = "OCCUPIED"
    booking.away_since = None
    booking.prompt_sent_at = None
    await db.commit()
    return {"message": "Welcome back! Desk marked as Occupied."}

@router.post("/release")
async def release_desk(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Booking).where(Booking.user_id == current_user.id, Booking.is_active == True)
    )
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="No active booking found")

    desk = await db.get(Desk, booking.desk_id)
    desk.status = "FREE"
    booking.is_active = False
    booking.released_at = datetime.utcnow()
    await db.commit()
    return {"message": "Desk released. Thank you!"}

@router.post("/{desk_code}/reset")
async def librarian_reset(desk_code: str, _: User = Depends(require_librarian), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Desk).where(Desk.desk_code == desk_code))
    desk = result.scalar_one_or_none()
    if not desk:
        raise HTTPException(status_code=404, detail="Desk not found")

    result2 = await db.execute(
        select(Booking).where(Booking.desk_id == desk.id, Booking.is_active == True)
    )
    booking = result2.scalar_one_or_none()
    if booking:
        booking.is_active = False
        booking.released_at = datetime.utcnow()

    desk.status = "FREE"
    await db.commit()
    return {"message": f"Desk {desk_code} reset to FREE by librarian"}

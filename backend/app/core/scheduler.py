from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.booking import Booking
from app.models.desk import Desk
from datetime import datetime, timedelta

scheduler = AsyncIOScheduler()

async def sweep_desks():
    """
    Runs every 60 seconds.
    - Bookings Away > 20 min  → mark desk ABANDONED, close booking
    - Bookings active > 2 hrs → set prompt_sent_at (frontend polls this to show 'Still here?')
    - If prompt sent > 5 min ago with no response → mark ABANDONED
    """
    now = datetime.utcnow()
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Booking).where(Booking.is_active == True)
        )
        bookings = result.scalars().all()

        for booking in bookings:
            desk = await db.get(Desk, booking.desk_id)
            if not desk:
                continue

            # Away > 20 minutes → ABANDONED
            if booking.away_since and (now - booking.away_since) > timedelta(minutes=20):
                desk.status = "ABANDONED"
                booking.is_active = False
                booking.released_at = now
                continue

            # Active > 2 hours without prompt → send "Still here?" by setting prompt_sent_at
            if (
                not booking.away_since
                and not booking.prompt_sent_at
                and (now - booking.checked_in_at) > timedelta(hours=2)
            ):
                booking.prompt_sent_at = now
                continue

            # Prompt sent > 5 minutes ago, no response (still active, still occupied) → ABANDONED
            if (
                booking.prompt_sent_at
                and (now - booking.prompt_sent_at) > timedelta(minutes=5)
                and desk.status == "OCCUPIED"
            ):
                desk.status = "ABANDONED"
                booking.is_active = False
                booking.released_at = now

        await db.commit()

def start_scheduler():
    scheduler.add_job(sweep_desks, "interval", seconds=60, id="desk_sweep")
    scheduler.start()

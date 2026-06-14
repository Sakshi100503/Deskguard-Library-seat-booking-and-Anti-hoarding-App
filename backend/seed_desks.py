"""
Run once to seed the desks table.
Usage: python seed_desks.py
"""
import asyncio
from app.core.database import engine, AsyncSessionLocal, Base
from app.models.desk import Desk

ZONE_META = {
    'A': ('Ground floor', 0),
    'B': ('Reading room', 500),
    'C': ('Silent zone', 1000),
    'D': ('Computer lab', 1500),
    'E': ('Study pods', 2000),
}

# 125 desks — 5 zones × 25 desks each
DESKS = []
for zone, (_, base_y) in ZONE_META.items():
    for i in range(1, 26):
        col = (i - 1) % 5
        row = (i - 1) // 5
        DESKS.append({
            "desk_code": f"{zone}{i}",
            "section": zone,
            "pos_x": (col + 1) * 80,
            "pos_y": base_y + row * 80,
        })

async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as db:
        from sqlalchemy import select
        added = 0
        for d in DESKS:
            result = await db.execute(select(Desk).where(Desk.desk_code == d["desk_code"]))
            if not result.scalar_one_or_none():
                db.add(Desk(**d))
                added += 1
        await db.commit()
        print(f"Seeded {added} new desks ({len(DESKS)} total defined).")

if __name__ == "__main__":
    asyncio.run(seed())

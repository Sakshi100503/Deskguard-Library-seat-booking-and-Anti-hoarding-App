from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    desk_id = Column(Integer, ForeignKey("desks.id"), nullable=False)

    checked_in_at = Column(DateTime, default=datetime.utcnow)
    away_since = Column(DateTime, nullable=True)        # set when student hits Away
    prompt_sent_at = Column(DateTime, nullable=True)    # set when "Still here?" sent
    released_at = Column(DateTime, nullable=True)       # set when desk is freed
    is_active = Column(Boolean, default=True)

    user = relationship("User", back_populates="bookings")
    desk = relationship("Desk", back_populates="bookings")

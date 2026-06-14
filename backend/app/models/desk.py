from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

class Desk(Base):
    __tablename__ = "desks"

    id = Column(Integer, primary_key=True, index=True)
    desk_code = Column(String, unique=True, index=True, nullable=False)  # e.g. "A1", "B3"
    section = Column(String, nullable=False)                              # e.g. "A", "B"
    # SVG map position
    pos_x = Column(Float, default=0.0)
    pos_y = Column(Float, default=0.0)
    status = Column(String, default="FREE")  # FREE | OCCUPIED | AWAY | ABANDONED

    bookings = relationship("Booking", back_populates="desk")

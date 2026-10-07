from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime

from app.database import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)

    incident_id = Column(String, unique=True, index=True)

    image_path = Column(String)

    status = Column(String, default="Created")

    hazard_type = Column(String)

    severity = Column(String)

    confidence = Column(Float)

    department = Column(String)

    latitude = Column(Float)

    longitude = Column(Float)

    created_at = Column(DateTime, default=datetime.utcnow)
    verification_status = Column(String, default="pending")
    after_image = Column(String, nullable=True)
    verified_at = Column(DateTime, nullable=True)
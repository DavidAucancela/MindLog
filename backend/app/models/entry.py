from sqlalchemy import Column, String, DateTime, Text, ForeignKey, ARRAY, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from ..database import Base


class Entry(Base):
    __tablename__ = "entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    mood = Column(String, nullable=True)
    embedding = Column(ARRAY(Float), nullable=True)  # para búsqueda semántica futura
    created_at = Column(DateTime(timezone=True), server_default=func.now())

from sqlalchemy import Column, Integer, String, DateTime, Boolean
from database.db import Base

class Password_resets(Base):
    __tablename__ = "password_resets"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    token = Column(String, index=True)
    expires_at = Column(DateTime, index=True)
    used = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, index=True)
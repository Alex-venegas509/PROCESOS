from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class PasswordResetBase(BaseModel):
    email: EmailStr
    token: Optional[str] = None
    expires_at: Optional[datetime] = None
    used: Optional[bool] = False
    created_at: Optional[datetime] = None

class PasswordResetCreate(PasswordResetBase):
    pass

class PasswordResetResponse(PasswordResetBase):
    id: int
    class Config:
        orm_mode = True

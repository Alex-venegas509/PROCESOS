from pydantic import BaseModel, EmailStr
from typing import Optional

class UsuarioBase(BaseModel):
    nombre: str
    apellido: str | None = None
    documento: str | None = None
    cedula: int
    correo: EmailStr
    contrasena: str
    tipo: str

class UsuarioCreate(UsuarioBase):
    pass

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    documento: Optional[str] = None
    cedula: Optional[int] = None
    correo: Optional[EmailStr] = None
    contrasena: Optional[str] = None
    tipo: Optional[str] = None

class UsuarioResponse(UsuarioBase):
    id: int

    class Config:
        orm_mode = True

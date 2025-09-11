from pydantic import BaseModel
from typing import Optional

class CertificacionBase(BaseModel):
    cedula: int
    ficha: int
    nombre_archivo: Optional[str] = None
    estudiantes_id: int

class CertificacionCreate(CertificacionBase):
    pass

class CertificacionUpdate(BaseModel):
    cedula: Optional[int] = None
    ficha: Optional[int] = None
    nombre_archivo: Optional[str] = None
    estudiantes_id: Optional[int] = None

class CertificacionResponse(CertificacionBase):
    id: int
    class Config:
        orm_mode = True

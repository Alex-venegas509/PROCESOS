from pydantic import BaseModel
from typing import Optional

class SeguimientoBase(BaseModel):
    cedula: int
    ficha: int
    nombre_archivo: Optional[str] = None
    estudiantes_id: int

class SeguimientoCreate(SeguimientoBase):
    pass

class SeguimientoUpdate(BaseModel):
    cedula: Optional[int] = None
    ficha: Optional[int] = None
    nombre_archivo: Optional[str] = None
    estudiantes_id: Optional[int] = None

class SeguimientoResponse(SeguimientoBase):
    id: int
    class Config:
        orm_mode = True

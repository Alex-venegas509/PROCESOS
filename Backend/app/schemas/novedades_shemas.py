from pydantic import BaseModel
from typing import Optional

class NovedadBase(BaseModel):
    cedula: int
    ficha: int
    nombre_archivo: Optional[str] = None
    estudiantes_id: int

class NovedadCreate(NovedadBase):
    pass

class NovedadUpdate(BaseModel):
    cedula: Optional[int] = None
    ficha: Optional[int] = None
    nombre_archivo: Optional[str] = None
    estudiantes_id: Optional[int] = None

class NovedadResponse(NovedadBase):
    id: int
    class Config:
        orm_mode = True

from pydantic import BaseModel
from typing import Optional

class ProductivaBase(BaseModel):
    cedula: int
    ficha: int
    discapacidad: Optional[str] = None
    cual_capacidad: Optional[str] = None
    nombre_archivo: Optional[str] = None
    estudiantes_id: int

class ProductivaCreate(ProductivaBase):
    pass

class ProductivaUpdate(BaseModel):
    cedula: Optional[int] = None
    ficha: Optional[int] = None
    discapacidad: Optional[str] = None
    cual_capacidad: Optional[str] = None
    nombre_archivo: Optional[str] = None
    estudiantes_id: Optional[int] = None

class ProductivaResponse(ProductivaBase):
    id: int
    class Config:
        orm_mode = True

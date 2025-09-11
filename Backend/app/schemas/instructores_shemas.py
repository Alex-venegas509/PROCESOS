from pydantic import BaseModel
from typing import Optional

class InstructorBase(BaseModel):
    cedula: int
    ficha: int
    nombre_archivo: Optional[str] = None
    estudiantes_id: int

class InstructorCreate(InstructorBase):
    pass

class InstructorUpdate(BaseModel):
    cedula: Optional[int] = None
    ficha: Optional[int] = None
    nombre_archivo: Optional[str] = None
    estudiantes_id: Optional[int] = None

class InstructorResponse(InstructorBase):
    id: int
    class Config:
        orm_mode = True

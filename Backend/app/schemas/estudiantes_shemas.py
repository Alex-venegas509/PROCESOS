from pydantic import BaseModel, StringConstraints, EmailStr, field_validator
from typing import Optional, Annotated, List

class EstudianteBase(BaseModel):
    nombre: str
    tipo_identificacion: str
    identificacion: Annotated[str, StringConstraints(strip_whitespace=True, min_length=5, max_length=50, pattern=r'^\d+$')]
    correo: EmailStr
    correo_institucional: Optional[EmailStr] = None
    direccion: Optional[str] = None
    celular: Optional[str] = None
    telefono: Optional[str] = None
    ficha: int
    tipo_documento: Optional[List[str]] = []   # nombre consistente con el modelo

    # Validadores para convertir "" → None
    @field_validator("correo_institucional", "direccion", "celular", "telefono", mode="before")
    def empty_string_as_none(cls, v):
        if isinstance(v, str) and v.strip() == "":
            return None
        return v

class EstudianteCreate(EstudianteBase):
    pass

class EstudianteUpdate(BaseModel):
    nombre: Optional[str] = None
    tipo_identificacion: Optional[str] = None
    identificacion: Optional[str] = None
    correo: Optional[EmailStr] = None
    correo_institucional: Optional[EmailStr] = None
    direccion: Optional[str] = None
    celular: Optional[str] = None
    telefono: Optional[str] = None
    ficha: Optional[int] = None
    tipo_documento: Optional[List[str]] = []   # igual aquí

    @field_validator("correo_institucional", "direccion", "celular", "telefono", mode="before")
    def empty_string_as_none(cls, v):
        if isinstance(v, str) and v.strip() == "":
            return None
        return v

class EstudianteResponse(EstudianteBase):
    id: int
    ruta_foto: Optional[str] = None
    ruta_documentos: Optional[str] = None

    class Config:
        from_attributes = True

from typing import Optional, List, Annotated
from pydantic import BaseModel, StringConstraints, EmailStr, field_validator

class EstudianteBase(BaseModel):
    nombre: str
    apellidos: str
    tipo_identificacion: str
    identificacion: Annotated[str, StringConstraints(
        strip_whitespace=True, min_length=5, max_length=50, pattern=r'^\d+$'
    )]
    correo: EmailStr
    correo_institucional: Optional[EmailStr] = None
    direccion: Optional[str] = None
    celular: Optional[str] = None
    telefono: Optional[str] = None
    ficha: int
    tipo_documento: Optional[List[str]] = []   # ✅ lista

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
    apellidos: Optional[str] = None
    tipo_identificacion: Optional[str] = None
    identificacion: Optional[str] = None
    correo: Optional[EmailStr] = None
    correo_institucional: Optional[EmailStr] = None
    direccion: Optional[str] = None
    celular: Optional[str] = None
    telefono: Optional[str] = None
    ficha: Optional[int] = None
    tipo_documento: Optional[List[str]] = []   # ✅ lista

    @field_validator("correo_institucional", "direccion", "celular", "telefono", mode="before")
    def empty_string_as_none(cls, v):
        if isinstance(v, str) and v.strip() == "":
            return None
        return v

class EstudianteResponse(EstudianteBase):
    id: int
    ruta_foto: Optional[str] = None
    ruta_documentos: Optional[List[str]] = None   # ✅ lista, no string

    @field_validator("ruta_documentos", mode="before")
    def parse_ruta_documentos(cls, v):
        import json
        if isinstance(v, str):   # si viene como string JSON desde la BD
            try:
                return json.loads(v)
            except:
                return []
        return v

    class Config:
        from_attributes = True


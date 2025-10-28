from pydantic import BaseModel, field_validator, StringConstraints
from typing import Optional, List, Annotated
import json

class ProductivaBase(BaseModel):
    identificacion: Annotated[str, StringConstraints(
        strip_whitespace=True, min_length=5, max_length=50, pattern=r'^\d+$'
    )]
    ficha: int
    discapacidad: Optional[str] = None
    cual_discapacidad: Optional[List[str]] = None
    tipo_documento: Optional[List[str]] = None

class ProductivaCreate(ProductivaBase):
    pass

class ProductivaUpdate(BaseModel):
    identificacion: Optional[str] = None
    ficha: Optional[int] = None
    discapacidad: Optional[str] = None
    cual_discapacidad: Optional[List[str]] = []
    tipo_documento: Optional[List[str]] = []

class ProductivaResponse(ProductivaBase):
    id: int
    ruta_documentos: Optional[List[str]] = None

    # ✅ Si viene como string JSON desde la BD, se convierte en lista
    @field_validator("ruta_documentos", "cual_discapacidad", "tipo_documento", mode="before")
    def parse_json_fields(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except:
                return []
        return v

    class Config:
        from_attributes = True

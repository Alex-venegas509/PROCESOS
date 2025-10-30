from pydantic import BaseModel

class NovedadBase(BaseModel):
    cedula: str
    ficha: str
    tipo_documento: str
    nombre_archivo: str
    ruta_archivo: str

class NovedadCreate(NovedadBase):
    pass

class NovedadResponse(NovedadBase):
    id: int

    class Config:
        orm_mode = True

